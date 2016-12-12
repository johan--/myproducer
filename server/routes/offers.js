// NPM PACKAGES

var express = require('express')
var router = express.Router()

// MODELS
var Offer = require('../models/Offer.js')
var User = require('../models/User.js')
var Production = require('../models/Production.js')
var Message = require('../models/Message.js')

router.get('/', function(req, res){
  Offer.find({active: true}, function(err, offers){
    if(err) return console.log(err)

    res.json(offers)
  })
})

router.post('/', function(req, res){

  // Create offer from req.body
  Offer.create(req.body, function(err, offer){
    if(err) return console.log(err)

    // Find user who submitted the offer
    User.findById(offer.from, function(err, user){
      if(err) return console.log(err)
      // Add offer to user's sent offer list
      user.offersSent.push(offer)

      // Save user who submitted the offer
      user.save(function(err){
        if(err) return console.log(err)

        // Find user who received the offer
        User.findById(offer.to, function(err, user){
          if(err) return console.log(err)
          // Add offer to user's received offer list
          user.offersReceived.push(offer)

          // Save user who received the offer
          user.save(function(err){
            if(err) return console.log(err)

            // Find production where offer is for
            Production.findById(offer.production, function(err, production){
              if(err) return console.log(err)
              // Add offer to production's list of offers
              production.offers.push(offer);

              // Save production
              production.save(function(err){
                if(err) return console.log(err)

                // Return offer created
                res.json(offer)
              })
            })
          })
        })
      })
    })
  })
})

router.get('/:id', function(req, res){
  Offer.findById(req.params.id).populate('from to production message').exec(function(err, offer){
    if(err) return console.log(err)

    res.json(offer)
  })
})

router.patch('/:id', function(req, res){
  Offer.findByIdAndUpdate(req.params.id, req.body, { new: true }, function(err, offer){
    if(err) return console.log(err)

    res.json(offer)
  })
})

router.post('/:id/message', function(req, res){
  Offer.findById(req.params.id, function(err, offer){
    if(err) return console.log(err)

    var message = new Message();
    message._by = req.user._id
    message.content = req.body.content

    offer.messages.push(message)

    offer.save(function(err, newOffer){
      if(err) return console.log(err)

      res.json(newOffer)
    })
  })
})

router.delete('/:id', function(req, res){
  Offer.findByIdAndUpdate(req.params.id, { active: false }, { new: true },function(err, offer){
    if(err) return console.log(err)

    res.json({ success: true })
  })
})

module.exports = router
