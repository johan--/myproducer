const
  express = require('express'),
  router = express.Router(),
  Tag = require('../models/Tag.js'),
  Production = require('../models/Production.js'),
  User = require('../models/User.js')

router.post('/newtag', function(req,res){
  // need check functionality here
  // create Tag object before storing it into User
    Tag.create(req.body, function(err, tag){
      if(err) return console.log(err)
      tag._creator = req.user
      tag.taggables.push(req.body.productions[0])
      tag.taggables.push(req.body.productions[1])
      tag.save()
        Production.findById(req.body.productions[0], function(err, production){
          if(err) return console.log(err);
          production.tag.push(tag._id)
          production.save()
          Production.findById(req.body.productions[1], function(err, production2){
            if(err) return console.log(err);
            production2.tag.push(tag._id)
            production2.save()
            User.findById(tag._creator._id).populate({path: 'taggables'}).exec(function(err,user){
              if(err) return console.log(err)
              user.taggables.push(tag)
              user.save()
              res.json(user)
          })
        })
      })
    })
  })

router.delete('/deletetags', function(req,res){
  User.findOne({_id: req.user._id}, function(err,user){
    user.taggables = []
    user.save()
    res.json(user)
  })
})

  module.exports = router
