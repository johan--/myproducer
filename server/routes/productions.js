// NPM PACKAGES

var express = require('express')
var router = express.Router()
var moment = require('moment')
var mailer = require('../nodemailer/mailer.js')

// MODELS

var Production = require('../models/Production.js')

var Tag = require('../models/Tag.js')
// PRODUCTION ROUTES

// get a particular users productions
router.get('/', function(req, res){
  // find it by the user
  User.findById(req.user._id).populate("productions").exec(function(err, user){
    if(err) return console.log(err)

    if(user && user.active){
      user.productions = user.productions.filter(function(p) {
        return p.active
      })

      res.json(user.productions)
    } else {
      res.json(null)
    }
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

        res.json(savedProductions)
      })
    })
  })
})

// see one specific production
router.get('/:id', function show(req, res){
  Production.findById(req.params.id).populate({path: 'crew', populate: {path: 'to'}}).populate({path: 'by_', select: 'username first_name last_name'}).exec(function(err, production) {
    if(err) return console.log(err)

    if(production.active) {
      res.json(production)
    } else {
      res.json(null)
    }
  })
})

// update one specific production
router.patch('/:id', function show(req, res){
  Production.findByIdAndUpdate(req.params.id, req.body, { new: true }, function(err, production) {
    if(err) return console.log(err)
    if(req.body.googleLocations){
      production.location = req.body.googleLocations
      production.save()
    }
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

// notify crew of production status
router.post('/:id/notify', function show(req, res){
  Production.findById(req.params.id).populate({path: 'crew', populate: {path: 'to'}}).exec(function(err, production) {
    if(err) return console.log(err)
    var productionURL = 'http://app.myproducer.io/#/production/' + production._id
    var fromEmail = req.user.username
    var fromName = req.user.first_name + ' ' + req.user.last_name
    var body = req.body.content
    // build an array of users in crew
    var crewArray  = production.crew
    // console.log(body);
    // loop through users in crew building the toEmail string
    for(var i = 0; i < crewArray.length; i+=1){
      toEmail = crewArray[i].to.username
      toName = crewArray[i].to.first_name
      mailer.send(
        'productionChange',
        {
          body: body,
          sender: fromName,
          recipient: toName,
          productionURL: productionURL
        },
        {
          to: toEmail,
          subject: 'Production update from ' + fromName // producer name
        }
      )
    }
  res.json({success : true})
  })
})

module.exports = router
