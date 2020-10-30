const fs = require('fs');
const {Format, Builder, Field} = require('../index.js');

const FILE = './out/versioning';

// create a class for our token
class MyToken extends Builder.Token {};

// A fake "old" version: v1
// --------------------------------------------------------------------------

// create version 1 so we can genorate a test file
// a defered version (a function returning a Builder) will only be called if it is needed
const myFormatVersion1 = new Builder();
// create a token for our format
const myTokenV1 = myFormatVersion1.token(
  'myToken',
  [
    Field.string('name'),
    Field.uint32('count'),
  ],
  MyToken,
)
// create the v1 only format
const v1 = new Format('myFormat', 'v1', myFormatVersion1);

// same as example/simple.js
// The "new" version: v2
// v2 can also parse v1 data
// --------------------------------------------------------------------------

// create a version of our format
const myFormatVersion2 = new Builder();

// create a token for our format
const myTokenV2 = myFormatVersion2.token(
  'myToken',
  [
    Field.string('name'),
    Field.enum('type', ['Meat', 'Dairy', 'Frozen']),
    Field.uint32('count'),
  ],
  MyToken,
)
// create the format interface
const v2 = new Format('myFormat', 'v2', myFormatVersion2);
// add support for the v1 parser
v2.set('v1', myFormatVersion1);

// write a file
fs.writeFileSync(FILE, v1.serialize([
  myTokenV1({name: 'Bacon', count: 4}),
  myTokenV1({name: 'Milk', count: 1}),
]));

// read it back in with the v2 format
for (const tk of v2.deserialize(fs.readFileSync(FILE))) {
  console.log(tk.toString());
}
