// token definitions here

const {Format, Builder, Field} = require('../../index.js');

class StoreToken extends Builder.Token {
  update(stores, current) {
    if (!(this.name in stores)) stores[this.name] = {};
    current.store = stores[this.name];
  }
}

class SectionToken extends Builder.Token {
  update(stores, current) {
    if (!(this.name in current.store)) current.store[this.name] = [];
    current.section = current.store[this.name];
  }
}

class ItemToken extends Builder.Token {
  update(stores, current) {
    current.section.push({
      name: this.name,
      quantity: this.quantity,
    })
  }
}

class NoteToken extends Builder.Token {
  update(stores, current) {
    console.log('Note:', this.data)
  }
}

module.exports = {
  StoreToken,
  SectionToken,
  ItemToken,
  NoteToken,
}
