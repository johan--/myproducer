// SETUP

var express = require('express')
var router = express.Router()
var passport = require('passport')

// MODELS

var User = require('../models/User.js')
var Production = require('../models/Production.js')

// REGISTER ROUTES

router.post('/register', function(req, res) {
  User.register(new User({ username: req.body.username }),
    req.body.password, function(err, account) {
    if (err) {
      return res.status(500).json({
        err: err
      })
    }
    passport.authenticate('local')(req, res, function () {
      return res.status(200).json({
        status: 'Registration successful!'
      })
    })
  })
})

// LOGIN ROUTES

router.post('/login', function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) {
      return next(err)
    }
    if (!user) {
      return res.status(401).json({
        err: info
      })
    }
    req.logIn(user, function(err) {
      if (err) {
        return res.status(500).json({
          err: 'Could not log in user'
        })
      }
      res.status(200).json({
        status: 'Login successful!',
        user: user
      })
    })
  })(req, res, next)
})

// LOGOUT ROUTES

router.get('/logout', function(req, res) {
  req.logout()
  res.status(200).json({
    status: 'Bye!'
  })
})

// STATUS ROUTES

router.get('/status', function(req, res) {
  if (!req.isAuthenticated()) {
    return res.status(200).json({
      status: false
    })
  }
  res.status(200).json({
    status: true,
    user: req.user
  })
})

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

module.exports = router
