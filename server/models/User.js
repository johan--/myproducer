// user model
var mongoose = require('mongoose')
var Schema = mongoose.Schema
var passportLocalMongoose = require('passport-local-mongoose')

var User = new Schema({
  username: String,
  first_name: String,
  last_name: String,
  password: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  role: String,
  equipment: [String],
  skills: [String],
  location: String,
  title: String,
  phone: String,
  website: String,
  bio: String,
  productions: [{type: mongoose.Schema.Types.ObjectId, ref:'Production'}],
  offersSent: [{type: mongoose.Schema.Types.ObjectId, ref:'Crew'}],
  offersReceived: [{type: mongoose.Schema.Types.ObjectId, ref:'Crew'}],
  contacts: [{type: mongoose.Schema.Types.ObjectId, ref:'User'}],
  pendingContacts: [{type: mongoose.Schema.Types.ObjectId, ref:'User'}],
  active: {type: Boolean, default: true},
  picture: String,
}, {timestamps: true})

User.plugin(passportLocalMongoose)


module.exports = mongoose.model('User', User)
