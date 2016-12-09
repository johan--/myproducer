// NPM PACKAGES

var express = require('express')
var router = express.Router()

// MODELS
var Offer = require('../models/Offer.js')
var User = require('../models/User.js')
var Production = require('../models/Production.js')

router.get('/', function(req, res){

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
        }
      })
    })
  })
})
