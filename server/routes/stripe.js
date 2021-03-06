// stripe API
var app = require('express')()
var User = require('../models/User.js')
var dotenv = require('dotenv').load({silent: true})
var stripe = require('stripe')(process.env.STRIPE_LIVE_SECRET_KEY)

// route for making coupons
app.patch('/coupon', function(req, res){
  const user = req.body.user

  var customer = stripe.customers.create({
    email: user.username
  }, function(err, stripeAcc){
      if(err) res.json(err);
      stripe.subscriptions.create({
        customer: stripeAcc.id,
        plan: 'pro-monthly',
        coupon: 'mp'
      }, function(err, subscription){
        if(err) return res.json(err);
        User.findOne({_id: user._id}, function(err, mpuser){
          var mpstaffuser = mpuser
          mpstaffuser.stripeAccount = stripeAcc,
          mpstaffuser.stripePlan = subscription
          mpstaffuser.save()

          res.json(mpstaffuser)
        })
      })
    })
})

// route to make new customers
app.patch('/register/:plan', function(req, res) {

  const stripeData = req.body.stripeData

  var plan = stripeData.plan
  if(plan === 'producer'){
    plan = "producer-monthly"
  }

  var customer = stripe.customers.create({
    email: stripeData.email,
    source: stripeData.source
  }, function(err, stripeAcc){
    if(err) return console.log(err);
    stripe.subscriptions.create({
      coupon: stripeData.coupon,
      customer: stripeAcc.id,
      plan: plan
    }, function(err, subscription){
      if(err) return console.log(err);
      User.findOne({_id: stripeData.user._id}, function(err, user) {
        var newUser = user
        newUser.stripePlan = subscription
        newUser.stripeAccount = stripeAcc
        newUser.save()

        const newStripeData = {
          user: newUser
        }
        res.json(newStripeData)
      })
    })
  })
})

module.exports = app
