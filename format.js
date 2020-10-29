const semver = require('semver');

const token = require('./token.js');
const Field = require('./field.js');
const BufferStream = require('./buffstream.js');

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

    Field.uint32('DIRECTORY_OFFSET'),
    Field.uint32('DIRECTORY_SIZE'),

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

    'DIRECTORY_OFFSET': directoryOffset,
    'DIRECTORY_SIZE': directorySize,

    'VERSION_MAJOR': VERSION_MAJOR,
    'VERSION_MINOR': VERSION_MINOR,
    'VERSION_PATCH': VERSION_PATCH,

    'FORMAT_VERSION_MAJOR': major,
    'FORMAT_VERSION_MINOR': minor,
    'FORMAT_VERSION_PATCH': patch,
  })
}

const th = gen_header('Test', 100, 1, 0, 1, 0);
console.log(th);
const buff = new BufferStream();
th.write(buff);
fs.writeFileSync('out/a', buff.export());

const data = fs.readFileSync('out/a');
const buff2 = new BufferStream(1, data)
console.log(header.read(buff2));
