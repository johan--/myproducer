var path = require('path')
var dotenv = require('dotenv').load({silent: true})
var nodemailer = require('nodemailer')
var EmailTemplate = require('email-templates').EmailTemplate
var ejs = require('ejs')

var smtpConfig = {
  host: process.env.NODEMAILER_HOST,
  port: process.env.NODEMAILER_PORT,
  secure: false, // use SSL
  auth: {
      user: process.env.NODEMAILER_USER,
      pass: process.env.NODEMAILER_PASS
  },
  tls: {
      rejectUnauthorized: false
  }
};

// change the smtpconfig here
// use the ng mailgun package auth
// create new domain for development
// mg = require('nodemailer-mailgun-transport');
// var nodemailerMailgun = nodemailer.createTransport(mg(auth));
var transporter = nodemailer.createTransport(smtpConfig);

var mailer = {}
mailer.send = function(mailTemplate, locals, options) {

  var templatesDir = path.join(__dirname, 'templates')
  var template = new EmailTemplate(path.join(templatesDir, mailTemplate));

  template.render(locals, function(err, results) {
    var mailOptions = {
      from: '"myproducer.io" <donotreply@myproducer.io>', // sender address
      to: options.to, // list of receivers
      subject: options.subject, // Subject line
      html: results.html // html body
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, function(error, info){
        if(error){
          console.log(error)
        } else {
          console.log(info)
        }
    });
  })
}

module.exports = mailer
