// NPM PACKAGES

var express = require('express')
var router = express.Router()

// MODELS

var User = require('../models/User.js')

router.get('/', function(req, res){
  User.find({}, function(err, users){
    if(err) return console.log(err)
    res.json(users)
  })
})

router.post('/', function(req, res){
  User.create(req.body, function(err, user){
    if(err) return console.log(err)
    res.json(user)
  })
})

router.get('/:id', function(req, res){
  User.findById(req.params.id, function(err, user){
    if(err) return console.log(err)
    res.json(user)
  })
})

router.patch('/:id', function(req, res){
  User.findByIdAndUpdate(req.params.id, req.body, { new: true }, function(err, user){
    if(err) return console.log(err)
    res.json(user)
  })
})

router.delete('/:id', function(req, res){
  User.findByIdAndRemove(req.params.id, function(err, user){
    if(err) return console.log(err)
    res.json(user)
  })
})
