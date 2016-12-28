// NPM PACKAGES

var express = require('express')
var router = express.Router()
var passport = require('passport')

// MODELS

var User = require('../models/User.js')

// REGISTER ROUTES

router.post('/register', function(req, res) {
  User.register(new User({ username: req.body.username, role: req.body.role }),
    req.body.password, function(err, account) {
    if (err) {
      return res.status(500).json({
        err: err
      })
    }

    console.log(req.query)

    // Add to newly registered user to another user's contact list
    if(req.query.addTo){

      User.findById(req.query.addTo, function(err, user){
        if (err) return console.log(err)

        console.log(user)

        user.contacts.push(account)

        user.save(function(err){
          if (err) console.log(err);
        })
      })
    } else if(req.query.requestTo){
      // Add to newly registered user to another user's pending contact list

      User.findById(req.query.requestTo, function(err, user){
        if (err) return console.log(err)

        console.log(user)

        user.pendingContacts.push(account)

        user.save(function(err){
          if (err) console.log(err);
        })
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

module.exports = router
