// NPM PACKAGES

var express = require('express')
var mongoose = require('mongoose')
var router = express.Router()

// MODELS
var Crew = require('../models/Crew.js')
var User = require('../models/User.js')
var Production = require('../models/Production.js')
var Message = require('../models/Message.js')

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
  Crew.findById(req.params.id).populate({path: 'message', populate: {path: '_by', select: 'username'}}).populate({path: 'production', populate: {path: 'by_'}}).exec(function(err, crew){
    if(err) return console.log(err)
    console.log(crew.message);
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

    var message = new Message();
    message._by = req.user._id
    message.content = req.body.content

    message.save(function(err, newMessage){
      crew.message.push(newMessage)

      crew.save(function(err, newCrew){
        if(err) return console.log(err)

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
