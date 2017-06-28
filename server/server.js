#!/usr/bin/env node
var port = process.env.PORT || 3000

// dependencies
var express = require('express')
var logger = require('morgan')
var cookieParser = require('cookie-parser')
var bodyParser = require('body-parser')
var expressSession = require('express-session')
var mongoose = require('mongoose')
var hash = require('bcrypt-nodejs')
var path = require('path')
var passport = require('passport')
var passportConfig = require('./config/passport.js')
var dotenv = require('dotenv').load({silent: true})
var MongoStore = require('connect-mongo')(expressSession)

// mongoose
var mongoConnectionString = process.env.MONGO_URL

mongoose.Promise = global.Promise;
mongoose.connect(mongoConnectionString, function(err) {
  if(err) return console.log(err)
  console.log("Connected to MongoDB (myproducer)")
})

// user schema/model
var User = require('./models/User.js')

// create instance of express
var app = express()

// require routes
var authRoutes = require('./routes/auth.js') // register, login, logout, status
var userRoutes = require('./routes/users.js')
var productionRoutes = require('./routes/productions.js')
var crewRoutes = require('./routes/crew.js')
var uploadRoutes = require('./routes/fileUploads.js')
var stripeRoutes = require('./routes/stripe.js')
var tagRoutes = require('./routes/tag.js')
var projectRoutes = require('./routes/project.js')

// define middleware
// https
var forceSsl = function (req, res, next) {
   if (req.headers['x-forwarded-proto'] !== 'https') {
       return res.redirect(['https://', req.get('Host'), req.url].join(''));
   }
   return next();
};
  if (dotenv === 'production') {
    app.use(forceSsl);
  }

   // other configurations etc for express go here...

app.use(express.static(path.join(__dirname, '../client')))
app.use(logger('dev'))
app.use(bodyParser.json({limit: '5mb'}))
app.use(bodyParser.urlencoded({ extended: false, limit: '5mb' }))
// app.use(cookieParser())
app.use(require('express-session')({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({url: mongoConnectionString})
}))
app.use(passport.initialize())
app.use(passport.session())
// app.use(express.static(path.join(__dirname, 'public')))

// routes
app.use('/user/', authRoutes) // TODO: Change to api/auth?
app.use('/api/users', userRoutes)
app.use('/api/productions', productionRoutes)
app.use('/api/crew', crewRoutes)
app.use('/uploads', uploadRoutes)
app.use('/stripe', stripeRoutes)
app.use('/api/tag', tagRoutes)
app.use('/api/projects', projectRoutes)

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, '../client', 'index.html'))
})

// error hndlers
app.use(function(req, res, next) {
  var err = new Error('Not Found')
  err.status = 404
  next(err)
})

app.use(function(err, req, res) {
  res.status(err.status || 500)
  res.end(JSON.stringify({
    message: err.message,
    error: {}
  }))
})

app.listen(port, function(err) {
  if(err){console.log(err)}
  console.log("Listening for requests on port:", port)
})
