require('dotenv').config();
const express=require("express");
const bodyParser=require("body-parser");
const path=require("path");

const ejs = require("ejs");
const passportlocalmongoose = require("passport-local-mongoose");
const passport = require("passport");
const session = require("express-session");
const mongoose = require("mongoose");
const nodemailer = require('nodemailer');
const mongodb = require("mongodb");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate');
const axios = require('axios');
const FormData = require('form-data');
let loggedIn=true;

const app=express();

app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended:true}));
app.use('/assets', express.static(path.join(__dirname, 'assets')));


const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'priyanshurajroy02659@gmail.com',
    pass: 'zsyvunucwzqombnt'
  }
});


app.use(session({
  secret: "global med academy is way to success",
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
mongoose.connect(`${process.env.DB_URL}`);

//  mail stratrgy starts

const mailOptions = {
  from: 'priyanshurajroy02659@gmail.com',
  to:  ['priyanshur.ip.21@nitj.ac.in' , 'priyanshufind4u@gmail.com'],
  subject: 'Hello from globalmed',
  text: 'This is the lody.'
};

transporter.sendMail(mailOptions, function(error, info) {
  if (error) {
    console.log(error);
  } else {
    console.log('Email sent: ' + info.response);
  }
});
//  (rrp)
const UserSchema = new mongoose.Schema ({
  name: String,
  username: String,
  passwword: String,
  googleId: String
});

UserSchema.plugin(passportlocalmongoose);
UserSchema.plugin(findOrCreate);
const User = mongoose.model("User" , UserSchema);

passport.use(new GoogleStrategy({
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,

 
  callbackURL: "https://globalmedacademy.com/auth/google/test",

  userProfileURL: "https://www.googleapis.com/oauth2/v2/userinfo"
},
function(accessToken, refreshToken, profile, cb) {
  User.findOrCreate({ googleId: profile.id }, function (err, user) {
    return cb(err, user);
  });
}
));

passport.use(User.createStrategy());


passport.serializeUser(function(user, done) {
    done(null, user.id);

});


passport.deserializeUser(function(id, done) {
    // User.findById(id, function(err, user) {
    //     done(err, user);
    // });

    User.findById(id)
     .then( user => {
      done(null ,user);
     })

     .catch(err => {
      done(err , null);
     })
});

app.get("/",function(req,res){
  if(req.isAuthenticated()){
    res.render("auth_index");
  } else {
  res.render("index");
  }
});
app.get("/data", (req,res) => {
  res.render("data");
})

app.get("/auth/google",
  passport.authenticate('google', {
    scope: ['profile', 'email']
  })
);

app.get("/auth/google/test",
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.render('auth_index');
  });

app.get("/login",function(req,res){
  res.render("login");
});

app.post("/register", async (req, res) => {
  const username = req.body.username;
  if (username.toUpperCase() === username) {
    // Username is in uppercase
    res.status(400).send("Please enter the username in lowercase only.");
    return;
  }
  User.register({ username: req.body.username, name: req.body.name }, req.body.password, function(err, user) {
    if (err) {
      console.log(err);
    } else {
      createUserInMoodle(req.body.username, req.body.password, req.body.firstname, req.body.lastname, req.body.name)
        .then(() => {
          passport.authenticate("local")(req, res, function() {
          res.render("auth_index");
          });
        
        })
        .catch((error) => {
          console.error(error);
          // Handle the error if necessary
          res.status(500).send("An error occurred during user registration.");
        });
    }
  });
});

// Function to create a user in Moodle
async function createUserInMoodle(username,password, firstname, lastname, name) {
  const formData = new FormData();
  formData.append('moodlewsrestformat', 'json');
  formData.append('wsfunction', 'core_user_create_users');
  formData.append('wstoken',process.env.MOODLE_TOKEN  ); // Replace with your Moodle token
  formData.append('users[0][username]', username);
  formData.append('users[0][password]', password);
  formData.append('users[0][firstname]', firstname);
  formData.append('users[0][lastname]', lastname);
  formData.append('users[0][email]', name);
  formData.append('users[0][lang]', 'en');
  formData.append('users[0][description]', 'If you die you die');

  try {
    const response = await axios.post('https://moodle.upskill.globalmedacademy.com/webservice/rest/server.php', formData, {
      headers: formData.getHeaders()
    });
    console.log(response.data);
    // Perform any necessary actions based on the response
  } catch (error) {
    console.error(error);
    throw new Error('Failed to create user in Moodle.');
  }
} 

  app.post("/login",function(req,res){


    const user = new User ({
      username:req.body.username,
      password:req.body.password,
      name : req.body.name
    })
  
      req.login(user,function(err){
        if (err) {
          console.log(err);
        } else {
          passport.authenticate("local")(req,res,function(){
             res.render("auth_index");
          });
        }
      });
  
       
  });

app.listen(3000,function(){
    console.log("Server started on 3000");
});
app.get("/course-masonry",function(req,res){
  if (req.user) {
    loggedIn=true;
    res.render('course-masonry', { loggedIn });
}
else{
  loggedIn=false;
  res.render('course-masonry',{ loggedIn })
}
});
app.get("/course-details",function(req,res){
  if (req.user) {
    loggedIn=true;
    res.render('course-details', { loggedIn:loggedIn });
} else {
  loggedIn=false;
  res.render('course-details',{ loggedIn })
}
});
app.get("/auth_index",function(req,res){
  res.render("auth_index");N
});
app.get("/becometeacher",function(req,res){
  res.render("becometeacher");
});
app.get("/privacy-policy",function(req,res){
  res.render("privacy-policy");
});
app.get("/admission-guide",function(req,res){
  res.render("admission-guide");
});
app.get("/course-details-fellowshipininternalmedicine",(req,res)=>{
  res.render("course-details-fellowshipininternalmedicine");
})
app.get("/course-details-fellowshipincriticalcare",(req,res)=>{
  res.render("course-details-fellowshipincriticalcare");
});
app.get("/course-details-obsgynae",(req,res)=>{
  res.render("course-details-obsgynae");
});