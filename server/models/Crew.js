var mongoose = require('mongoose');

var Crew = mongoose.Schema({
  to: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  production: {type: mongoose.Schema.Types.ObjectId, ref: 'Production'},
  offer: {
    status: {type: String, default: 'None'},
    position: String,
    rate: Number,
    hours: Number,
    dateFrom: Date,
    dateTo: Date,
},
  message: [{type: mongoose.Schema.Types.ObjectId, ref: 'Message'}],
  active: {type: Boolean, default: true},
}, { timestamps: true })

module.exports = mongoose.model('Crew', Crew)
