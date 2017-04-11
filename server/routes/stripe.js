// stripe API
var app = require('express')()
var User = require('../models/User.js')
var dotenv = require('dotenv').load({silent: true})
var stripe = require('stripe')(process.env.STRIPE_TEST_SECRET_KEY)

var premiumPlan = stripe.plans.create({
  name: "Premium Plan",
  id: "premium-monthly",
  interval: "month",
  currency: "usd",
  amount: 25
}, function(err,plan){
  // asynchronously called
  if(err) {return err}
  console.log("premium plan was made");
})

var proPlan = stripe.plans.create({
  name: "Pro Plan",
  id: "pro-monthly",
  interval: "month",
  currency: "usd",
  amount: 50
}, function(err,plan){
  // asynchronously called
  if(err) {return err}
  console.log("pro plan was made");
})

app.patch('/register/:id/:plan', function(req, res) {

  const stripeData = req.body.stripeData

  var plan = stripeData.plan
  if(plan === 'pro'){
    plan = "pro-monthly"
  } else if(plan === 'prem'){
    plan = "premium-monthly"
  }

  var customer = stripe.customers.create({
    email: stripeData.email,
    source: stripeData.source
  }, function(err, stripeAcc){
    if(err) return console.log(err);
    console.log("made new stripe user. making subscription now");
    stripe.subscriptions.create({
      customer: stripeAcc.id,
      plan: plan
    }, function(err, subscription){
      if(err) return console.log(err);
      User.findOne({_id: stripeData.user._id}, function(err, user) {
        res.json(user)
      })
    })
  })
})

module.exports = app
