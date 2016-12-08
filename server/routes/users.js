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
