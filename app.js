require('dotenv').config();
const express=require("express");
const bodyParser=require("body-parser");
const path=require("path");

const ejs = require("ejs");
const passportlocalmongoose = require("passport-local-mongoose");
const passport = require("passport");
const session = require("express-session");
const mongoose = require("mongoose");
// var nodemailer = require('nodemailer');
const mongodb = require("mongodb");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate');


const app=express();

app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended:true}));
app.use('/assets', express.static(path.join(__dirname, 'assets')));

mongoose.connect("mongodb://localhost:27017/globalmedDB");


app.use(session({
  secret: "global med academy is way to success",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

// google stratrgy starts

passport.use(new GoogleStrategy({
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  callbackURL: "http://localhost:3000/auth/google/data",
  userProfileURL: "https://www.googleapis.com/oauth2/v2/userinfo"
},
function(accessToken, refreshToken, profile, cb) {
  User.findOrCreate({ googleId: profile.id }, function (err, user) {
    return cb(err, user);
  });
}
));

//  (rrp)


const UserSchema = new mongoose.Schema ({
  username: String,
  passwword: String
});

UserSchema.plugin(passportlocalmongoose);

const User = mongoose.model("User" , UserSchema);


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
  res.render("index");
});

app.get("/data", (req,res) => {
  res.render("data");
})

app.get("/auth/google",
  passport.authenticate('google', {
    scope: ['profile', 'email']
  })
);

app.get("/auth/google/data",
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/data');
  });


app.get("/login",function(req,res){
    res.render("login");
});



app.post("/register",(req,res) => {

    User.register({username:req.body.username},req.body.password,function(err,user){
      if(err)
      {
        console.log(err);
      } else
      {
        passport.authenticate("local")(req,res,function(){
          res.redirect("/data");
        })
      }
    })
  
  });

app.listen(3000,function(){
    console.log("Server started on 3000");
});
app.get("/course-masonry",function(req,res){
  res.render("course-masonry");
});
app.get("/course-details",function(req,res){
  res.render("course-details")
});
app.get("/auth_index",function(req,res){
  res.render("auth_index");
})