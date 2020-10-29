const assert = require('assert').strict;

class BufferStream {

  offset;
  data;

  /**
  * @constructor
  * @param {number | undefined} start the offset to start at
  * @param {Buffer | undefined} data the buffer to use
  */
  constructor(start=0, data = Buffer.allocUnsafe(1)) {
    assert(data instanceof Buffer);
    this.offset = start;
    this.data = data;
  }

  get length() {
    return this.offset;
  }

  /**
  * double the size
  */
  resize(factor = 2) {
    const n = Buffer.allocUnsafe(this.data.length * factor);
    this.data.copy(n, 0);
    this.data = n;
  }

  /**
  * Write to the stream
  * @param {Buffer} buff data to write
  */
  write(buff) {
    const size = buff.length;
    // resize if needed
    if (this.offset + size >= this.data.length) {
      let factor = 2;
      while (this.offset + size >= this.data.length * factor) factor += 1;
      this.resize(factor);
    };
    buff.copy(this.data, this.offset);
    this.offset += size;
  }

  /**
  * Read n bytes from the stream
  * @param {number} size number of bytes to read
  */
  read(size) {
    const data = this.data.slice(this.offset, this.offset+size);
    this.offset += size;
    return data;
  }

  export() {
    return this.data.slice(0, this.offset);
  }
}

module.exports = BufferStream;
