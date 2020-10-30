const {Format, Builder, Field} = require('../../index.js');
const tk = require('./tokens.js');

module.exports = () => {
  const b = new Builder();
  b.token('store',  [Field.string('name')], tk.StoreToken);
  b.token('section',[Field.string('name')], tk.SectionToken);
  b.token('item',   [Field.string('name'),Field.uint32('quantity')], tk.ItemToken);
  return b;
}
