// NPM PACKAGES

var express = require('express')
var router = express.Router()
var passport = require('passport')
var async = require('async')
var crypto = require('crypto')
var dotenv = require('dotenv').load({silent: true})
var nodemailer = require('nodemailer')
var mailer = require('../nodemailer/mailer.js')

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
          console.log("No user found");
          // req.flash('error', 'No account with that email address exists.');
          return res.json({user: false})
        }
        console.log("reset token");
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
        from: '"myproducer.io" <donotreply@myproducer.io>',
        subject: 'myproducer.io Password Reset Request',
        text: `Hey there,\n\nSomeone requested a new password for your myproducer.io account. \n\nhttp://${process.env.HEADER_HOST}/#/reset-password/${token}\n\nIf you did not make this request, then you can ignore this e-mail.\n\n --myproducer.io Team\n\n P.S. You can learn how best to use your account at our support page. Go to support.myproducer.io`
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

router.post('/check-token', function(req, res) {

  User.findOne({ resetPasswordToken: req.body.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
    if (err) {
      console.log("User Not Found");
      // req.flash('error', 'Password reset token is invalid or has expired.');
       res.redirect('/#/forgot-password');
    }
    res.json({
      user
    })
  });
});

router.post('/reset/:token', function(req, res) {
  async.waterfall([
    function(done) {
      User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
        if (!user) {
          // req.flash('error', 'Password reset token is invalid or has expired.');
          return res.redirect('back');
        }

        user.setPassword(req.body.password, function(){
          user.resetPasswordToken = undefined;
          user.resetPasswordExpires = undefined;
          user.save(function(err){
            done(err, user)
          })
        })
        // user.password = req.body.password;
        // user.resetPasswordToken = undefined;
        // user.resetPasswordExpires = undefined;
        //
        // user.save(function(err) {
        //   req.logIn(user, function(err) {
        //     done(err, user);
        //   });
        // });
      });
    },
    function(user, done) {
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
        from: '"myproducer.io" <donotreply@myproducer.io>',
        subject: 'myproducer.io Password Reset Confirmation',
        text: 'Hello from myproducer.io!,\n\n' +
          'This is a confirmation that the password for your account ' + user.username + ' has just been changed.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        // req.flash('success', 'Success! Your password has been changed.');
        done(err);
      });
    }
  ], function(err) {
    console.log("res.redirect /#/r?req hit");
    res.json({message: 'Password Successfully Changed'});
  });
});



module.exports = router
