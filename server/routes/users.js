// NPM PACKAGES

var express = require('express')
var router = express.Router()
var mongoose = require('mongoose')
var mailer = require('../nodemailer/mailer.js')
var crypto = require('crypto')

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
        // Add new contact as object to contacts

        // Create Token
        var token;
        crypto.randomBytes(20, function(err, buf) {
          token = buf.toString('hex');

          User.register(new User({ username: req.body.email, role: 'crew', first_name: req.body.first_name, last_name: req.body.last_name, resetPasswordToken: token }),
            'password', function(err, contact) {
            if (err) {
              return res.status(500).json({
                err: err
              })
            }
            // do next functions here: add newContact to user.contacts

              var found = user.contacts.find(function(c) {
                console.log(c, contact._id);
                return c == contact._id.toString()
              })

              if(found) {

                res.json({success: false, message: 'This person is already on your crew list.'})
              } else if(req.body.email === req.user.username) {
                res.json({success: false, message: 'You can not add yourself to your crew list.'})
              } else {
                user.contacts.push(contact._id) // add new contact id to logged in user's contact list

                user.save(function(err){ // save updated logged in user
                  if(err) return console.log(err)
                  res.json({success: true, data: contact})
                })

                var email = req.body.email
                var producerId = user._id
                var registrationURL = `http://${process.env.HEADER_HOST}/#/complete-registration/${token}`
                // send email
                mailer.send(
                  'invitation',
                  {
                    email: email,
                    registrationURL: registrationURL,
                    producer: user.first_name + ' ' + user.last_name
                  },
                  {
                    to: email,
                    subject: 'Invitation to join myproducer.io'
                  }
                )
              }
          })
        })








        // res.json({newSuccess: true, newEmail: email})

      } else { // if user exists

        var found = user.contacts.find(function(c) {
          console.log(c, contact._id);
          return c == contact._id.toString()
        })

        if(found) {

          res.json({success: false, message: 'This person is already on your crew list.'})
        } else if(req.body.email === req.user.username) {
          res.json({success: false, message: 'You can not add yourself to your crew list.'})
        } else {
          user.contacts.push(contact._id) // add new contact id to logged in user's contact list

          user.save(function(err){ // save updated logged in user
            if(err) return console.log(err)
            res.json({success: true, data: contact})
          })
        }
      }
    })
  })
})

router.patch('/updateContact', function(req, res){
  User.findById(req.user._id, function(err, user){ // find logged in user from database
    if(err) return console.log(err)

    if(req.query.status && req.query.of){
      var index = user.pendingContacts.indexOf(req.query.of)

      if(req.query.status == 'approve') {
        user.contacts.push(user.pendingContacts[index])
      }

      user.pendingContacts.splice(index, 1)

      user.save(function(err) {
        if(err) return console.log(err)

        return res.json({success: true})
      })
    } else {
      res.json({success: false})
    }
  })
})

router.get('/:id/profile', function(req, res){
  User.findById(req.params.id).populate({path: 'offersReceived', select: '-createdAt -updatedAt -__v', populate: {path: 'production'}}).populate('productions').exec(function(err, user){
    if(err) return console.log(err)
    res.json(user)
  })
})

router.get('/:id/contacts', function(req, res){
  User.findById(req.params.id).populate({path: 'contacts pendingContacts', select: '-createdAt -updatedAt -__v'}).populate({path: 'productions'}).exec(function(err, user){
    if(err) return console.log(err)
    res.json(user)
  })
})

router.get('/:id/productions', function(req, res){
  User.findById(req.params.id).populate({path: 'productions', select: '-createdAt -updatedAt -__v'}).populate({path: 'offersReceived', populate: {path: 'production'}}).exec(function(err, user){
    if(err) return console.log(err)
    res.json(user)
  })
})

// get a single user
router.get('/:id', function(req, res){
  User.findById(req.params.id).populate('').exec(function(err, user){
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
