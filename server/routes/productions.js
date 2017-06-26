// /api/productions
// NPM PACKAGES

var express = require('express')
var router = express.Router()
var moment = require('moment')
var mailer = require('../nodemailer/mailer.js')

// MODELS

var Production = require('../models/Production.js')
var Role = require('../models/Role.js')
var Department = require('../models/Department.js')
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
  Production.findById(req.params.id)
  .populate({path: 'crew', populate: {path: 'to'}})
  .populate({path: 'by_', select: 'username first_name last_name'})
  .populate({path: 'departments', populate: {path: 'crew', populate: {path: 'to'}}})
  .populate({path: 'departments', populate: {path: 'production', populate: {path: 'crew', populate: {path: 'to'}}}})
  .populate({path: 'departments', populate: {path: 'roles', populate: {path: 'user'}}})
  .exec(function(err, production) {
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

router.post('/newdepartment', function(req,res){
  Department.create(req.body, function(err, department){
    if(err) return console.log(err);
    department.populate('production', function(err){
      if(err) return console.log(err);
      // console.log(department);
      Production.findById(req.body.production, function(err, production){
        production.departments.push(department._id)
        production.populate({path: 'departments', populate: {path: 'crew', populate: {path: 'to'}}}, function(err){
          production.save()
          res.json(production)
        })
      })
    })
  })
})

router.post('/newrole', function(req,res){
  // TODO update the sumif for the production
  Department.findById(req.body.department, function(err, department){
    if(err) return console.log(err);
    Production.findById(department.production, function(err, production){
      if(err) return console.log(err);
      Role.create({position: req.body.position, basis: req.body.basis, rate: parseInt(req.body.rate), hours: parseInt(req.body.hours), _creator: req.user._id, user: req.body.contactId}, function(err,role){
        if(err) return console.log(err);
        department.roles.push(role._id)

        if(role.basis == 'Hourly'){
          production.sumif.rateTotal += role.rate * role.hours
          production.sumif.hourTotal += role.hours
          production.save()
        } else if(role.basis == 'Daily'){
          production.sumif.rateTotal += role.rate
          production.sumif.hourTotal += role.hours
          production.save()
        }

        department.save(function(err, savedDepartment){
          if(err) return console.log(err);
          savedDepartment
          .populate({path: 'roles', populate: {path: 'user'}})
          .populate({path: 'productions'}, function(err, populatedDepartment){
            if(err) return console.log(err);
            res.json(populatedDepartment)
          })
        })
      })
    })
  })
})

router.post('/removeRole', function(req,res){
  // TODO update the sumif of the production
  Department.findById(req.body.department, function(err, department){
    if(err) return console.log(err);
    Production.findById(department.production, function(err, production){
      if(err) return console.log(err);
      var index = department.roles.indexOf(req.body.role)
      department.populate({path: 'roles', populate: {path: 'user'}}, function(err, populatedDepartment){
        if(err) return console.log(err);
        if(department.roles[index].basis == 'Hourly'){
          production.sumif.rateTotal -= department.roles[index].rate * department.roles[index].hours
          production.sumif.hourTotal -= department.roles[index].hours
          production.save()
        } else if(department.roles[index].basis == 'Daily'){
          production.sumif.rateTotal -= department.roles[index].rate
          production.sumif.hourTotal -= department.roles[index].hours
          production.save()
        }

        department.roles.splice(index, 1)
        department.save()
        res.json(populatedDepartment)
      })
    })
  })
})

router.post('/makeTotal', function(req,res){
  var production = req.body
  var productionSumIf = {
    rateTotal: 0,
    hourTotal: 0
  }

  for(var i=0; i<production.departments.length; i++){
    productionSumIf.rateTotal += getRoles(production.departments[i]).rateTotal

    productionSumIf.hourTotal += getRoles(production.departments[i]).hourTotal

    getOffers(production.departments[i]).then(function(data){
      productionSumIf.rateTotal += data.offerRateTotal
      productionSumIf.hourTotal += data.offerHourTotal

      Production.findById(production._id, function(err, newProduction){
        if(err) return console.log(err);
        newProduction.sumif.rateTotal = productionSumIf.rateTotal
        newProduction.sumif.hourTotal = productionSumIf.hourTotal
        newProduction.save(function(err, savedProduction){
          if(err) return console.log(err);
          res.json(savedProduction)
        })
      })
    })
  }
})

var getOffers = function(department){
  return new Promise(function(resolve, reject){
    var offerRateTotal = 0
    var offerHourTotal = 0
    Department.findById(department._id, function(err, department){
      if(err) return console.log(err);
      if(department.crew.length > 0){
        department.populate({path: 'crew'}, function(err, populatedDepartment){
          if(err) return console.log(err);
          for(var i=0; i<populatedDepartment.crew.length; i++){
            offerRateTotal = offerRateTotal + (populatedDepartment.crew[i].offer.rate * populatedDepartment.crew[i].offer.hours)
            offerHourTotal += populatedDepartment.crew[i].offer.hours
          }
          resolve({offerRateTotal: offerRateTotal, offerHourTotal: offerHourTotal})
        })
      } else {
        reject({offerRateTotal: offerRateTotal, offerHourTotal: offerHourTotal})
      }
    })
  })
}


function getRoles(department){
  var departmentRateTotal = 0
  var departmentHourTotal = 0

  for(var i=0; i<department.roles.length; i++){
    if(department.roles[i].basis == 'Hourly'){
      var hourlyRate = department.roles[i].rate * department.roles[i].hours

      departmentRateTotal += hourlyRate
      departmentHourTotal += department.roles[i].hours
    } else if(department.roles[i].basis == 'Daily'){
      departmentRateTotal += department.roles[i].rate
      departmentHourTotal += department.roles[i].hours
    }
  }
  return {rateTotal: departmentRateTotal, hourTotal: departmentHourTotal}
}

module.exports = router
