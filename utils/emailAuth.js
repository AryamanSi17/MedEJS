const nodemailer = require('nodemailer');
const randomstring = require('randomstring');

// Generate a random OTP code
function generateOTP() {
  return randomstring.generate({
    length: 6,
    charset: 'numeric'
  });
}

// Send the OTP to the user's email address
function sendOTP(email, otp) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'info@globalmedacademy.com',
      pass: process.env.EMAIL_PASS
    }
  });

  const mailOptions = {
    from: 'info@globalmedacademy.com',
    to: email,
    subject: 'Email Verification - OTP',
    text: `Your OTP for email verification is: ${otp}`
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
}

module.exports = {
  generateOTP,
  sendOTP
};
