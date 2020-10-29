const format = require('./format.js');
const token = require('./token.js');
const Field = require('./field.js');

class Builder {
  constructor() {
    this.tokens = {};
    this.opcode = 0x10;
  }

  /**
  * @param {string} name
  * @param {array} fields
  * @param {Object} proto
  * @return {function} a function to instance the token
  */
  token(name, fields, proto = token.Token) {
    if (this.opcode > 255) throw new Error(`Too many tokens (> 255)`);
    const tk = new token.TokenTemplate(name, this.opcode, fields, proto);
    this.tokens[tk.opcode] = tk;
    this.opcode++;
    return (...args)=>(tk.instance(...args));
  }
}

module.exports = Builder
