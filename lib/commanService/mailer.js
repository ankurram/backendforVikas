var mongoose = require('mongoose'),
  nodemailer = require('nodemailer'),
  smtpTransport = require('nodemailer-smtp-transport');
  const config = require('../../config/config').get(
  process.env.NODE_ENV || 'local'
)

module.exports = {
  sendMail: sendMail,
  sendResetEmail: sendResetEmail,
  

}

var transporter = nodemailer.createTransport(
  smtpTransport({
    host: 'smtp.gmail.com',
    service: config.smtp.service,
    port: config.email_port,
    secure: true, // use SSL
    auth: {
        user: 'ankurram5@gmail.com',
        pass: 'ank@1655'
    }
  })
)




function sendResetEmail(subject, printContents, callbackMail) {
  let mailOptions = {
    from: config.smtp.mailUsername, //config.smtp.mailUsername, // sender address
    to: printContents.email,
    subject: subject, // Subject line
  }
  let htmlContent = `<html>
    <body>
    <table border="1" cellspacing="0" cellpadding="0" style="
        width:'800px';
    border-collapse: collapse;
    border-spacing: 0;
    margin: 10px;
        ">
    <tr><td colspan="2">Dear  <strong>${printContents.firstName}</strong></td></tr>
    <tr><td colspan="2">&nbsp;</td></tr>
    <tr><td colspan="2">Please click on this link to re-set your password</td></tr>
    <tr><td colspan="2">&nbsp;</td></tr>
    <tr><td>Link:</td><td><a href="${printContents.link}">Click Here</a></td></tr>
    <tr><td>Or copy this link :  </td><td>${printContents.link}</td></tr>
    </table      
    </body>
    </html>`

  mailOptions.html = htmlContent
  // console.log('mailOptions ', mailOptions)
  //return false;
  if (
    config.env == 'local' ||
    config.env == 'staging' ||
    config.env == 'prod'
  ) {
    transporter.sendMail(mailOptions, function (error, info) {
      // send mail with defined transport object
      console.log('error ===', error, info)
      if (error) {
        callbackMail(error, null)
      } else {
        var returnMsg = 'Mail sent successfully'
        callbackMail(null, { message: returnMsg })
      }
    })
  } else {
    const params = {
      Destination: { ToAddresses: [to] },
      Message: {
        Body: {
          Html: {
            Charset: 'UTF-8',
            Data: mailOptions.html,
          },
        },
        Subject: { Charset: 'UTF-8', Data: mailOptions.subject },
      },
      ReturnPath: config.aws_ses.fromName,
      Source: config.aws_ses.fromName,
    }
  }
}

function sendMail(to, keyword, userData, callbackMail) {
  async function sendMail() {
    console.log('\n keyword', keyword)
    var mailOptions = {
      from: config.smtp.mailUsername, //config.smtp.mailUsername, // sender address
      to: to, // list of receivers
      subject: subject, // Subject line
      html: mailContent, // Mail content body
    }
    if (
      config.env == 'local' ||
      config.env == 'staging' ||
      config.env == 'prod'
    ) {
      transporter.sendMail(mailOptions, function (error, info) {
        // send mail with defined transport object
        if (error) {
          callbackMail(error, null)
        } else {
          var returnMsg = 'Mail sent successfully'
          callbackMail(null, { message: returnMsg })
        }
      })
    } else {
      //Live
      const params = {
        Destination: {
          ToAddresses: [to],
        },
        Message: {
          Body: {
            Html: {
              Charset: 'UTF-8',
              Data: mailOptions.html,
            },
          },
          Subject: {
            Charset: 'UTF-8',
            Data: mailOptions.subject,
          },
        },
        ReturnPath: config.aws_ses.fromName,
        Source: config.aws_ses.fromName,
      }
      ses.sendEmail(params, (err, data) => {
        if (err) {
          callbackMail(err, null)
        } else {
          var returnMsg = 'Mail sent successfully'
          callbackMail(null, { message: returnMsg })
        }
      })
    }
  }
  sendMail()
}
