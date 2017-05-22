const mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  Production = require('./Production.js'),
  User = require('./User.js')

// named taggables to make it polymorphic in the future
// will use mongoose discriminator method
var Tag = new Schema({
  label: String,
  taggables: [{'type': mongoose.Schema.Types.ObjectId, 'ref': 'Production'}],
  _creator: {'type': mongoose.Schema.Types.ObjectId, 'ref': 'User'}
})

module.exports = mongoose.model('Tag', Tag)
