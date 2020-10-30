const fs = require('fs');
const {Format, Builder, Field} = require('../../index.js');
const tk = require('./tokens.js');

const FILE = './data';

const v2loader = require('./v2.js');
const v2 = v2loader();
const {store, section, item, note} = v2.GetTokenCreators();

const listFF = new Format('example', 'v2', v2);

// add support for the v1 format
listFF.set('v1', require('./v1.js'));

function createSampleFile() {
  fs.writeFileSync(FILE, listFF.serialize([
    note({data: 'Example list'}),
    store({name: 'Grocery Store'}),
    section({name: 'Meat'}),
    item({name: 'Bacon', quantity: 2}),
    section({name: 'Bread'}),
    item({name: 'Bread', quantity: 3}),
    store({name: 'Pet Store'}),
    section({name: 'Cats'}),
    item({name: 'Toy', quantity: 1}),
    item({name: 'Food', quantity: 2}),
    section({name: 'Dogs'}),
    item({name: 'Costume', quantity: 1}),
    item({name: 'Food', quantity: 2}),
  ]));
}

function readSampleFile() {
  const stores = {};
  const current = {store: null, section: null};
  for (const token of listFF.deserialize(fs.readFileSync(FILE))) {
    token.update(stores, current);
  }
  console.log('Result:', require('util').inspect(stores, { depth: null }));
}

createSampleFile();
readSampleFile()
