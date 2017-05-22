const
  express = require('express'),
  router = express.Router(),
  Tag = require('../models/Tag.js'),
  Production = require('../models/Production.js'),
  User = require('../models/User.js')

router.post('/newtag', function(req,res){
  var user = req.user
  Tag.create(req.body, function(err, tag){
    tag.taggables.push(req.body.productions[0])
    tag.taggables.push(req.body.productions[1])
    tag._creator = req.user
    User.findById(tag._creator._id).populate({path: 'taggables'}).exec(function(err,user){
      user.taggables.push(tag)
      user.save()
      res.json(user)
      // user.populate(tag, {path: 'taggables'}, function(err, newUser){
      //   res.json(newUser)
      // })
      // user.taggables.push(tag)
      // console.log('user found:', user);
      // console.log('tag created',tag);
    })
  })
})

  module.exports = router
