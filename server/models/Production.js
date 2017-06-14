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
  date: Date,
  crewCall: Date,
  crew: [{type: mongoose.Schema.Types.ObjectId, ref:'Crew'}],
  departments: [{type: mongoose.Schema.Types.ObjectId, ref: 'Department'}],
  notes: String,
  productionDay: Number,
  active: {type: Boolean, default: true},
  tag: [{type: mongoose.Schema.Types.ObjectId, ref: 'Tag'}]
}, {timestamps: true})

module.exports = mongoose.model('Production', Production)
