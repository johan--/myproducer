// NPM PACKAGES

var express = require('express')
var mongoose = require('mongoose')
var router = express.Router()

// MODELS
var Crew = require('../models/Crew.js')
var User = require('../models/User.js')
var Production = require('../models/Production.js')
var Message = require('../models/Message.js')
var Department = require('../models/Department.js')
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
  newCrew.to = req.body.crewId
  newCrew.production = new mongoose.mongo.ObjectId(req.body.productionId)

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

                Department.findById(req.body.departmentId, function(err, department){
                  if(err) return console.log(err);
                  department.crew.push(crew)
                  department.save()
                  department.populate('crew', function(err, populatedDepartment){
                    if(err) return console.log(err);
                    res.json(populatedDepartment)

                  })

                })

                // Production.populate(newProduction, {path: 'crew', populate: {path: 'to'}}, function(err, populatedProduction){
                //   if(err) return console.log(err)
                //
                //   // / Return updated crew list
                //   res.json(populatedProduction.crew)
                // })
              })
            })
          })
        })
      })
    })
  })
})

router.get('/:id', function(req, res){
  Crew.findById(req.params.id).populate({path: 'message', populate: {path: '_by', select: 'username first_name last_name picture'}}).populate({path: 'production', populate: {path: 'by_'}}).populate({path: 'to'}).exec(function(err, crew){
    if(err) return console.log(err)
    if(crew){
      if(crew.active) {
        res.json(crew)
      } else {
        res.json(null)
      }
    } else {
      res.json(null)
    }

  })
})

router.patch('/:id', function(req, res){
  Crew.findByIdAndUpdate(req.params.id, req.body, { new: true }, function(err, crew){
    if(err) return console.log(err)

    // variables for NODEMAILER
    var offerURL = 'https://app.myproducer.io/#/offer/' + crew._id
    var fromEmail =req.user.username
    var fromName = req.user.first_name + ' ' + req.user.last_name
    var fromFirstName = req.user.first_name
    User.findById(crew.to).exec(function(err, user){
      var toEmail = user.username
      var toName = user.first_name

    Production.findById(crew.production, function(err, production){
      if(err) return console.log(err);
      // console.log('production that was found:');
      var productionDate = production.date.toDateString()

      // send mail
        mailer.send(
          'offer',
          {
            recipient: toName,
            sender: fromName,
            senderFirstName: fromFirstName,
            offerURL: offerURL,
            productionDate: productionDate
          },
          {
            to: toEmail,
            subject: 'New offer from myproducer.io'
          }
        )
      })

    res.json(crew)
    })
  })
})

// this patch is here for accepting and declining offers so that it doesn't send email
router.patch('/:id/status', function(req, res){
  Crew.findByIdAndUpdate(req.params.id, req.body, { new: true }, function(err, crew){
    if(err) return console.log(err)
    res.json(crew)
  })
})

router.post('/:id/message', function(req, res){
  Crew.findById(req.params.id, function(err, crew){
    if(err) return console.log(err)
    // if no one is logged in, hard code who the email is from and who the sender is
    if(!req.user){
      User.find({username: req.query.crew}, function(err,fromUser){
        if(err) return console.log(err);

      var fromEmail = req.query.crew
      var toEmail = req.query.producer
      var messageContent = req.body.content
      var fromName = fromUser[0].first_name + ' ' + fromUser[0].last_name

      var message = new Message()
      message._by = fromUser[0]._id
      message.content = messageContent

      message.save(function(err, newMessage) {
        crew.message.push(newMessage)

        crew.save(function(err,newCrew){
          if(err) return console.log(err)

          var offerId = newCrew._id
          var offerURL = 'https://app.myproducer.io/#/offer/' + offerId

          mailer.send(
            'message',
            {
              recipient: toEmail,
              sender: fromName,
              message: messageContent,
              offerURL: offerURL
            },
            {
              to: toEmail,
              subject: 'New message from myproducer.io'
            }
          )

          Crew.populate(newCrew, {path: 'message', populate: {path: '_by'}}, function(err, populatedCrew) {
            if(err) return console.log(err)
            console.log('populated crew:', populatedCrew);

            res.json(populatedCrew.message)
          })

        })
      })
    })

    } else {
    // variables for NODEMAILER

    // the email the message is from
    var fromEmail = req.user.username
    var fromName = req.user.first_name + ' ' + req.user.last_name
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

        // console.log(fromEmail + ' -> ' + toEmail) // here to test emails are going in the right direction

        var offerId = newCrew._id
        var offerURL = 'https://app.myproducer.io/#/offer/' + offerId

        mailer.send(
          'message',
          {
            recipient: toEmail,
            sender: fromName,
            message: messageContent,
            offerURL: offerURL
          },
          {
            to: toEmail,
            subject: 'New message from myproducer.io'
          }
        )

        Crew.populate(newCrew, {path: 'message', populate: {path: '_by'}}, function(err, populatedCrew) {
          if(err) return console.log(err)

          res.json(populatedCrew.message)
        })
      })
    })
  }
  })
})

router.delete('/:id', function(req, res){
  Crew.findByIdAndUpdate(req.params.id, { active: false }, { new: true },function(err, crew){
    if(err) return console.log(err)

    res.json({ success: true })
  })
})

module.exports = router
