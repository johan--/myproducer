// /api/projects
const
  express = require('express'),
  router = express.Router(),
  moment = require('moment'),
  mailer = require('../nodemailer/mailer.js'),
  Project = require('../models/Project.js'),
  Role = require('../models/Role.js'),
  Department = require('../models/Department.js'),
  Tag = require('../models/Tag.js')

router.post('/', function(req,res){
  User.findById(req.user._id, function(err,user){
    if(err) return console.log(err);
    var to = req.body.to
    var from = req.body.from

    var newProject = {
      startDate: moment(from),
      endDate: moment(to),
      by_: req.user._id,
      name: req.body.name
    }

    Project.create(newProject, function(err, project){
      if(err) return console.log(err);
      user.projects.push(project)
      user.save(function(err){
        if(err) return console.log(err);
        res.json(project)
      })
    })
  })
})

module.exports = router
