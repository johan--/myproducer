// user model
var mongoose = require('mongoose')
var Schema = mongoose.Schema
var passportLocalMongoose = require('passport-local-mongoose')

var User = new Schema({
  username: String,
  password: String,
  productions: [{type: mongoose.Schema.Types.ObjectId, ref:'Production'}]
})

User.plugin(passportLocalMongoose)


module.exports = mongoose.model('users', User)
