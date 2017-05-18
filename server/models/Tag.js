var mongoose = require('mongoose')
var Schema = mongoose.Schema
var Production = require('./Production.js')
var util = require('util')

var PolymorphicTag = new Schema({
  label: String,
  tags: [{'type': Schema.Types.ObjectId, 'ref': 'Tag'}]
})

function BaseSchema(){
  Schema.apply(this, arguments)

  this.add({
    'createdAt': {'type': Date, 'default': Date.now}
  })
}

util.inherits(BaseSchema, Schema)

var tagSchema = new BaseSchema()

// var Tag = mongoose.model('Tag', tagSchema)

module.exports = mongoose.model('Tag', tagSchema)
