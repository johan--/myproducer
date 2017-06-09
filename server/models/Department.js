const
  mongoose = require('mongoose'),
  Schema = mongoose.Schema,

Department = new Schema({
  title: String,
  production: {type: mongoose.Schema.Types.ObjectId, ref: 'Production'},
  crew: [{type: mongoose.Schema.Types.ObjectId, ref: 'Crew'}],
})

module.exports = mongoose.model('Department', Department)
