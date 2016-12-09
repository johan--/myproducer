var mongoose = require('mongoose');

var Message = mongoose.Schema({
  _by: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  content: String,
  active: {type: Boolean, default: true},
}, { timestamps: true })

module.exports = mongoose.model('Message', Message)
