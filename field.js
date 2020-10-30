const types = require('./types.js');
const assert = require('assert').strict;

class Field {
  name;
  type;
  dynamic;
  arraysize;

  /**
  * @constructor
  * @param {string} name
  * @param {TypeFormat} type
  * @param {number | true | null} arraysize true = dynamic size, number = size, null|false = not array
  */
  constructor(name, type, arraysize=false) {
    assert(name);
    assert(type);
    this.name = name;
    this.type = type;
    this.dynamic = type.dynamic;
    this.arraysize = arraysize;
  }

  #readSingle(stream) {
    let size = this.type.size;
    if (this.dynamic) {
      size = stream.read(4).readUIntLE(0, 4);
    }
    return this.type.deserialize(stream.read(size));
  }

  #writeSingle(stream, data) {
    let size = this.type.size;
    const bufferData = this.type.serialize(data);
    if (this.dynamic) {
      size = bufferData.length;
      const buf = Buffer.allocUnsafe(4);
      buf.writeUIntLE(size, 0, 4);
      stream.write(buf);
    }
    return stream.write(bufferData);
  }

  #readArray(stream) {
    let size = this.arraysize;
    if (this.arraysize === true) size = stream.read(4).readUIntLE(0,4);
    const result = [];
    for (let i = 0; i<size; i++) {
      result.push(this.#readSingle(stream));
    }
    return result;
  }

  #writeArray(stream, data) {
    let size = this.arraysize;
    if (this.arraysize === true) {
      size = data.length;
      const buf = Buffer.allocUnsafe(4);
      buf.writeUIntLE(size, 0, 4);
      stream.write(buf);
    }
    for (const item of data) {
      this.#writeSingle(stream, item);
    }
  }

  /**
  * Read a field from a stream
  * @param {Readable} stream
  */
  read(stream) {
    if (this.arraysize) {
      return this.#readArray(stream);
    } else {
      return this.#readSingle(stream);
    }
  }

  /**
  * Write a field to a stream
  * @param {Writeable} stream
  * @param {Object} data
  */
  write(stream, data) {
    if (this.arraysize) {
      return this.#writeArray(stream, data);
    } else {
      return this.#writeSingle(stream, data);
    }
  }

  estimateSize() {
    let size = 1;
    if (this.dynamic) size *= 1;
    else size *= this.type.size;
    if (this.arraysize === true) size = 1;
    else if (this.arraysize) size *= this.arraysize;

    return size;
  }

  /**
  * @param {string | Array} str
  */
  parse(str) {
    if (Array.isArray(str)) return str.map(data=>this.parse(data));
    if (typeof str === 'string') return this.type.parse(str);
    return str;
  }

  // Factories
  static int8(name, arraysize) {
    return new Field(name, types.type.int8, arraysize);
  }
  static int16(name, arraysize) {
    return new Field(name, types.type.int16, arraysize);
  }
  static int32(name, arraysize) {
    return new Field(name, types.type.int32, arraysize);
  }
  static int64(name, arraysize) {
    return new Field(name, types.type.int64, arraysize);
  }

  static uint8(name, arraysize) {
    return new Field(name, types.type.uint8, arraysize);
  }
  static uint16(name, arraysize) {
    return new Field(name, types.type.uint16, arraysize);
  }
  static uint32(name, arraysize) {
    return new Field(name, types.type.uint32, arraysize);
  }
  static uint64(name, arraysize) {
    return new Field(name, types.type.uint64, arraysize);
  }

  static ascii(name, arraysize) {
    return new Field(name, types.type.ascii, arraysize);
  }

  static utf8(name, arraysize) {
    return new Field(name, types.type.utf8, arraysize);
  }

  static string(name, arraysize) {
    return new Field(name, types.type.string, arraysize);
  }

  static buffer(name, arraysize) {
    return new Field(name, types.type.buffer, arraysize);
  }

  static enum(name, options, arraysize) {
    return new Field(name, types.type.enumFactory(name, options), arraysize);
  }
}

module.exports = Field;
