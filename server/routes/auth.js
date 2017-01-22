// NPM PACKAGES

var express = require('express')
var router = express.Router()
var passport = require('passport')
var async = require('async')
var crypto = require('crypto')
var dotenv = require('dotenv').load({silent: true})
var nodemailer = require('nodemailer')

// MODELS

var User = require('../models/User.js')

// REGISTER ROUTES

router.post('/register', function(req, res) {
  User.register(new User({ username: req.body.username, first_name: req.body.first_name, last_name: req.body.last_name, role: req.body.role }),
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

router.post('/forgot-password', function(req, res, next) {
  async.waterfall([
    function(done) {
      crypto.randomBytes(20, function(err, buf) {
        var token = buf.toString('hex');
        done(err, token);
      });
    },
    function(token, done) {
      console.log("find user");
      User.findOne({ username: req.body.email }, function(err, user) {
        if (!user) {
          // req.flash('error', 'No account with that email address exists.');
          return res.redirect('/#/forgot-password');
        }

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        user.save(function(err) {
          done(err, token, user);
        });
      });
    },
    function(token, user, done) {
      var smtpConfig = {
        host: process.env.NODEMAILER_HOST,
        port: process.env.NODEMAILER_PORT,
        secure: false, // use SSL
        auth: {
            user: process.env.NODEMAILER_USER,
            pass: process.env.NODEMAILER_PASS
        },
        tls: {
            rejectUnauthorized: false
        }
      };
      var smtpTransport = nodemailer.createTransport(smtpConfig);
      var mailOptions = {
        to: user.username,
        from: 'passwordreset@demo.com',
        subject: 'Node.js Password Reset',
        text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          'http://' + req.headers.host + '/reset/' + token + '\n\n' +
          'If you did not request this, please ignore this email and your password will remain unchanged.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        // req.flash('info', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
        done(err, 'done');
      });
    }
  ], function(err) {
    if (err) return next(err);
    res.redirect('/#/forgot-password');
  });
});

module.exports = router
