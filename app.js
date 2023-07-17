require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const ejs = require("ejs");
const passportLocalMongoose = require("passport-local-mongoose");
const passport = require("passport");
const session = require("express-session");
const { mongoose, User } = require("./utils/db"); // Import from db.js
const nodemailer = require('nodemailer');
const mongodb = require("mongodb");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate');
const axios = require('axios');
const FormData = require('form-data');
const sendEmail = require('./utils/email');
const setRoutes = require('./utils/routes');
const crypto = require('crypto');
const emailAuth = require('./utils/emailAuth');
const LocalStrategy = require("passport-local").Strategy; // Import LocalStrategy
const { log } = require('console');
let loggedIn = true;
// const enrollUserInCourse = require('./utils/enrollUser.js')
const app = express();

app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/assets', express.static(path.join(__dirname, 'assets')));

app.use(session({
  secret: "global med academy is way to success",
  resave: false,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

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
  User.findById(id)
    .then(user => {
      done(null, user);
    })
    .catch(err => {
      done(err, null);
    });
});
// Configure LocalStrategy
passport.use(
  new LocalStrategy(
    {
      usernameField: "email", // Use "email" as the username field
    },
    User.authenticate()
  )
);
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
  }
);

app.get("/login", function(req, res) {
  res.render("login");
});

app.post("/login", passport.authenticate("local"), function(req, res) {
    res.render("auth_index");
  });

app.listen(3000, function() {
  console.log("Server started on 3000");
});

app.get("/logout", (req,res) => {
  req.logout(function(err){
    if (!err) {
      res.redirect("/");
    }
  });
});

// Store generated OTP
let storedOTP = null;

// Handler for sending OTP
app.post('/sendOtp',async function(req, res) {
  const email = req.body.email;
  req.session.email = email;
  console.log(req.session.email)
  const isRegistered = await isEmailRegistered(email);
  req.session.save(err => {
    if(err) {
      console.log(err);
      res.status(500).send('An error occurred during session saving.');
    } else {
      console.log(req.session.email)
  if (isRegistered==true) {
    // If the email is already registered, send an alert and do not send the OTP
    res.send('<script>alert("Email already in use!"); window.history.back();</script>');
  } 
  else
  {
  // Generate OTP and send email
  const otp = emailAuth.generateOTP();
  emailAuth.sendOTP(email, otp);

  // Store the generated OTP
  storedOTP = otp;

  // Send a response indicating success
  res.send('<script>alert("OTP sent successfully!"); window.history.back();</script>');
  }
}
})
  console.log(isRegistered)
});

// Handler for verifying OTP
app.post('/verifyOtp', function(req, res) {
  const enteredOTP = req.body.otp;
  const email=req.body.email
  req.session.email=email
  console.log(req.session.email)
  // Verify the entered OTP
  if (storedOTP && enteredOTP === storedOTP) {
    // OTP matches, authentication successful
    res.render('login');
  } else {
    // OTP does not match or storedOTP is null, authentication failed
    res.send('Invalid OTP. Please try again!');
  }
});

app.post("/register", async (req, res) => {
  const email = req.session.email;
  req.session.email = email;
  console.log(req.session.email);
  const { fullname, password } = req.body; // Destructure fullname and password

  User.register({ username: email, name: fullname, email: email }, password, function (err, user) {
    console.log(req.body.email);
    if (err) {
      console.log(err);
    } else {
      createUserInMoodle(email, password, fullname, '.', email)
        .then(() => {
          req.session.save();
          passport.authenticate("local")(req, res, function () {
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

async function isEmailRegistered(email) {
  // Use mongoose to query for a user with the provided email
  const user = await User.findOne({ name: email });

  // If a user is found, the email is already registered
  return user != null;
}

// Function to create a user in Moodle
async function createUserInMoodle(username, password, firstname, lastname, email) {
  const formData = new FormData();
  formData.append('moodlewsrestformat', 'json');
  formData.append('wsfunction', 'core_user_create_users');
  formData.append('wstoken', process.env.MOODLE_TOKEN); // Replace with your Moodle token
  formData.append('users[0][username]', username);
  formData.append('users[0][password]', password);
  formData.append('users[0][firstname]', firstname);
  formData.append('users[0][lastname]', lastname);
  formData.append('users[0][email]', email);
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
const getUserIdFromUsername = async () => {
  const formData = new FormData();
  formData.append('moodlewsrestformat', 'json');
  formData.append('wsfunction', 'core_user_get_users_by_field');
  formData.append('wstoken', process.env.MOODLE_TOKEN);
  formData.append('field', 'username');
  formData.append('values[0]', 'bananaicecream');

  try {
    const response = await axios.post('https://moodle.upskill.globalmedacademy.com/webservice/rest/server.php', formData, {
      headers: formData.getHeaders()
    });

    if (response.status === 200 && response.data.length > 0) {
      console.log('User ID:', response.data[0].id);
      return response.data[0].id;  // Returns the user ID
    } else {
      throw new Error('User not found.');
    }
  } catch (error) {
    console.log(error);
    throw new Error('Failed to retrieve user ID.');
  }
};
getUserIdFromUsername();
const enrollUserInCourse = async (userId, courseid) => {
  const formData = new FormData();
  formData.append('moodlewsrestformat', 'json');
  formData.append('wsfunction', 'enrol_manual_enrol_users');
  formData.append('wstoken', process.env.MOODLE_TOKEN);
  formData.append('enrolments[0][roleid]', 5);
  formData.append('enrolments[0][userid]', userId);
  formData.append('enrolments[0][courseid]', courseid); // Fixed variable reference

  try {
    const response = await axios.post('https://moodle.upskill.globalmedacademy.com/webservice/rest/server.php', formData, {
      headers: formData.getHeaders()
    });

    if (response.status === 200) {
      console.log('User enrolled in the course successfully.');
      console.log(response.data);
    } else {
      console.log('Failed to enroll user in the course.');
      console.log(response.data);
    }
  } catch (error) {
    console.log(error);
    throw new Error('Failed to enroll user in the course.');
  }
};

// Usage
const userId = '15'; // Replace with the actual user ID
const courseid = '9'; // Replace with the actual Course ID
// enrollUserInCourse(userId, courseid);
setRoutes(app);

