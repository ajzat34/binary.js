// token definitions here

const {Builder} = require('../../index.js');

class BaseToken extends Builder.Token {
  update(stores, current) { console.log('Default Update Behavior:', this.toString()); }
}

class StoreToken extends BaseToken {
  update(stores, current) {
    if (!(this.name in stores)) stores[this.name] = {};
    current.store = stores[this.name];
  }
}

class SectionToken extends BaseToken {
  update(stores, current) {
    if (!(this.name in current.store)) current.store[this.name] = [];
    current.section = current.store[this.name];
  }
}

class ItemToken extends BaseToken {
  update(stores, current) {
    current.section.push({
      name: this.name,
      quantity: this.quantity,
    })
  }
}

class NoteToken extends BaseToken {
  update(stores, current) {
    console.log('Note:', this.data);
  }
}

module.exports = {
  StoreToken,
  SectionToken,
  ItemToken,
  NoteToken,
}
