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
  // will determine if a production is a project
  startDate: Date,
  endDate: Date,
  //
  crewCall: Date,
  sumif: {
    rateTotal: {type: Number, default: 0},
    hourTotal: {type: Number, default: 0}
  },
  crew: [{type: mongoose.Schema.Types.ObjectId, ref:'Crew'}],
  departments: [{type: mongoose.Schema.Types.ObjectId, ref: 'Department'}],
  notes: String,
  productionDay: Number,
  active: {type: Boolean, default: true},
  tag: [{type: mongoose.Schema.Types.ObjectId, ref: 'Tag'}]
}, {timestamps: true})

module.exports = mongoose.model('Production', Production)
