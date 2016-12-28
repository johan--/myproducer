// NPM PACKAGES

var express = require('express')
var mongoose = require('mongoose')
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
  var newCrew = new Crew()
  newCrew.to = req.body.to
  newCrew.production = new mongoose.mongo.ObjectId(req.body.production)

  newCrew.save(function(err, crew){
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
              production.save(function(err, newProduction){
                if(err) return console.log(err)

                Production.populate(newProduction, {path: 'crew', populate: {path: 'to'}}, function(err, populatedProduction){
                  if(err) return console.log(err)

                  // / Return updated crew list
                  res.json(populatedProduction.crew)
                })
              })
            })
          })
        })
      })
    })
  })
})

router.get('/:id', function(req, res){
  Crew.findById(req.params.id).populate({path: 'message', populate: {path: '_by', select: 'username'}}).populate({path: 'production', populate: {path: 'by_'}}).populate({path: 'to'}).exec(function(err, crew){
    if(err) return console.log(err)
    console.log(crew.message);
    res.json(crew)
  })
})

router.patch('/:id', function(req, res){
  Crew.findByIdAndUpdate(req.params.id, req.body, { new: true }, function(err, crew){
    if(err) return console.log(err)

    // variables for NODEMAILER
    var offerURL = 'http://myproducer.io/#/offer/' + crew._id
    var fromEmail =req.user.username
    User.findById(crew.to).exec(function(err, user){
      var toEmail = user.username

      console.log(offerURL, fromEmail, toEmail) //mail test

      // send mail TODO Wont send email until commented in!
      //   mailer.send(
      //     'offer',
      //     {
      //       recipient: toEmail,
      //       sender: fromEmail,
      //       offerURL: offerURL
      //     },
      //     {
      //       to: toEmail,
      //       subject: 'New offer from myproducer.io'
      //     }
      //   )
      })

    res.json(crew)
  })
})

router.post('/:id/message', function(req, res){
  console.log(req.params.id)
  Crew.findById(req.params.id, function(err, crew){
    if(err) return console.log(err)

    // variables for NODEMAILER

    // the email the message is from
    var fromEmail = req.user.username
    // the message content
    var messageContent = req.body.content

    // if the sender is not the crew
    if (fromEmail !=req.query.crew) {
      // the receiving email is the crew's in params
      var toEmail = req.query.crew
    }
    else {
      // otherwise the receiving email is the producer's in params
        var toEmail = req.query.producer
    }

    var message = new Message();
    message._by = req.user._id
    message.content = req.body.content

    message.save(function(err, newMessage){
      crew.message.push(newMessage)

      crew.save(function(err, newCrew){
        if(err) return console.log(err)

        console.log(fromEmail + ' -> ' + toEmail) // here to test emails are going in the right direction

        var offerId = newCrew._id
        var offerURL = 'http://myproducer.io/#/offer/' + offerId
        // TODO WONT SEND EMAIL UNTIL COMMENTED IN
        // mailer.send(
        //   'message',
        //   {
        //     recipient: toEmail,
        //     sender: fromEmail,
        //     message: messageContent,
        //     offerURL: offerURL
        //   },
        //   {
        //     to: toEmail,
        //     subject: 'New message from myproducer.io'
        //   }
        // )

        Crew.populate(newCrew, {path: 'message', populate: {path: '_by'}}, function(err, populatedCrew) {
          if(err) return console.log(err)

          res.json(populatedCrew.message)
        })
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
