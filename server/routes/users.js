// NPM PACKAGES

var express = require('express')
var router = express.Router()
var mongoose = require('mongoose')

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

    User.findOne({username: req.body.email}, function(err, contact){
      if(err) return console.log(err)

      if(!contact){ // if user does not exist
        var email = req.body.email
        var producerId = req.user._id
        var registrationURL = 'http://myproducer.io/#/register?p=' + producerId
        // send email
        console.log("Sending email to " + email + " with registration URL: " + registrationURL)
        
      } else { // if user exists
        user.contacts.push(contact._id) // add new contact id to logged in user's contact list

        user.save(function(err){ // save updated logged in user
          if(err) return console.log(err)
          res.json({success: true})
        })
      }
    })
  })
})

// get a single user
router.get('/:id', function(req, res){
  User.findById(req.params.id).populate('contacts productions offersReceived').exec(function(err, user){
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
  User.findByIdAndUpdate(req.params.id, { active: false }, { new: true }, function(err, user){
    if(err) return console.log(err)
    res.json({ sucess: true })
  })
})

module.exports = router
