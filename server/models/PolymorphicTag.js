var mongoose = require('mongoose')
var Schema = mongoose.Schema

var PolymorphicTag = new Schema({
  stuff: String
})

module.exports = mongoose.model('PolymorphicTag', PolymorphicTag)
