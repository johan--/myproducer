const
  mongoose = require('mongoose'),
  Schema = mongoose.Schema,

Department = new Schema({
  title: String,
  production: {type: mongoose.Schema.Types.ObjectId, ref: 'Production'},
  crew: [{type: mongoose.Schema.Types.ObjectId, ref: 'Crew'}],
  // assignments: [{type: mongoose.Schema.Types.ObjectId, ref: 'Assignment'}]
})

module.exports = mongoose.model('Department', Department)
