class TypeFormatError extends Error{};
const assert = require('assert').strict;

class TypeFormat {
  name;
  serialize;
  deserialize;
  size;
  dynamic;
  parseString;

  /**
  * @constructor
  * @param {string} name
  * @param {function} serialize
  * @param {function} deserialize
  * @param {number} size
  * @param {function} parseString
  */
  constructor(name, serialize, deserialize, size=null, parseString=null) {
    assert(name);
    assert(serialize);
    assert(deserialize);
    this.name = name;
    this.serialize = serialize;
    this.deserialize = deserialize;
    this.parseString = parseString;
    this.size = size;
    this.dynamic = !size;
  }

  parse(str) {
    if (this.parseString) return this.parseString(str);
    throw new TypeFormatError(`No String Parser for type: ${this.name}`);
  }

  /**
  * Factory for creating int types
  * @param {string} name
  * @param {number} bytes
  */
  static intFactory(name, bytes) {
    return new TypeFormat(
      name,
      data=>{const b = Buffer.allocUnsafe(bytes); b.writeIntLE(data, 0, bytes); return b},
      data=>data.readIntLE(0, bytes),
      bytes,
      parseInt,
    )
  }

  /**
  * Factory for creating uint types
  * @param {string} name
  * @param {number} bytes
  */
  static uintFactory(name, bytes) {
    return new TypeFormat(
      name,
      data=>{const b = Buffer.allocUnsafe(bytes); b.writeUIntLE(data, 0, bytes); return b},
      data=>data.readUIntLE(0, bytes),
      bytes,
      parseInt,
    )
  }

  /**
  * Factory for creating enumerations
  * @param {string} name
  * @param {Array} options
  */
  static enumFactory(name, options) {
    // how many bytes are needed to fit the number options specified
    let bytes = 1;
    if (options.length > 250) bytes = 2;
    if (options.length > 65000) bytes = 4;

    const serialize = data => {
      const index = options.indexOf(data);
      if (index < 0) throw new TypeFormatError(`Invalid option for enum ${name}: ${data}`)
      const b = Buffer.allocUnsafe(bytes);
      b.writeUIntLE(data, 0, bytes);
      return b;
    }

    const deserialize = data => {
      const index = data.readUIntLE(0, bytes);
      return options[index];
    }

    return new TypeFormat(
      name,
      serialize,
      deserialize,
      bytes,
      str=>str,
    )
  }
}

const ascii = new TypeFormat(
  'ascii',
  data=>Buffer.from(data, 'ascii'),
  data=>data.toString('ascii'),
  null,
  data=>data,
);

const utf8 = new TypeFormat(
  'ascii',
  data=>Buffer.from(data, 'utf8'),
  data=>data.toString('utf8'),
  null,
  data=>data,
);

const type = {
  int8: TypeFormat.intFactory('int8', 1),
  int16: TypeFormat.intFactory('int16', 2),
  int32: TypeFormat.intFactory('int32', 4),

  uint8: TypeFormat.uintFactory('uint8', 1),
  uint16: TypeFormat.uintFactory('uint16', 2),
  uint32: TypeFormat.uintFactory('uint32', 4),

  ascii: ascii,
  utf8: utf8,
  string: utf8,

  buffer: new TypeFormat(
    'bytes',
    data=>data,
    data=>data,
  ),

  enumFactory: TypeFormat.enumFactory,
}

module.exports = {
  TypeFormat,
  type,
  TypeFormatError,
};
