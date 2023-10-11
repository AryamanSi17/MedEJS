require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'info@globalmedacademy.com',
        pass: process.env.EMAIL_PASS
    }
});

function sendEmail({ to = [], subject = '', text = '' }) {
    const mailOptions = {
        from: 'info@globalmedacademy.com',
        to: to,  // Now it accepts dynamic recipients
        subject: subject,
        text: text
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
