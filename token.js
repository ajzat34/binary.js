const Field = require('./field.js');
const assert = require('assert').strict;

class Token {
  template;

  /**
  * @constructor
  * @param {TokenTemplate} template
  */
  constructor(template){
    this.template = template
  };

  /**
  * write a field to a stream
  * @param {Writeable} stream
  */
  write(stream) {
    this.template.write(stream, this);
  }
}

class TokenTemplate {
  name;
  opcode;
  fields;

  /**
  * @constructor
  * @param {string} name
  * @param {number} opcode
  * @param {Array<Field>} fields
  */
  constructor(name, opcode, fields = [], usePrototype = Token) {
    assert(name);
    assert(opcode);
    assert(opcode < 255 && opcode > 0);
    this.name = name;
    this.opcode = opcode;
    this.fields = fields;
    this.usePrototype = usePrototype;
    const test = {};
    this.fields.forEach((field) => {
      if (field.name in test) throw new Error(`field: ${field.name} is not unique`);
      test[field.name] = true;
    });
  }

  static OPCODE_FIELD = Field.uint8('opcode');

  /**
  * Read from a stream, DOES NOT READ CODE
  * @param {Readable} stream
  */
  read(stream) {
    const fielddata = new this.usePrototype(this);
    for (const field of this.fields) {
      fielddata[field.name] = field.read(stream);
    }
    return fielddata;
  }

  /**
  * write to a stream
  * @param {Writeable} stream
  * @param {Object} data
  */
  write(stream, data) {
    TokenTemplate.OPCODE_FIELD.write(stream, this.opcode);
    for (const field of this.fields) {
      field.write(stream, data[field.name]);
    }
  }

  /**
  * create an instance of a token template
  * @param {Object} data
  */
  instance(data) {
    const fielddata = new this.usePrototype(this);
    for (const field of this.fields) {
      fielddata[field.name] = field.parse(data[field.name]);
    }
    return fielddata;
  }
}

module.exports = {
  TokenTemplate,
  Token,
};
