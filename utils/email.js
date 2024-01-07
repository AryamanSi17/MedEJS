require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'info@globalmedacademy.com',
        pass: process.env.EMAIL_PASS
    }
});

function sendEmail({ to = [], subject = '', text = '', html = '' }) { 
    const mailOptions = {
        from: 'noreply@globalmedacademy.com', // Updated sender address
        to: to,  // Accepts dynamic recipients
        subject: subject,
        text: text,
        html: html 
    };

    transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}

module.exports = sendEmail;
