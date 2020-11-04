# binary.js
Create binary file formats

# Install
```bash
$ npm install ajzat34/binary.js
```
```bash
$ yarn add ajzat34/binary.js
```

# Usage

See examples folder

```node
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
    Field.string('name'),
    Field.enum('type', ['Meat', 'Dairy', 'Frozen']),
    Field.uint32('count'),
  ],
  MyToken,
)

// create the format interface
const myFormat = new Format('myFormat', '1.0.0', myFormatVersion);

// write a file
fs.writeFileSync(FILE, myFormat.serialize([
  myToken({name: 'Bacon', type: 'Meat', count: 4}),
  myToken({name: 'Milk', type: 'Dairy', count: 1}),
]));

// read it back in
for (const tk of myFormat.deserialize(fs.readFileSync(FILE))) {
  console.log(tk.toString());
}
``
