require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const ejs = require("ejs");
const passportLocalMongoose = require("passport-local-mongoose");
const passport = require("passport");
const session = require("express-session");
const { mongoose, User, Course } = require("./utils/db"); // Import from db.js
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
const ccav = require('./utils/ccavenue');
let loggedIn = true;
// const enrollUserInCourse = require('./utils/enrollUser.js')
const app = express();
app.use(session({
  secret: "global med academy is way to success",
  resave: false,
  saveUninitialized: true
}));
app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/assets', express.static(path.join(__dirname, 'assets')));


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
  console.log("Server started successfully!");
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

app.use(express.json()); // Add this middleware to parse JSON in requests

app.post('/sendOtp', async function(req, res) {
  const email = req.body.email;

  try {
    const isRegistered = await isEmailRegistered(email);

    if (isRegistered) {
      // If the email is already registered, send a JSON response with an error message
      return res.status(400).json({ success: false, message: "Email already in use." });
    }

    // Generate OTP and send email
    const otp = emailAuth.generateOTP();
    emailAuth.sendOTP(email, otp);

    // Store the generated OTP in the session
    req.session.otp = otp;
    req.session.email = email;

    // Send a JSON response indicating success
    return res.json({ success: true });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: "An error occurred while sending OTP." });
  }
});

app.post('/verifyOtp', function(req, res) {
  const enteredOTP = req.body.otp;
  const storedOTP = req.session.otp;

  if (!storedOTP || enteredOTP !== storedOTP) {
    // Invalid OTP or no OTP found in the session
    return res.json({ success: false });
  }

  // OTP matches, authentication successful
  // You can redirect the user to the registration page or any other appropriate page
  return res.json({ success: true });
});

app.post("/register", async (req, res) => {
  const email = req.session.email;
  req.session.email = email;
  console.log(req.session.email);
  const { fullname, password } = req.body; // Destructure fullname and password

  User.register({ username: email, name: fullname}, password, function (err, user) {
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
// Function to generate a random string
function generateRandomString(length) {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

// Function to generate a unique order ID
function generateOrderID() {
  const timestamp = new Date().getTime().toString();
  const randomSuffix = generateRandomString(4); // Adjust the length of the random suffix as per your requirements
  return timestamp + randomSuffix;
}

app.get('/payment', (req, res) => {
  const orderId = generateOrderID();
  const amount = 'PAYMENT_AMOUNT';

  // Generate the payment form
  const paymentForm = ccav.getPaymentForm({
    order_id: orderId,
    amount: amount,
    currency: 'INR',
    redirect_url: ccav.config.redirect_url,
    cancel_url: ccav.config.cancel_url,
    billing_name: 'CUSTOMER_NAME',
    billing_address: 'CUSTOMER_ADDRESS',
  });

  // Render the payment form to the user
  res.send(paymentForm);
});

app.post('/redirect-url', (req, res) => {
  // Process the response received from CC Avenue after successful payment
  const responseData = ccav.getResponseData(req.body);

  // Verify the response using the working key
  if (ccav.verifyChecksum(responseData)) {
    // Payment successful, handle the response data accordingly
    // You may update your database, send notifications, etc.
    res.send('Payment Successful');
  } else {
    // Invalid response, handle the error condition
    res.send('Payment Failed');
  }
});

app.post('/cancel-url', (req, res) => {
  // Payment canceled or failed, handle the cancellation condition
  res.send('Payment Canceled');
});
// CC Avenue Credentials
const accessCode = 'YOUR_ACCESS_CODE';
const workingKey = 'YOUR_WORKING_KEY';
const merchantId = 'YOUR_MERCHANT_ID';
const redirectUrl = 'YOUR_REDIRECT_URL'; // URL where CC Avenue will redirect after payment

// Payment initiation route
app.get('/payment', (req, res) => {
  // Gather payment details from the form or your application
  const orderAmount = 1000; // Amount in paise (e.g., Rs. 10)

  // Prepare the request parameters for CC Avenue API
  const data = {
    merchant_id: merchantId,
    order_id: 'UNIQUE_ORDER_ID', // You should generate a unique order ID for each transaction
    currency: 'INR',
    amount: orderAmount,
    redirect_url: redirectUrl,
    cancel_url: redirectUrl,
    language: 'EN',
    billing_name: 'Customer Name',
    billing_address: 'Customer Address',
    billing_city: 'Customer City',
    billing_state: 'Customer State',
    billing_zip: 'Customer ZIP',
    billing_country: 'India',
    billing_tel: 'Customer Phone',
    billing_email: 'customer@example.com',
    delivery_name: 'Delivery Name',
    delivery_address: 'Delivery Address',
    delivery_city: 'Delivery City',
    delivery_state: 'Delivery State',
    delivery_zip: 'Delivery ZIP',
    delivery_country: 'India',
    delivery_tel: 'Delivery Phone',
  };

  // Generate secure hash for data integrity (if required by CC Avenue)
  // You should refer to CC Avenue's documentation for generating the secure hash.

  // Make a POST request to CC Avenue API
  request.post(
    'https://test.ccavenue.com/transaction/transaction.do?command=initiateTransaction',
    { form: data },
    (error, response, body) => {
      if (error) {
        // Handle error
        console.error(error);
        res.send('Payment initiation failed.');
      } else {
        // Redirect the user to the CC Avenue payment page
        res.send(body); // In a real application, you should use res.redirect()
      }
    }
  );
});

// Payment response route
app.post('/payment/response', (req, res) => {
  // Handle the payment response from CC Avenue
  // Extract transaction details from req.body and process accordingly

  // For example, you might check if the payment was successful, update your database, etc.

  res.send('Payment response received.');
});

// Usage
const userId = '15'; // Replace with the actual user ID
const courseid = '9'; // Replace with the actual Course ID
// enrollUserInCourse(userId, courseid);
setRoutes(app);

