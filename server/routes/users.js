// NPM PACKAGES

var express = require('express')
var router = express.Router()

// MODELS

var User = require('../models/User.js')

// get list of all users
router.get('/', function(req, res){
  User.find({}, function(err, users){
    if(err) return console.log(err)
    res.json(users)
  })
})

// post a new user
router.post('/', function(req, res){
  User.create(req.body, function(err, user){
    if(err) return console.log(err)
    res.json(user)
  })
})

// add a new user to logged in user's contact list
router.post('/addcontact', function(req, res){
  User.findById(req.user._id, function(err, user){ // find logged in user from database
    if(err) return console.log(err)

    var contactId = req.body.contactId  // grab new contact id through req.body
    user.contacts.push(contactId) // add new contact id to logged in user's contact list

    user.save(function(err){ // save updated logged in user
      if(err) return console.log(err)
      res.json({success: true})
    })
  })
})

// get a single user
router.get('/:id', function(req, res){
  User.findById(req.params.id, function(err, user){
    if(err) return console.log(err)
    res.json(user)
  })
})

// update a single user
router.patch('/:id', function(req, res){
  User.findByIdAndUpdate(req.params.id, req.body, { new: true }, function(err, user){
    if(err) return console.log(err)
    res.json(user)
  })
})

// delete a single user
router.delete('/:id', function(req, res){
  User.findByIdAndRemove(req.params.id, function(err, user){
    if(err) return console.log(err)
    res.json(user)
  })
})

module.exports = router
