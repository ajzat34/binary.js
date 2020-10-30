const assert = require('assert');
const token = require('./token.js');
const Field = require('./field.js');
const BufferStream = require('./buffstream.js');
const Builder = require('./build.js');

const MAGIC_NUMBER = 'binary.js';

class HeaderToken extends token.Token {
}

class ParseError extends Error{
  constructor(message, code, data) {
    super(message);
    this.code = code;
    this.data = data;
  }
}

const header = new token.TokenTemplate(
  'Header',
  0x01,
  [
    Field.uint16('NULL'),

    Field.ascii('MAGIC_NUMBER'),
    Field.ascii('FORMAT_NAME'),

    Field.string('VERSION'),
    Field.string('FORMAT_VERSION'),

    Field.buffer('UNUSED'),
  ],
  HeaderToken,
);

function gen_header(format, version) {
  return header.instance({
    'NULL': 0x00,

    'MAGIC_NUMBER': MAGIC_NUMBER,
    'FORMAT_NAME': format,

    'VERSION': require('./package.json').version,
    'FORMAT_VERSION': version,

    'UNUSED': Buffer.alloc(0),
  })
}

class Format {
  /**
  * @constructor
  * @param {string} format
  * @param {Version} main
  */
  constructor(format, version, main) {
    assert(format);
    assert(typeof version === 'string');
    if (typeof main === 'function') main = main();
    assert(main instanceof Builder);
    this.version = version;
    this.format = format;
    this.versions = {};
    this.versions[version] = main;
    this.main = main;
  }

  /**
  * Add a version
  * @param {string} version
  * @param {object | function} object
  */
  set(version, object) {
    this.versions[version] = object;
  }

  /**
  * @param {Array} tokens
  * @return {Buffer}
  */
  serialize(tokens) {
    const data = new BufferStream();
    const dh = gen_header(this.format, this.version);
    dh.write(data);
    for (const tk of tokens) {
      if (tk) tk.write(data);
    }
    return data.export();
  }

  /**
  * @param {Buffer} buff
  * @return {function*}
  */
  * deserialize (buff) {
    // convert into a bufferstream
    const data = new BufferStream(0, buff);

    // read the header
    const header_tk = token.TokenTemplate.OPCODE_FIELD.read(data);
    if (header_tk !== 0x01) throw new ParseError(`File does not start with header`, 'NO_HEADER', header_tk);
    const header_data = header.read(data);

    // validate
    if (header_data.MAGIC_NUMBER !== MAGIC_NUMBER) throw new ParseError(`Cannot read file`, 'MAGIC_NUMBER', header_data.MAGIC_NUMBER);
    if (header_data.FORMAT_NAME !== this.format) throw new ParseError(`Cannot read file`, 'FORMAT_NAME', header_data.FORMAT_NAME);

    // get the version
    const version = header_data.FORMAT_VERSION;
    if (!(version in this.versions)) throw new Error(`Format Version ${version} was not defined`);
    if (this.versions[version] === 'function') this.versions[version] = this.versions[version]();
    const versionTokens = this.versions[version].tokens;

    // read every token
    while (data.remaining() > 0) {
      const nextTokenOpcode = token.TokenTemplate.OPCODE_FIELD.read(data);
      const template = versionTokens[nextTokenOpcode];
      yield template.read(data);
    }
    return;
  }
}

module.exports = Format;
