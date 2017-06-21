const
  mongoose = require('mongoose'),
  Schema = mongoose.Schema,

Role = new Schema({
  position: String,
  basis: String,
  rate: Number,
  hours: Number,
  // editing: {type: Boolean, default: false},
  _creator: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  production: {type: mongoose.Schema.Types.ObjectId, ref: 'Production'},
  user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}
})

module.exports = mongoose.model('Role', Role)
