// stripe API
var express = require('express')
var User = require('../models/User.js')
var dotenv = require('dotenv').load({silent: true})
var stripe = require('stripe')('sk_live_bsh9TyVVeyHDF0BCFEK3TnIF')

var customer = stripe.customers.create({
  email: req.body.email,
  plan: req.body.plan,
}, function(err,customer){
  // asynchronously called
})

var premiumPlan = stripe.plan.create({
  name: "Premium Plan",
  id: "premium-monthly",
  interval: "month",
  currency: "usd",
  amount: 25
}, function(err,plan){
  // asynchronously called
  if(err) {return err}
  console.log(plan);
})

var proPlan = stripe.plan.create({
  name: "Pro Plan",
  id: "pro-monthly",
  interval: "month",
  currency: "usd",
  amount: 50
}, function(err,plan){
  // asynchronously called
  if(err) {return err}
  console.log(plan);
})
