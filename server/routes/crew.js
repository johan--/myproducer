// NPM PACKAGES

var express = require('express')
var router = express.Router()

// MODELS
var Crew = require('../models/Crew.js')
var User = require('../models/User.js')
var Production = require('../models/Production.js')
var Message = require('../models/Message.js')
var mailer = require('../nodemailer/mailer.js')

router.get('/', function(req, res){
  Crew.find({active: true}, function(err, crew){
    if(err) return console.log(err)

    res.json(crew)
  })
})

router.post('/', function(req, res){

  // Create crew from req.body
  Crew.create(req.body, function(err, crew){
    if(err) return console.log(err)

    // Find user who submitted the crew
    User.findById(req.user._id, function(err, user){
      if(err) return console.log(err)
      // Add crew to user's sent crew list
      user.offersSent.push(crew)

      // Save user who submitted the crew
      user.save(function(err){
        if(err) return console.log(err)

        // Find user who received the crew
        User.findById(crew.to, function(err, user){
          if(err) return console.log(err)
          // Add crew to user's received crew list
          user.offersReceived.push(crew)

          // Save user who received the crew
          user.save(function(err){
            if(err) return console.log(err)

            // Find production where crew is for
            Production.findById(crew.production, function(err, production){
              if(err) return console.log(err)
              // Add crew to production's list of crew
              production.crew.push(crew);

              // Save production
              production.save(function(err){
                if(err) return console.log(err)

                // Return crew created
                res.json(crew)
              })
            })
          })
        })
      })
    })
  })
})

router.get('/:id', function(req, res){
  Crew.findById(req.params.id).populate({path: 'from to production message', populate: {path: '_by'}}).exec(function(err, crew){
    if(err) return console.log(err)

    res.json(crew)
  })
})

router.patch('/:id', function(req, res){
  Crew.findByIdAndUpdate(req.params.id, req.body, { new: true }, function(err, crew){
    if(err) return console.log(err)

    res.json(crew)
  })
})

router.post('/:id/message', function(req, res){
  Crew.findById(req.params.id, function(err, crew){
    if(err) return console.log(err)

    // console.log(crew)
    // console.log(req)

    // variables for NODEMAILER
    var fromEmail = req.user.username
    var messageContent = req.body.content

    var message = new Message();
    message._by = req.user._id
    message.content = req.body.content

    message.save(function(err, newMessage){
      crew.message.push(newMessage)

      crew.save(function(err, newCrew){
        if(err) return console.log(err)

        console.log(newCrew)
        var offerId = newCrew._id
        var offerURL = 'http://myproducer.io/#/offer/' + offerId
        mailer.send(
          'message',
          {
            recipient: 'Alex', // TODO
            sender: fromEmail,
            message: messageContent,
            offerURL: offerURL
          },
          {
            to: 'alex.karevoll@gmail.com', // TODO
            subject: 'New message from myproducer.io'
          }
        )
        res.json(newCrew)
      })
    })
  })
})

router.delete('/:id', function(req, res){
  Crew.findByIdAndUpdate(req.params.id, { active: false }, { new: true },function(err, crew){
    if(err) return console.log(err)

    res.json({ success: true })
  })
})

module.exports = router
