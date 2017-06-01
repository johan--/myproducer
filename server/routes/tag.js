const
  express = require('express'),
  router = express.Router(),
  Tag = require('../models/Tag.js'),
  Production = require('../models/Production.js'),
  User = require('../models/User.js')

function setMinDate(date1,date2){
  const compareDate1 = new Date(date1).getTime()
  const compareDate2 = new Date(date2).getTime()

  if(compareDate1 < compareDate2){
    return compareDate1
  } else {
    return compareDate2
  }
}

function setMaxDate(date1,date2){
  const compareDate1 = new Date(date1).getTime()
  const compareDate2 = new Date(date2).getTime()

  if(compareDate1 > compareDate2){
    return compareDate1
  } else {
    return compareDate2
  }
}

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
              tag.minDate = setMinDate(production.date, production2.date)
              tag.maxDate = setMaxDate(production.date, production2.date)
              tag.save()
              user.taggables.push(tag)
              user.save()
              res.json(user)
          })
        })
      })
    })
  })

router.patch('/addproduction', function(req,res){
  Production.findById(req.body.productionId, function(err,production){
    if(err) return console.log(err);
    production.tag.push(req.body.tagId)
    production.save()
    Tag.findById(req.body.tagId, function(err,tag){
      if(err) return console.log(err);
      tag.taggables.push(req.body.productionId)
      tag.save()
      res.json(tag)
    })
  })
})

router.patch('/:id', function(req,res){
  // find tag
  Tag.findById(req.body.id, function(err,tag){
    if(err) return console.log(err);
    tag.taggables.forEach(function(t){
      Production.findById(t, function(err, production){
        if(err) return console.log(err);
        production.tag = []
        production.save()
        tag.taggables = []
        tag.save()
    })
  })

    User.findById(req.user._id).populate({path: 'taggables', populate: {path: 'taggables'}}).populate({path: 'productions'}).exec(function(err, user){
      if(err) return console.log(err);
      console.log(user);
      var index = user.taggables.indexOf(tag._id)
      user.taggables.splice(index,1)
      user.save()
      res.json(user)
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
