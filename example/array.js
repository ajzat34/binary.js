const fs = require('fs');
const {Format, Builder, Field} = require('../index.js');

const FILE = './out/simple';

// create a version of our format
const myFormatVersion = new Builder();

// create a class for our token
class MyToken extends Builder.Token {};

// create a token for our format
const myToken = myFormatVersion.token(
  'myToken',
  [
    Field.string('data', true),
  ],
  MyToken,
)

// create the format interface
const myFormat = new Format('myFormat', '1.0.0', myFormatVersion);

// write a file
fs.writeFileSync(FILE, myFormat.serialize([
  myToken({data: ['Item 1', 'Item 2', 'Item 3']}),
  myToken({data: ['Item 1', 'Item 2', 'Item 3', 'Item 4']}),
]));

// read it back in
for (const tk of myFormat.deserialize(fs.readFileSync(FILE))) {
  console.log(tk);
}
