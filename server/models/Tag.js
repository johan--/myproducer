var mongoose = require('mongoose')
var Schema = mongoose.Schema
var Production = require('./Production.js')
var PolymorphicTag = require('./PolymorphicTag.js')

var Tag = new Schema({
  label: String,
  taggedItems: [{type: Schema.Types.ObjectId, ref: 'PolymorphicTag'}]
}, {timestamps: true})

// PolymorphicTag.discriminator('Production', Production)

module.exports = mongoose.model('Tag', Tag)
