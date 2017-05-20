const
  express = require('express'),
  router = express.Router(),
  Tag = require('../models/Tag.js'),
  Production = require('../models/Production.js')

  router.post('/newtag', function(req,res){
    // find those productions by their id
    var newTag = {
      label: req.body.label,
      productions: []
    }
    for(var i=0; i<req.body.productions.length; i++){
      Production.findById(req.body.productions[i], function(err, production){
        if(err) return err
        newTag.productions.push(production._id)
      })
      return console.log(newTag)
    }
  })


  module.exports = router
