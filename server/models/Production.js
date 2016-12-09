// user model
var mongoose = require('mongoose')
var Schema = mongoose.Schema

var Production = new Schema({
  by_: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  name: String,
  location: [String],
  weather: String,
  hospital: String,
  parking: String,
  notes: String,
  pendingCrew: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
  approvedCrew: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
  active: Boolean,
}, {timestamps: true})

module.exports = mongoose.model('Production', Production)
