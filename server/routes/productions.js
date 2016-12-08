// NPM PACKAGES

var express = require('express')
var router = express.Router()

// MODELS

var Production = require('../models/Production.js')

// PRODUCTION ROUTES

// get a particular users productions
router.get('/productions', function(req, res){
  // find it by the user
  User.findById(req.user._id).populate("productions").exec(function(err, user){
    if(err) return console.log(err)
    res.json(user.productions)
  })
})

// create a new production
router.post('/productions', function(req, res){
  // find it by the user
  User.findById(req.user._id, function(err, user){
    if (err) return console.log(err)
    var newProduction = new Production(req.body)
    newProduction.by_ = user
    newProduction.save(function(err, production){
      user.productions.push(production)
      user.save(function(err, user){
        res.json(production)
      })
    })
  })
})

// see one specific production
router.get('/productions/:id', function show(req, res){
  Production.findById(req.params.id).populate('_by').exec(function(err, production) {
    if(err) return console.log(err)
    res.json(production)
  })
})

// update one specific production
router.patch('/productions/:id', function show(req, res){
  Production.findByIdAndUpdate(req.params.id, req.body, { new: true }, function(err, production) {
    if(err) return console.log(err)
    res.json(production)
  })
})

// delete one specific production
router.patch('/productions/:id', function show(req, res){
  Production.findByIdAndRemove(req.params.id, function(err, production) {
    if(err) return console.log(err)
    res.json(production)
    // TODO: res.json({ success: true })
  })
})

module.exports = router
