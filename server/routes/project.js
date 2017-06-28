const
  express = require('express'),
  router = express.Router(),
  moment = require('moment'),
  mailer = require('../nodemailer/mailer.js'),
  Project = require('../models/Project.js'),
  Role = require('../models/Role.js'),
  Department = require('../models/Department.js'),
  Tag = require('../models/Tag.js')

router.get('/', function(req,res){
  res.json({message: 'project route hit'})
})

module.exports = router
