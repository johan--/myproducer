const
  mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  Project = new Schema({
    by_: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    name: String,
    location: [String],
    weather: String,
    hospital: String,
    parking: String,
    startDate: Date,
    endDate: Date,
    crewCall: Date,
    sumif: {
      rateTotal: {type: Number, default: 0},
      hourTotal: {type: Number, default: 0}
    },
    crew: [{type: mongoose.Schema.Types.ObjectId, ref:'Crew'}],
    departments: [{type: mongoose.Schema.Types.ObjectId, ref: 'Department'}],
    notes: String,
    active: {type: Boolean, default: true},
    tag: [{type: mongoose.Schema.Types.ObjectId, ref: 'Tag'}]
  })

  module.exports = mongoose.model('Project', Project)
