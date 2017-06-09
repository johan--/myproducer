const
  mongoose = require('mongoose'),
  Schema = mongoose.Schema,

Task = new Schema({
  position: String,
  _creator: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  production: {type: mongoose.Schema.Types.ObjectId, ref: 'Production'},
  crew: {type: mongoose.Schema.Types.ObjectId, ref: 'Crew'}
})

module.exports = mongoose.model('Task', Task)
