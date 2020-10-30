const fs = require('fs');
const {Format, Builder, Field} = require('../index.js');

const FILE = './out/classes';

// create a version of our format
const myFormatVersion = new Builder();

// create classes for our tokens
class Foo extends Builder.Token {
  toString() { return `A Foo token, with data "${this.data}"`}
};
class Bar extends Builder.Token {
  toString() { return `A Bar token, with data "${this.data}"`}
};

// create tokens
const foo = myFormatVersion.token(
  'Foo',
  [Field.string('data')],
  Foo,
);
const bar = myFormatVersion.token(
  'Bar',
  [Field.string('data')],
  Bar,
);

// create the format interface
const myFormat = new Format('class example format', '1.0.0', myFormatVersion);

// write a file
fs.writeFileSync(FILE, myFormat.serialize([
  foo({data: 'First token is a Foo'}),
  bar({data: 'Second token is a Bar'}),
]));

// read it back in
for (const tk of myFormat.deserialize(fs.readFileSync(FILE))) {
  console.log(tk.toString());
}
