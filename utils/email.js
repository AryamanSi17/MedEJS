require('dotenv').config();
const nodemailer=require('nodemailer');
function sendEmail(){
    const transporter=nodemailer.createTransport({
        service:'gmail',
        auth:{
            user:'info@globalmedacademy.com',
            pass:process.env.EMAIL_PASS
        }
    })
    const mailOptions={
        from:'info@globalmedacademy.com',
        to:['gsun1517@gmail.com'],
        subject:'Hello from globalmed',
        text:'hi email works'
    }
    transporter.sendMail(mailOptions,function(error,info){
        if(error){
            console.log(error);
        }
        else{
            console.log('Email sent:' +info.response);
        }
    });
}
module.exports=sendEmail;