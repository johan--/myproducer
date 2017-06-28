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
  resume: String,
  bio: String,
  productions: [{type: mongoose.Schema.Types.ObjectId, ref:'Production'}],
  // projects are the same as productions. they just have a start date and end date
  projects: [{type: mongoose.Schema.Types.ObjectId, ref: 'Production'}],
  offersSent: [{type: mongoose.Schema.Types.ObjectId, ref:'Crew'}],
  offersReceived: [{type: mongoose.Schema.Types.ObjectId, ref:'Crew'}],
  contacts: [{type: mongoose.Schema.Types.ObjectId, ref:'User'}],
  pendingContacts: [{type: mongoose.Schema.Types.ObjectId, ref:'User'}],
  taggables: [{type: mongoose.Schema.Types.ObjectId, ref: 'Tag'}],
  active: {type: Boolean, default: true},
  picture: String,
  stripePlan: Object,
  stripeAccount: Object
}, {timestamps: true})

User.plugin(passportLocalMongoose)


module.exports = mongoose.model('User', User)
