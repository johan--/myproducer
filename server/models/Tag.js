const mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  Production = require('./Production.js'),
  User = require('./User.js')

var Tag = new Schema({
  label: String,
  // named taggables to make it polymorphic in the future
  // taggables should reference a mongoose discriminator schema
  taggables: [{'type': mongoose.Schema.Types.ObjectId, 'ref': 'Production'}],
  _creator: {'type': mongoose.Schema.Types.ObjectId, 'ref': 'User'}
})

module.exports = mongoose.model('Tag', Tag)
