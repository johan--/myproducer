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
  date: Date,
  crewCall: Date,
  productionDay: Number,
  crew: [{type: mongoose.Schema.Types.ObjectId, ref:'Crew'}],
  active: {type: Boolean, default: true},
}, {timestamps: true})

module.exports = mongoose.model('Production', Production)
