const semver = require('semver');

const token = require('./token.js');
const Field = require('./field.js');
const BufferStream = require('./buffstream.js');
const Builder = require('./build.js');

const MAGIC_NUMBER = 'binary.js';
const version = semver.parse(require('./package.json').version);
const VERSION_MAJOR = version.major;
const VERSION_MINOR = version.minor;
const VERSION_PATCH = version.patch;

const fs = require('fs');

const header = new token.TokenTemplate(
  'Header',
  0x01,
  [
    Field.uint16('NULL'),

    Field.ascii('MAGIC_NUMBER'),
    Field.ascii('FORMAT_NAME'),

    Field.uint16('VERSION_MAJOR'),
    Field.uint16('VERSION_MINOR'),
    Field.uint16('VERSION_PATCH'),

    Field.uint8('FORMAT_VERSION_MAJOR'),
    Field.uint8('FORMAT_VERSION_MINOR'),
    Field.uint8('FORMAT_VERSION_PATCH'),
  ],
);

function gen_header(format, directoryOffset, directorySize, major, minor, patch) {
  return header.instance({
    'NULL': 0x00,

    'MAGIC_NUMBER': MAGIC_NUMBER,
    'FORMAT_NAME': format,

    'VERSION_MAJOR': VERSION_MAJOR,
    'VERSION_MINOR': VERSION_MINOR,
    'VERSION_PATCH': VERSION_PATCH,

    'FORMAT_VERSION_MAJOR': major,
    'FORMAT_VERSION_MINOR': minor,
    'FORMAT_VERSION_PATCH': patch,
  })
}

const directory = new token.TokenTemplate(
  'DIRECTORY_ENTRY',
  0x02,
  [
    Field.string('ENTRY'),
    Field.uint32('OFFSET'),
    Field.uint32('SIZE'),
  ]
)

const type_string = new token.TokenTemplate(
  'STRING', 0x03,
  [Field.string('DATA')]
)

class BasicToken extends token.Token {};

const tokens = {
  string:  new token.TokenTemplate('string',0x03, [Field.string('ENTRY'), Field.string('DATA')], BasicToken),

  uint8:   new token.TokenTemplate('uint8',0x04, [Field.string('ENTRY'), Field.uint8('DATA')], BasicToken),
  uint16:  new token.TokenTemplate('uint16',0x05, [Field.string('ENTRY'), Field.uint16('DATA')], BasicToken),
  uint32:  new token.TokenTemplate('uint32',0x06, [Field.string('ENTRY'), Field.uint32('DATA')], BasicToken),

  n_uint8:  new token.TokenTemplate('n_int8',0x07, [Field.string('ENTRY'), Field.uint8('DATA')], BasicToken),
  n_uint16: new token.TokenTemplate('n_int16',0x08, [Field.string('ENTRY'), Field.uint16('DATA')], BasicToken),
  n_uint32: new token.TokenTemplate('n_int32',0x09, [Field.string('ENTRY'), Field.uint32('DATA')], BasicToken),

  buffer:  new token.TokenTemplate('buffer',0x0a, [Field.string('ENTRY'), Field.buffer('DATA')], BasicToken),

  null:    new token.TokenTemplate('null',0x0b, [Field.string('ENTRY')], BasicToken),
  zero:    new token.TokenTemplate('zero',0x0c, [Field.string('ENTRY')], BasicToken),
}

function tokenize(name, data) {
  if (typeof data === 'string') return tokens.string({'ENTRY': name, 'DATA': data});
  if (typeof data === 'number') {
    if (data === 0) return tokens.zero({'ENTRY': name});
    if (data > 0) {
      if (data < 256) return tokens.uint8({'ENTRY': name, 'DATA': data});
      if (data < 65535) return tokens.uint16({'ENTRY': name, 'DATA': data});
      if (data < 4294967295) return tokens.uint32({'ENTRY': name, 'DATA': data});
      throw new Error(`Number ${data} too big`);
    }
    data = Math.abs(data);
    if (data < 256) return tokens.n_uint8({'ENTRY': name, 'DATA': data});
    if (data < 65535) return tokens.n_uint16({'ENTRY': name, 'DATA': data});
    if (data < 4294967295) return tokens.n_uint32({'ENTRY': name, 'DATA': data});
    throw new Error(`Number ${data} too negative`);
  }
  if (typeof data === 'object') {
    if (data instanceof Buffer) return tokens.buffer({'ENTRY': name, 'DATA': data})
  }
  if (data === null) return tokens.null({'ENTRY': name});
  throw new Error(`Cannot tokenize ${data}`);
}

function valueFrom(data) {
  if (data.template === tokens.string) return data['DATA'];
  //
  if (data.template === tokens.uint8) return data['DATA'];
  if (data.template === tokens.uint16) return data['DATA'];
  if (data.template === tokens.uint32) return data['DATA'];
  //
  if (data.template === tokens.n_uint8) return -data['DATA'];
  if (data.template === tokens.n_uint16) return -data['DATA'];
  if (data.template === tokens.n_uint32) return -data['DATA'];
  //
  if (data.template === tokens.null) return null;
  if (data.template === tokens.zero) return 0;
  //
  if (data.template === tokens.buffer) return data['DATA'];
  throw new Error(`Cannot get value of ${data}`);
}

class Format {
  /**
  * @constructor
  * @param {string} format
  * @param {Version} main
  */
  constructor(format, main = new Builder()) {
    this.format = format;
    this.versions = {};
    this.main = main;
  }

  set(version, object) {
    this.versions[version] = object;
  }
}

module.exports = Format;

// const th = gen_header('Test', 100, 1, 0, 1, 0);
// console.log(th);
// const buff = new BufferStream();
// th.write(buff);
// fs.writeFileSync('out/a', buff.export());
//
// const data = fs.readFileSync('out/a');
// const buff2 = new BufferStream(1, data)
// console.log(header.read(buff2));
