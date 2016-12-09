var mongoose = require('mongoose');

var Offer = mongoose.Schema({
  from: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  to: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  production: {type: mongoose.Schema.Types.ObjectId, ref: 'Production'},
  status: String,
  position: String,
  rate: Number,
  hours: Number,
  dateFrom: Date,
  dateTo: Date,
  message: [{type: mongoose.Schema.Types.ObjectId, ref: 'Message'}],
  active: Boolean,
}, { timestamps: true })

module.exports = mongoose.model('Offer', Offer)
