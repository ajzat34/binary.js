const Field = require('./field.js');
const Format = require('./format.js');
const Builder = require('./build.js');

const main = new Builder();
const str = main.token('string', [Field.string('data')]);

const bin = new Format('test', main);

const data = {
  'root': [
  ],
}
