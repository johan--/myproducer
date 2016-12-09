var mongoose = require('mongoose');

var Message = mongoose.Schaema({
  _by: {type: mongoose.Schema.Type.ObjectId, ref: 'User'}
  content: String,
  active: {type: Boolean, default: true},
}, { timestamps: true })

module.exports = mongoose.model('Message', Message)
