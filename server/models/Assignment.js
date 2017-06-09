const
  mongoose = require('moongoose'),
  Schema = mongoose.Schema,

Assignment = new Schema({
  position: String,
  _creator: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  users: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}]
})

module.exports = mongoose.model('Assignment', Assignment)
