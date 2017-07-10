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

router.post('/newProject', function(req,res){
  User.findById(req.user._id, function(err, user){
    if(err) return console.log(err);

    var to = req.body.to
    var from = req.body.from
    var newProject = {
      name: req.body.name,
      by_: req.user._id,
      date: moment(to),
      startDate: moment(from),
      endDate: moment(to)
    }

    Production.create(newProject, function(err,project){
      if(err) return console.log(err);
      user.productions.push(project)
      user.projects.push(project)
      user.save(function(err){
        if(err) return console.log(err);
        res.json(project)
      })
    })
  })
})

// create a new production
router.post('/', function(req, res){
  // find it by the user
  User.findById(req.user._id, function(err, user){
    if (err) return console.log(err)

    var to = req.body.to  // prod end date (user input)
    var from = req.body.from // prod start date (user input)
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
    var productionSumIf = {
      rateTotal: 0,
      hourTotal: 0
    }

  if(production.departments.length > 0){
    // make sumif for the production
    for(var i=0; i<production.departments.length; i++){
      productionSumIf.rateTotal += getRoles(production.departments[i]).rateTotal

      productionSumIf.hourTotal += getRoles(production.departments[i]).hourTotal

      getOffers(production.departments[i])
        .then(function(data){
          productionSumIf.rateTotal += data.offerRateTotal
          productionSumIf.hourTotal += data.offerHourTotal
        })
        .catch(function(data){
          productionSumIf.rateTotal += data.offerRateTotal
          productionSumIf.hourTotal += data.offerHourTotal
        })

        if(i == production.departments.length - 1){
          setTimeout(function(){
              production.sumif.rateTotal = productionSumIf.rateTotal
              production.sumif.hourTotal = productionSumIf.hourTotal

              production.save(function(err, savedProduction){
                if(err) return console.log(err);
                res.json(savedProduction)
              })
          }, 250)
        }
      }
    } else {
      // if its a new production with no departments created yet
      res.json(production)
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

        production
          .populate({path: 'departments', populate: [{path: 'roles', populate: {path: 'user'}}, {path: 'crew', populate: {path: 'to'}}]}, function(err){
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
      var newRole = {}
      if(req.body.basis == 'Fixed'){
        newRole.position = req.body.position
        newRole.basis = req.body.basis
        newRole.rate = parseInt(req.body.rate)
        newRole._creator = req.user._id
        newRole.user = req.body.contactId
        newRole.startDate = req.body.startDate
        newRole.endDate = req.body.endDate
      } else if(req.body.basis == 'Hourly'){
        newRole.position = req.body.position
        newRole.basis = req.body.basis
        newRole.rate = parseInt(req.body.rate)
        newRole.hours = parseInt(req.body.hours)
        newRole._creator = req.user._id
        newRole.user = req.body.contactId
        newRole.days = req.body.days
        newRole.startDate = req.body.startDate
        newRole.endDate = req.body.endDate
      } else if(req.body.basis == 'Daily'){
        newRole.position = req.body.position
        newRole.basis = req.body.basis
        newRole.rate = parseInt(req.body.rate)
        newRole._creator = req.user._id
        newRole.user = req.body.contactId
        newRole.days = req.body.days
        newRole.hours = req.body.hours
        newRole.startDate = req.body.startDate
        newRole.endDate = req.body.endDate
      }

      Role.create(newRole, function(err,role){
        if(err) return console.log(err);
        department.roles.push(role._id)
            //////////////////////////////////////////

        // algorithm for finding out number of weeks
        // var oneDay = 24*60*60*1000
        // var daysInDateRange = Math.abs((role.endDate.getTime() - role.startDate.getTime())/(oneDay));
        // var weeks = Math.round(daysInDateRange/7)


        // if(weeks == 0){
        //   if(basis == 'Hourly'){
        //     production.sumif.rateTotal += (role.rate * role.hours) * req.body.daysInWeek
        //     production.sumif.hourTotal += role.hours * req.body.daysInWeek
        //     production.save()
        //   } else if(role.basis == 'Daily'){
        //     production.sumif.rateTotal += role.rate * req.body.daysInWeek
        //     production.sumif.hourTotal += role.hours * req.body.daysInWeek
        //     production.save()
        //   }
        // } else {

            //////////////////////////////////////////

          var rate = role.rate
          var basis = role.basis

          if(basis == 'Hourly'){
            var days = role.days
            var hours = role.hours
            production.sumif.rateTotal += (rate * hours) * days
            production.sumif.hourTotal += hours * days
            production.save()
          } else if(basis == 'Daily'){
            var days = role.days
            var hours = role.hours
            production.sumif.rateTotal += rate * days
            production.sumif.hourTotal += hours
            production.save()
          } else if(basis == 'Fixed'){
            production.sumif.rateTotal += rate
            production.save()
          }
        // }

        department.save(function(err, savedDepartment){
          if(err) return console.log(err);
          savedDepartment
          .populate({path: 'roles', populate: {path: 'user'}})
          .populate({path: 'production'}, function(err, populatedDepartment){
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
      var index = department.roles.indexOf(req.body.role)
      department
      .populate({path: 'roles', populate: {path: 'user'}})
      .populate({path: 'production'}, function(err, populatedDepartment){
        if(err) return console.log(err);
        // var oneDay = 24*60*60*1000
        // var daysInDateRange = Math.abs((department.roles[index].endDate.getTime() - department.roles[index].startDate.getTime())/(oneDay));
        // var weeks = Math.round(daysInDateRange/7)

        var rate = department.roles[index].rate
        var hours = department.roles[index].hours
        var days = department.roles[index].days
        var basis = department.roles[index].basis

        // if(weeks == 0){
        //   if(department.roles[index].basis == 'Hourly'){
        //     populatedDepartment.production.sumif.rateTotal -= (rate * hours) * daysInWeek
        //     populatedDepartment.production.sumif.hourTotal -= hours * daysInWeek
        //     populatedDepartment.save()
        //   } else if(department.roles[index].basis == 'Daily'){
        //     populatedDepartment.production.sumif.rateTotal -= rate * daysInWeek
        //     populatedDepartment.production.sumif.hourTotal -= hours * daysInWeek
        //     populatedDepartment.save()
        //   }
        // } else {
          if(basis == 'Hourly'){
            populatedDepartment.production.sumif.rateTotal -= (rate * hours) * days
            populatedDepartment.production.sumif.hourTotal -= hours * days
            populatedDepartment.save()
        } else if(basis == 'Daily'){
            populatedDepartment.production.sumif.rateTotal -= rate * days
            // populatedDepartment.production.sumif.hourTotal -= hours * days
            populatedDepartment.save()
          } else if(basis == 'Fixed'){
            populatedDepartment.production.sumif.rateTotal -= rate
            populatedDepartment.save()
          }
        // }

        department.roles.splice(index, 1)
        department.save()
        res.json(populatedDepartment)
      })
  })
})

// might not need this route
router.post('/makeTotal', function(req,res){
  var production = req.body
  var productionSumIf = {
    rateTotal: 0,
    hourTotal: 0
  }

    for(var i=0; i<production.departments.length; i++){
      // roles
      productionSumIf.rateTotal += getRoles(production.departments[i]).rateTotal

      productionSumIf.hourTotal += getRoles(production.departments[i]).hourTotal

      // offers
      getOffers(production.departments[i])
        .then(function(data){
          // if department has offers
          productionSumIf.rateTotal += data.offerRateTotal
          productionSumIf.hourTotal += data.offerHourTotal
        })
        .catch(function(data){
          // if department has no offers
          productionSumIf.rateTotal += data.offerRateTotal
          productionSumIf.hourTotal += data.offerHourTotal
        })

        if(i == production.departments.length -1){
          // when loop is done running
          // timeout to wait for get offers promise data
          setTimeout(function(){
            Production.findById(production._id, function(err, newProduction){
              if(err) return console.log(err);
              newProduction.sumif.rateTotal = productionSumIf.rateTotal
              newProduction.sumif.hourTotal = productionSumIf.hourTotal
              newProduction.save(function(err, savedProduction){
                if(err) return console.log(err);
                res.json(savedProduction)
              })
            })
          }, 250)
        }
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
            if(populatedDepartment.crew[i].offer.rate && populatedDepartment.crew[i].offer.hours){
              offerRateTotal += populatedDepartment.crew[i].offer.rate * populatedDepartment.crew[i].offer.hours

              offerHourTotal += populatedDepartment.crew[i].offer.hours
          }
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
    // var oneDay = 24*60*60*1000
    // var daysInDateRange = Math.abs((department.roles[i].endDate.getTime() - department.roles[i].startDate.getTime())/(oneDay));
    // var weeks = Math.round(daysInDateRange/7)
    // var daysInWeek = department.roles[i].daysInWeek


    // if(weeks == 0){
    //   if(department.roles[i].basis == 'Hourly'){
    //     departmentRateTotal += (rate * hours) * daysInWeek
    //     departmentHourTotal += hours * daysInWeek
    //   } else if(department.roles[i].basis == 'Daily'){
    //     departmentRateTotal += rate * daysInWeek
    //     departmentHourTotal += hours * daysInWeek
    //   }
    // } else {

    var rate = department.roles[i].rate
    var basis = department.roles[i].basis

      if(basis == 'Hourly'){
        var hours = department.roles[i].hours
        var days = department.roles[i].days
        departmentRateTotal += (rate * hours) * days
        departmentHourTotal += hours * days
      } else if(basis == 'Daily'){
        var days = department.roles[i].days
        var hours = department.roles[i].hours
        departmentRateTotal += rate * days
        departmentHourTotal += hours * days
      } else if(basis == 'Fixed'){
        departmentRateTotal += rate
      }

  }
  return {rateTotal: departmentRateTotal, hourTotal: departmentHourTotal}
}

module.exports = router
