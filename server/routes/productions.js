// NPM PACKAGES

var express = require('express')
var router = express.Router()
var moment = require('moment')

// MODELS

var Production = require('../models/Production.js')

// PRODUCTION ROUTES

// get a particular users productions
router.get('/', function(req, res){
  // find it by the user
  User.findById(req.user._id).populate("productions").exec(function(err, user){
    if(err) return console.log(err)
    res.json(user.productions)
  })
})

// create a new production
router.post('/', function(req, res){
  // find it by the user
  User.findById(req.user._id, function(err, user){
    if (err) return console.log(err)

    var to = req.body.to  // prod start date (user input)
    var from = req.body.from // prod end date (user input)
    var days = moment(to).diff(moment(from), 'days') + 1 // number of prod days

    var productions = [] // init a array for mongo batch create

    var counter = 0 // loop counter
    while(counter < days) {
      // production day element
      productions.push({
        date: moment(from).add(counter, 'days').format(),
        by_: req.user._id,
        name: req.body.name,
        productionDay: counter + 1
      })
      counter += 1
    }

    // console.log(productions);
    // console.log(productions.length);

    Production.create(productions, function(err, savedProductions) {
      if (err) return console.log(err)

      savedProductions.forEach(function(p) {
        user.productions.push(p)
      })

      user.save(function(err){
        if(err) return console.log(err)

        // console.log(typeof arguments);
        // console.log(arguments);

        res.json(arguments)
      })
    })
  })
})

// see one specific production
router.get('/:id', function show(req, res){
  Production.findById(req.params.id).populate({path: 'crew', populate: {path: 'to'}}).exec(function(err, production) {
    if(err) return console.log(err)
    res.json(production)
  })
})

// update one specific production
router.patch('/:id', function show(req, res){
  Production.findByIdAndUpdate(req.params.id, req.body, { new: true }, function(err, production) {
    if(err) return console.log(err)
    res.json(production)
  })
})

// delete one specific production
router.delete('/:id', function show(req, res){
  Production.findByIdAndUpdate(req.params.id, { active: false }, { new: true }, function(err, production) {
    if(err) return console.log(err)

    res.json({ success: true })
  })
})

module.exports = router
