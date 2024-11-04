require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const ejs = require("ejs");
const passportLocalMongoose = require("passport-local-mongoose");
const passport = require("passport");
const cookieSession = require('cookie-session')
const { mongoose, User, Course, Request, Session, UserSession, InstructorApplication, Transaction, NonMoodleUser, UserInterest ,GuestCheckout} = require("./utils/db"); // Import from db.js
const db = require('./utils/db');
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
const { log, error } = require('console');
const jwt = require('jsonwebtoken');
// const isAuthenticated = require('./utils/authMiddleware');
const bcrypt = require('bcrypt');
const JWT_SECRET = "med ejs is way to success";
const saltRounds = 10;
const multer = require('multer');
const checkUserLoggedIn = require('./utils/authMiddleware');
const cookieParser = require('cookie-parser');
// const GridFsStorage = require('gridfs-stream');
const { GridFsStorage } = require('multer-gridfs-storage');
const courses = require('./utils/courses');
const { Types, connection } = require('mongoose');
const querystring = require('querystring');
const { saveEnquiry } = require('./utils/kit19Integration');
const { createCheckoutSession } = require('./utils/stripepay');
const isAuthenticated = require('./utils/isAuthenticatedMiddleware');
const getUniqueEnrollmentNumber = require('./utils/enrollmentNumber');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const rawBodyParser = bodyParser.raw({ type: '*/*' });
const AWS = require('aws-sdk');
const upload = multer({ storage: multer.memoryStorage() });
const qs = require('querystring');
const searchCourses = require('./utils/searchCourses');

// Configure the AWS SDK to use DigitalOcean Spaces
const spacesEndpoint = new AWS.Endpoint('blr1.digitaloceanspaces.com');
const s3 = new AWS.S3({
  endpoint: spacesEndpoint,
  accessKeyId: 'DO00BCVVAXV92K3TNA36',
  secretAccessKey: 'rMxLZWJR8cvKLitDS9dFYcjVHzIKcaFsLG0Jy31mGwE'
});
const ccavRequestHandler = require('./utils/ccavRequestHandler.js');
const ccavResponseHandler = require('./utils/ccavResponseHandler.js');

const flash = require('connect-flash');
let loggedIn = true;
const { enrollUserInCourse,searchAndLogCourseDetails,getOrCreateCourseIdByName } = require('./utils/enrollUser.js')
const app = express();
app.use(cookieSession({
  name: 'session',
  keys: ['medEjs is way to success'], // Replace with your secret key
  // secure: process.env.NODE_ENV === 'production',
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
  // httpOnly:true
}));
// forestAdmin.mountOnExpress(app).start();
// Use the middleware globally for all routes
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');
app.use('/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use(passport.initialize());
app.use(passport.session());
app.use(cookieParser());
app.use(flash());
app.use(checkUserLoggedIn);
app.set('trust proxy', true);
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});
passport.use(new GoogleStrategy({
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  callbackURL: "https://globalmedacademy.com/auth/google/callback"
},
async (accessToken, refreshToken, profile, done) => {
  const email = profile.emails[0].value; // Assuming the email is always present
  const fullname = profile.displayName; // Fetching the full name from Google profile

  try {
    let user = await User.findOne({ email: email });

    if (user) {
      // Update googleId if not present
      if (!user.googleId) {
        user.googleId = profile.id;
        await user.save();
      }
    } else {
      // No user found with this email, create a new account
      // Generate a password for the new user
      const password = generatePassword(); 

      user = await new User({
        googleId: profile.id,
        email: email,
        fullname: fullname, // Store the full name
        username: email, // Username as email
        password: password, // Store the generated password
        signupMethod: 'google'
      });
      await user.save();
    }
    // User found or created successfully
    return done(null, user);
  } catch (error) {
    return done(error);
  }
}
));


passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});
async function findOrCreateUser(profile) {
  const existingUser = await User.findOne({ googleId: profile.id });

  if (existingUser) {
    return existingUser;
  } else {
    const newUser = new User({
      googleId: profile.id,
      displayName: profile.displayName,
      // Set other fields as needed
    });
    // Set the signup method to 'google' for Google signups
    newUser.signupMethod = 'google';

    return newUser.save();
  }
};

app.get("/auth/google",
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback', (req, res, next) => {
  passport.authenticate('google', async (err, user, info) => {
    if (err) { return next(err); }
    if (!user) { return res.redirect('/login'); }

    try {
      const token = jwt.sign({ userId: user._id }, JWT_SECRET);
      res.cookie('authToken', token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });

      if (user.isNewUser) {
        const username = user.email;
        const password = generatePassword(); // Ensure this method exists
        const fullname = user.displayName;

        await createUserInMoodle(username, password, fullname, '.', username);
        // Additional logic for new users
      }

      // Redirect to the "/" route
      res.redirect('/');
    } catch (error) {
      console.error("Error after Google authentication:", error);
      res.status(500).send("An error occurred after Google authentication.");
    }
  })(req, res, next);
});
const generatePassword = (length = 10) => {
  if (length < 8) length = 8; // Ensure minimum length of 8

  const numbers = "0123456789";
  const lowerCaseLetters = "abcdefghijklmnopqrstuvwxyz";
  const upperCaseLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const symbols = "!@#$%^&*()_+~`|}{[]:;?><,./-=";
  const allChars = numbers + lowerCaseLetters + upperCaseLetters + symbols;

  let password = "";
  password += numbers.charAt(Math.floor(Math.random() * numbers.length));
  password += lowerCaseLetters.charAt(Math.floor(Math.random() * lowerCaseLetters.length));
  password += upperCaseLetters.charAt(Math.floor(Math.random() * upperCaseLetters.length));
  password += symbols.charAt(Math.floor(Math.random() * symbols.length));

  for (let i = password.length; i < length; ++i) {
    password += allChars.charAt(Math.floor(Math.random() * allChars.length));
  }

  // Shuffle the password to mix up the order of characters
  password = password.split('').sort(() => 0.5 - Math.random()).join('');

  return password;
};

app.get('/logout', async (req, res) => {
  try {
    // Clear the authToken cookie
    res.clearCookie('authToken');

    // Extract the JWT token from the cookie
    const token = req.cookies.authToken;
    if (token) {
      await UserSession.findOneAndDelete({ token });
    }

    // Clear the session
    req.session = null;

    // Redirect to homepage or login page
    res.redirect('/');
  } catch (error) {
    console.error("Error during logout:", error);
    res.status(500).send("Error logging out");
  }
});




// Store generated OTP
let storedOTP = null;

// Add this middleware to parse JSON in requests
app.post("/register", async (req, res) => {
  const pageTitle = 'Fellowship Course, Online Medical Certificate Courses - GlobalMedAcademy';
  const metaRobots = 'follow, index, max-snippet:-1, max-video-preview:-1, max-image-preview:large';
  const metaKeywords = 'certificate courses online, fellowship course, fellowship course details, fellowship in diabetology, critical care medicine, internal medicine ';
  const ogDescription = 'GlobalMedAcademy is a healthcare EdTech company. We provide various blended learning medical fellowship, certificate courses, and diplomas for medical professionals';
  const canonicalLink = 'https://globalmedacademy.com/';
  try {
    const { username, fullname, password } = req.body;
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    // const enrollmentNumber = await getUniqueEnrollmentNumber(); // Get unique enrollment number

    const newUser = new User({
      username,
      fullname,
      password: hashedPassword,

    });

    await newUser.save();

    // Generate and set the JWT token
    const token = jwt.sign({ userId: newUser._id }, JWT_SECRET);
    res.cookie('authToken', token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 }); // Cookie will expire after 24 hours

    createUserInMoodle(username, password, fullname, '.', username)
      .then(() => {
        passport.authenticate("local")(req, res, function () {
          res.redirect('/user');
          getUserIdFromUsername(username);
        });
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send("An error occurred during user registration.");
      });

  } catch (error) {
    console.error("Error while registering:", error);
    res.status(500).json({ error: "Error while registering" });
  }
});

app.post("/login", async (req, res) => {
  const pageTitle = 'Fellowship Course, Online Medical Certificate Courses - GlobalMedAcademy';
  const metaRobots = 'follow, index, max-snippet:-1, max-video-preview:-1, max-image-preview:large';
  const metaKeywords = 'certificate courses online, fellowship course, fellowship course details, fellowship in diabetology, critical care medicine, internal medicine ';
  const ogDescription = 'GlobalMedAcademy is a healthcare EdTech company. We provide various blended learning medical fellowship, certificate courses, and diplomas for medical professionals';
  const canonicalLink = 'https://globalmedacademy.com/';
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user || !await bcrypt.compare(password, user.password)) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    // Get the IP address of the user
    const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    // Get the User-Agent string of the user
    const userAgent = req.headers['user-agent'];

    // Check if there is already an active session for this user with the same IP address and User-Agent string
    const existingSession = await UserSession.findOne({ userId: user._id, ipAddress, userAgent });
    if (existingSession) {
      return res.status(403).json({ success: false, message: "User already logged in from a different browser or location. Please logout to continue." });
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET);
    res.cookie('authToken', token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });

    // Create a new session with ipAddress and userAgent included
    const newUserSession = new UserSession({ userId: user._id, token, ipAddress, userAgent });
    await newUserSession.save();

    req.session.username = username;

    // Render the page and end the response
    return res.json({ success: true, redirectUrl: '/' });
  } catch (error) {
    console.error("Error while logging in:", error);
    return res.status(500).json({ success: false, message: "Error while logging in" });
  }
});



const tokens = jwt.sign({ userId: User._id }, JWT_SECRET);
app.get("/becometeacher", verifyToken, (req, res) => {
  // res.json({ message: "You have access to this protected route!" });
  res.render("becometeacher");
});
// Middleware to verify JWT token from the request header
function verifyToken(req, res, next) {

  // const token = req.header("Authorization");
  const token = tokens;
  // const headers = {
  //   Authorization: `Bearer ${token}`,
  // };

  if (!token) {
    return res.status(401).json({ error: "Unauthorized - Token missing" });
  }

  jwt.verify(token, JWT_SECRET, (err, decodedToken) => {
    if (err) {
      return res.status(401).json({ error: "Unauthorized - Invalid token" });
    }
    req.userId = decodedToken.userId;
    next();
  });
}
async function isEmailRegistered(username) {
  // Use mongoose to query for a user with the provided email
  const user = await User.findOne({ username: username });

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
// Function to enroll a user in Moodle
async function enrollUserInMoodle(userId, courseId, roleId) {
  const formData = new FormData();
  formData.append('moodlewsrestformat', 'json');
  formData.append('wsfunction', 'enrol_manual_enrol_users');
  formData.append('wstoken', process.env.MOODLE_TOKEN);
  formData.append('enrolments[0][roleid]', roleId);
  formData.append('enrolments[0][userid]', userId);
  formData.append('enrolments[0][courseid]', courseId);

  try {
    const response = await axios.post('https://moodle.upskill.globalmedacademy.com/webservice/rest/server.php', formData, {
      headers: formData.getHeaders()
    });
    return response.data; // Moodle enrollment response
  } catch (error) {
    console.error(error);
    throw new Error('Failed to enroll user in Moodle course.');
  }
}
const getUserIdFromUsername = async (email) => {
  const formData = new FormData();
  formData.append('moodlewsrestformat', 'json');
  formData.append('wsfunction', 'core_user_get_users_by_field');
  formData.append('wstoken', process.env.MOODLE_TOKEN);
  formData.append('field', 'username');
  formData.append('values[0]', email);

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
const otps = {};

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'info@globalmedacademy.com',
    pass: process.env.EMAIL_PASS
  }
});

app.post('/send-otp', async (req, res) => {
  const email = req.body.email;

  try {
    // Check if email is already registered
    const user = await User.findOne({ username: email }); // Changed from email to username

    if (user) {
      // Email is already registered
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Email is not registered, proceed with sending OTP
    const otp = Math.floor(100000 + Math.random() * 900000);
    otps[email] = otp;

    const mailOptions = {
      from: 'info@globalmedacademy.com',
      to: email,
      subject: 'Your Verification Code',
      text: `Your verification code is ${otp}`
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ' + info.response);
    res.status(200).json({ message: 'OTP sent successfully' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error processing request' });
  }
});



app.post('/verify-otp', (req, res) => {
  const email = req.body.email;
  const userOtp = req.body.otp;

  if (otps[email] === parseInt(userOtp, 10)) {
    delete otps[email];

    // Set the session variable to indicate that the email has been verified
    req.session.emailVerified = true;

    res.status(200).json({ message: 'OTP verified successfully' });
  } else {
    res.status(400).json({ message: 'Invalid OTP. Please try again!' });
  }
});
app.post('/apply-as-instructor', async (req, res) => {
  // Extract form data from req.body
  const {
    firstName,
    lastName,
    city,
    country,
    graduationDegree,
    specialization,
    lastDegree,
    medicalCollege,
    interestIn,
    email,
    mobile,
  } = req.body;

  // Create a new instructor application
  const newApplication = new InstructorApplication({
    firstName,
    lastName,
    city,
    country,
    graduationDegree,
    specialization,
    lastDegree,
    medicalCollege,
    interestIn,
    email,
    mobile,
  });

  try {
    await newApplication.save();
    res.status(200).json({ message: 'Application submitted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error saving application' });
  }
});
// app.js

// ... other code ...

app.post("/refer-and-earn", async (req, res) => {
  try {
    const { friendMobile, friendName, recommendedCourse, enrollmentNumber } = req.body;

    // Validate data as needed

    // Find the logged-in user using the provided enrollmentNumber
    const user = await User.findOne({ enrollmentNumber });

    if (!user) {
      // Handle case where user is not found
      return res.status(400).send("User not found");
    }

    // Example: Add friend's details to a 'referrals' array in user document
    user.referrals = user.referrals || [];
    user.referrals.push({ friendMobile, friendName, recommendedCourse });

    await user.save();

    // Redirect or render a page as needed
    res.json({ success: true });
  } catch (error) {
    console.error("Error while submitting referral:", error);
    // Send an error response
    res.status(500).json({ success: false, error: "Error while submitting referral" });
  }
});

// ... other code ...


// const enrollUserInCourse = async (userId, courseid) => {
//   const formData = new FormData();
//   formData.append('moodlewsrestformat', 'json');
//   formData.append('wsfunction', 'enrol_manual_enrol_users');
//   formData.append('wstoken', "3fecec7d7227a4369b758e917800db5d");
//   formData.append('enrolments[0][roleid]', 5);
//   formData.append('enrolments[0][userid]', userId);
//   formData.append('enrolments[0][courseid]', courseid); // Fixed variable reference

//   try {
//     const response = await axios.post('https://moodle.upskill.globalmedacademy.com/webservice/rest/server.php', formData, {
//       headers: formData.getHeaders()
//     });

//     if (response.status === 200) {
//       console.log('User enrolled in the course successfully.');
//       console.log(response.data);
//     } else {
//       console.log('Failed to enroll user in the course.');
//       console.log(response.data);
//     }
//   } catch (error) {
//     console.log(error);
//     throw new Error('Failed to enroll user in the course.');
//   }
// };

app.get('/user', isAuthenticated, async function (req, res) {
  const pageTitle = 'User Profile';
  const metaRobots = '';
  const metaKeywords = '';
  const ogDescription = '';
  const canonicalLink = 'https://globalmedacademy.com/user';

  // Extract the JWT token from the cookie
  const token = req.cookies.authToken;
  if (!token) {
    return res.status(401).send('Unauthorized: No token provided');
  }

  let userId;
  try {
    // Verify and decode the token to get the user's ID
    const decoded = jwt.verify(token, JWT_SECRET);
    userId = decoded.userId;
  } catch (error) {
    return res.status(401).send('Unauthorized: Invalid token');
  }

  try {
    // Fetch the user's details from the database using the userId
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send('User not found');
    }
    const coursesPurchased = user.coursesPurchased || [];

    // Check if the user has purchased any courses
    const hasPurchasedCourses = coursesPurchased.length > 0;

    // Check if the user has uploaded the required documents
    const documentsUploaded = user.uploadedFiles && user.uploadedFiles.length > 0;
    // Split the full name and take the first part (first name)
    const firstName = user.fullname.split(' ')[0];

    // Render the user page with the course names and other details
    res.render('user_Profile', {
      pageTitle,
      metaRobots,
      metaKeywords,
      ogDescription,
      canonicalLink,
      firstname: firstName,
      isUserLoggedIn: req.isUserLoggedIn,
      username: user.username,
      fullname: user.fullname,
      enrollmentNumber: user.enrollmentNumber,
      coursesPurchased,
      documentsUploaded,
      hasPurchasedCourses,
      isBlogPage: false // Pass the documentsUploaded to the EJS template
    });
  } catch (error) {
    console.error("Error fetching user's courses:", error);
    res.status(500).send('Server Error');
  }
});


// Usage
const userId = '15'; // Replace with the actual user ID
const courseid = '9'; // Replace with the actual Course ID


//  multer config ends here 

//Kit19Integration
app.post('/submitRequestForMore', async (req, res) => {
  try {
    const marketingInfo = {
      SourceName: "website",
      MediumName: "Inquiryform",
      CampaignName: "organic",
    };
    const response = await saveEnquiry(req.body, marketingInfo);

    console.log("Kit19 Response:", response);  // Log the entire response

    if (response.data.Status === 1) {
      res.send('Form data submitted successfully. Redirecting to the homepage...<meta http-equiv="refresh" content="2;url=/">');
    } else {
      res.status(400).send('Failed to save enquiry.');
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal server error.');
  }
});

app.post('/user-interest-form', async (req, res) => {
  console.log(req.body); // Ensure req.body is correctly logged and structured as expected

  try {
    // Extract data directly from req.body here
    const { name, phone, email, city, education, course, country } = req.body;


    // Assuming you're directly constructing your Kit19 payload here
    const enquiryData = {
      Username: process.env.KIT19_USERNAME,
      Password: "Medical@123#",
      PersonName: name, // Directly use the destructured variables
      MobileNo: phone,
      CountryCode: "+91",
      EmailID: email,
      City: city,
      CourseInterested: course,
      SourceName: 'GoogleAd', // Static value for this route
      MediumName: 'LandingPage',
      CampaignName: 'Google'
    };

    // Example Kit19 API call with axios or similar library
    const kit19Response = await axios.post(`http://sipapi.kit19.com/Enquiry/${process.env.TOKEN_GUID}/AddEnquiryAPI`, enquiryData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log("Kit19 Response:", kit19Response.data);

    if (kit19Response.data.Status === 1) {
      res.send('<script>alert("Form data submitted successfully."); window.location.href = "/";</script>');
    } else {
      res.send('<script>alert("Failed to save enquiry to Kit19."); window.location.href = "/";</script>');
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal server error.');
  }
});


app.get('/buy-now/:courseID', async (req, res) => {
  try {
    const course = await Course.findOne({ courseID: req.params.courseID });
    if (!course) {
      return res.status(404).send("Course Not found");
    }
    // Accessing the course name
    const courseName = course.name;
    console.log(courseName);
    // Assume user identification logic is here, e.g., from a JWT token
    const token = req.cookies.authToken;
    if (!token) {
      // Instead of returning an error, redirect to a guest checkout form
      return res.redirect(`/guest-checkout-form/${req.params.courseID}`);
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) {
      logger.warn(`User not found with ID: ${decoded.userId}`);
      return res.status(404).send('User not found');
    }

    const transactionId = new Date().getTime().toString();
    console.log(`Creating transaction for user ${user._id} and course ${course.name}`);

    const newTransaction = await Transaction.create({
      transactionId,
      userId: user._id,
      courseName: course.name,
      amount: course.currentPrice,
      currency: 'INR',
      status: 'pending',
    });

    console.log(`Transaction created with ID: ${transactionId} for user: ${user._id}`);


    // Proceed with your payment preparation logic
    // Render payment form or redirect to payment gateway as before
    res.render('dataFrom', {
      course: {
        name: course.name,
        price: course.currentPrice,
      },
      merchantId: "2619634",
      redirectUrl: `https://globalmedacademy.com/success?courseID=${req.params.courseID}`,
      cancelUrl: "https://globalmedacademy.com/ccavResponseHandler",
      pageTitle: 'Fellowship Course, Online Medical Certificate Courses - GlobalMedAcademy',
      metaRobots: 'follow, index, max-snippet:-1, max-video-preview:-1, max-image-preview:large',
      metaKeywords: 'certificate courses online, fellowship course, fellowship course details, fellowship in diabetology, critical care medicine, internal medicine ',
      ogDescription: 'GlobalMedAcademy is a healthcare EdTech company. We provide various blended learning medical fellowship, certificate courses, and diplomas for medical professionals',
      canonicalLink: 'https://www.globalmedacademy.com/',
      isBlogPage: false,
    });
  } catch (error) {
    console.error('Error fetching course data ', error);
    res.status(500).send('Server error');
  }
});
app.post('/guest-checkout/:courseID', async (req, res) => {
  try {
    const course = await Course.findOne({ courseID: req.params.courseID });
    if (!course) {
      return res.status(404).send("Course Not found");
    }

    const { name: userName, email: userEmail, phone } = req.body;
 // Assuming these details are collected from the form

    if (!userEmail) {
      // You may want to validate the email or other inputs as necessary
      return res.status(400).send('Invalid details');
    }

    console.log(`Creating transaction for guest user ${userName} (${userEmail}) and course ${course.name}`);

    const transactionId = new Date().getTime().toString();

    // Save guest user details in the database using the GuestCheckout model
    const guestCheckoutEntry = await GuestCheckout.create({
      name: userName,
      email: userEmail,
      phoneNumber: phone,
      coursePurchased: [{
        courseID: req.params.courseID,
        courseName: course.name,
        transactionId: transactionId,
        amount: course.currentPrice,
        currency: 'INR',
        purchaseDate: new Date(),
        status: 'pending',
      }]
    });


   
    
    console.log(`Guest checkout saved for ${userName} (${userEmail})`);
    console.log(`Transaction created with ID: ${transactionId} for guest user: ${userName} (${userEmail})`);

    // Proceed with the payment preparation logic, similar to the buy-now route
    res.render('dataFrom', { // Ensure this is the correct render view name
      course: {
        name: course.name,
        price: course.currentPrice,
      },
      merchantId: "2619634",
      redirectUrl: `https://globalmedacademy.com/guest-checkout-success`, // You might need to handle guest success differently
      cancelUrl: "https://globalmedacademy.com/ccavResponseHandler",
      pageTitle: 'Fellowship Course, Online Medical Certificate Courses - GlobalMedAcademy',
      metaRobots: 'follow, index, max-snippet:-1, max-video-preview:-1, max-image-preview:large',
      metaKeywords: 'certificate courses online, fellowship course, fellowship course details, fellowship in diabetology, critical care medicine, internal medicine ',
      ogDescription: 'GlobalMedAcademy is a healthcare EdTech company. We provide various blended learning medical fellowship, certificate courses, and diplomas for medical professionals',
      canonicalLink: 'https://www.globalmedacademy.com/',
      isBlogPage: false,
      // Add any guest-specific data here
    });
  } catch (error) {
    console.error('Error processing guest checkout ', error);
    res.status(500).send('Server error');
  }
});
// ccavRequestHandler.js integration
app.post('/ccavRequestHandler', function (request, response) {
  var workingKey = "41F0052B4F5A9278198DEED49BED2A4D"; // Test working key
  var accessCode = "AVCQ66LB93CI44QCIC"; // Test access code
  var encRequest = '';

  // Convert the request body to a query string format
  var orderId = new Date().getTime(); // Simple example for generating an order ID
  var courseName = request.body.courseName;
  // Add the order_id to the request body
  var formattedBody = qs.stringify({
    ...request.body,
    order_id: orderId.toString(),
    courseName: courseName, // Ensure it's a string if required by your payment gateway
    // Add or adjust other fields as required by CCAvenue
  });

  // Encrypt the formatted body
  encRequest = encrypt(formattedBody, workingKey);

  // Create the form body
  var formbody = '<form id="nonseamless" method="post" name="redirect" action="https://secure.ccavenue.com/transaction/transaction.do?command=initiateTransaction"> <input type="hidden" id="encRequest" name="encRequest" value="' + encRequest + '"><input type="hidden" name="access_code" id="access_code" value="' + accessCode + '"><script language="javascript">document.redirect.submit();</script></form>';

  // Send the response
  response.writeHead(200, { "Content-Type": "text/html" });
  response.write(formbody);
  response.end();
});

function encrypt(plainText, workingKey) {
  var m = crypto.createHash('md5');
  m.update(workingKey);
  var key = m.digest();
  var iv = '\x00\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0a\x0b\x0c\x0d\x0e\x0f';
  var cipher = crypto.createCipheriv('aes-128-cbc', key, iv);
  var encoded = cipher.update(plainText, 'utf8', 'hex');
  encoded += cipher.final('hex');
  return encoded;
};


function decrypt(encText, workingKey) {
  var m = crypto.createHash('md5');
  m.update(workingKey)
  var key = m.digest();
  var iv = '\x00\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0a\x0b\x0c\x0d\x0e\x0f';
  var decipher = crypto.createDecipheriv('aes-128-cbc', key, iv);
  var decoded = decipher.update(encText, 'hex', 'utf8');
  decoded += decipher.final('utf8');
  return decoded;
};


// ccavResponseHandler.js integration
app.post('/ccavResponseHandler', async function (request, response) {
  let body = '';
  let ccavEncResponse = '';

  request.on('data', function (data) {
    console.log("Data received: ", data.toString());
    body += data;
    ccavEncResponse += data;
  });

  request.on('end', async function () {
    const ccavPOST = qs.parse(ccavEncResponse);
    const encryption = ccavPOST.encResp;
    const ccavResponse = decrypt(encryption, '1E9B36C49F90A45CEDA3827239927264');
    console.log("Decrypted Payment Response:", ccavResponse);

    const decryptedResponse = qs.parse(ccavResponse);
    console.log("Parsed Payment Response:", decryptedResponse);

    // Check if payment was successful
    if (decryptedResponse.order_status && decryptedResponse.order_status === 'Success') {
      try {
        const user = await User.findOne({ _id: decryptedResponse.userId });
        if (!user) {
          console.error('User not found');
          // Handle user not found error
        } else {
          // Update user's coursesPurchased array
          user.coursesPurchased.push(decryptedResponse.courseName);
          await user.save();
          console.log(`Course ${decryptedResponse.courseName} added to user ${user._id}'s purchased courses.`);

          // Generate a new JWT token for the user
          const newToken = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' }); // Adjust expiresIn as per your requirement

          // Set the new token as a cookie
          response.cookie('authToken', newToken, { httpOnly: true, secure: true }); // Make sure to use secure: true in production

          // Redirect the user to the secure page
          response.redirect('https://globalmedacademy.com/user/success');
        }
      } catch (error) {
        console.error('Error updating user purchased courses:', error);
        response.status(500).send('Server error');
      }
    } else {
      console.log('Payment not successful or unable to verify payment status');
      response.status(400).send('Payment failure or verification issue');
    }
  });
});
function customDecrypt(encText, workingKey) {
  const m = crypto.createHash('md5');
  m.update(workingKey);
  const key = m.digest();
  const iv = Buffer.alloc(16); // Changed to use a zero-filled buffer for IV
  const decipher = crypto.createDecipheriv('aes-128-cbc', key, iv);
  let decoded = decipher.update(encText, 'hex', 'utf8');
  decoded += decipher.final('utf8');
  return decoded;
}
app.get('/guest-pay/:courseID', async (req, res) => {
  const pageTitle = 'Guest Checkout - GlobalMedAcademy';
  const metaRobots = 'follow, index, max-snippet:-1, max-video-preview:-1, max-image-preview:large';
  const metaKeywords = '';
  const ogDescription = 'If you have any queries, read our privacy policy and terms and conditions carefully.';
  const canonicalLink = 'https://www.globalmedacademy.com/guest-checkout-form';
  const username = req.session.username || null;
  
  const courseID = req.params.courseID;
  const course = await Course.findOne({ courseID: courseID });
  if (!course) {
    return res.status(404).send("Course not found");
  }
  res.render('guest-checkout-form', { courseID, courseName: course.name, coursePrice: course.currentPrice ,pageTitle, metaRobots, metaKeywords, ogDescription, canonicalLink, 
 isBlogPage: false});
});
app.get('/guest-checkout-success', (req, res) => {
  const userName = req.query.userName;
  const userEmail = req.query.userEmail;
  const courseName = req.query.courseName;

  // Send a thank you email to the guest user
  sendEmail({
      to: userEmail,
      subject: "Thank You for Your Purchase",
      text: `Hello ${userName},\n\nThank you for purchasing the course: ${courseName}. Your details will be sent to you soon...`,
      html: `<p>Hello <strong>${userName}</strong>,</p><p>Thank you for purchasing the course: <strong>${courseName}</strong>. Your details will be sent to you soon...</p>`
  });

  const messagePage = `
  <!DOCTYPE html>
  <html>
  <head>
      <title>Payment Success</title>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <script>
          setTimeout(function() {
              window.location.href = '/';
          }, 5000); // Redirect after 5 seconds
      </script>
  </head>
  <body>
      <h1>Thank You!</h1>
      <p>Your payment was successful. You will be redirected to the home page shortly.</p>
  </body>
  </html>
  `;
  res.send(messagePage);
});




app.post('/webhook-success', async (req, res) => {
  console.log('Webhook hit received with POST request');

  try {
    const encryptedData = req.body.encResp;
    console.log('Encrypted Data:', encryptedData); // Verify encrypted data is received
    if (!encryptedData) {
      console.log('No encrypted data received');
      return res.status(400).send('No encrypted data');
    }

    // Attempt decryption and log possible errors
    let decryptedData;
    try {
      decryptedData = customDecrypt(encryptedData, '41F0052B4F5A9278198DEED49BED2A4D');
    } catch (decryptError) {
      console.error("Decryption error:", decryptError);
      return res.status(500).send('Error decrypting data');
    }

    console.log('Decrypted Transaction Data:', decryptedData); // Verify format before parsing
    const transactionData = qs.parse(decryptedData);

    if (transactionData.status === "Success") {
      const transactionId = transactionData.orderId;
      const courseName = transactionData.courseName;

      // Find the transaction and update it along with the user's courses
      const transaction = await Transaction.findOne({ transactionId }).populate('userId');
      if (transaction) {
        const userId = transaction.userId._id;
        await User.findByIdAndUpdate(userId, { $addToSet: { coursesPurchased: courseName } });
        await Transaction.findByIdAndUpdate(transaction._id, { status: 'completed' });

        console.log(`Transaction ${transactionId} successfully processed for user ${userId}`);
        res.status(200).send('Webhook processed successfully');
      } else {
        console.log('Transaction not found');
        res.status(404).send('Transaction not found');
      }
    } else {
      console.log('Transaction not successful', transactionData);
      res.status(400).send('Transaction not successful');
    }
  } catch (error) {
    console.error("Error processing webhook:", error);
    res.status(500).send('Server error');
  }
});






app.post('/user', async (req, res) => {
  const userEmail = req.body.email;
  const courseName = req.query.courseName;
  console.log(courseName, userEmail);
  try {
    // Find the user by email and add the courseName to their coursesPurchased array
    // await User.findOneAndUpdate(
    //   { email: userEmail },
    //   { $addToSet: { coursesPurchased: courseName } }, // $addToSet prevents duplicates
    //   { new: true, runValidators: true }
    // );
    res.redirect('/user?purchase=success');
  } catch (error) {
    console.error("Error updating user purchased course", error);
    res.status(500).send('An error occured');
  }

});



app.get('/test', function (req, res) {
  res.render('form', { messages: req.flash() });
})
app.post('/test/submit', function (req, res) {
  let message = "";
  if (req.body.username.toLowerCase() === 'aryaman') {
    message = 'Welcome Aryaman!';
  } else {
    message = 'User not recognised';
  }
  req.flash('message', message);
  return res.redirect('/test');
});




// app.use(express.json());
app.get('/cancel', (req, res) => {
  // Define the message and the redirect URL to the home route
  const message = 'Payment Unsuccessful!';
  const redirectUrl = '/'; // Redirect to the home URL

  // Send a simple HTML response with a script to redirect after a delay
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
    <meta charset="UTF-8">
    <title>${message}</title>
    <style>
      body {
        margin: 0;
        height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: #f0f0f0;
      }
      #message-container {
        text-align: center;
      }
    </style>
    </head>
    <body>
    <div id="message-container">
      <p>${message}</p>
    </div>
    <script>
      setTimeout(() => {
        window.location.href = '${redirectUrl}';
      }, 3000);
    </script>
    </body>
    </html>
  `);
});

// Your forgot password endpoint
app.post('/forgot-password', async (req, res) => {
  const { username } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).send('User with given email does not exist.');
    }

    const token = jwt.sign({ _id: user._id }, JWT_SECRET, { expiresIn: '1h' });

    await User.updateOne({ _id: user._id }, {
      resetPasswordToken: token,
      resetPasswordExpires: Date.now() + 3600000 // 1 hour
    });

    const resetLink = `${req.headers.origin}/reset-password/${token}`;
    const emailBody = `<p>Please use the following link to reset your password:</p><p><a href="${resetLink}">${resetLink}</a></p>`;

    // Send email
    sendEmail({
      to: user.username,
      subject: 'Password Reset Link',
      text: `Please use the following link to reset your password: ${resetLink}`,
      html: emailBody
    });

    res.send('Password reset link has been sent to your email address.');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error on forgot password.');
  }
});

// GET route to render the password reset form
app.get('/reset-password/:token', async (req, res) => {
  const pageTitle = 'Reset your password';
  const metaRobots = 'follow, index, max-snippet:-1, max-video-preview:-1, max-image-preview:large';
  const metaKeywords = '';
  const ogDescription = '';
  const canonicalLink = 'https://www.globalmedacademy.com/forgot-password';
  const { token } = req.params;
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('Token decoded:', decoded);
    const user = await User.findOne({
      _id: decoded._id,
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });
    if (!user) {
      console.log('No user found or token expired for user ID:', decoded._id);
      return res.status(400).send('Password reset token is invalid or has expired.');
    }
    // Render the reset password form
    res.render('reset_password', {
      token, pageTitle,
      metaRobots,
      metaKeywords,
      ogDescription,
      canonicalLink,
      isBlogPage: false,
    });
  } catch (error) {
    console.error('Error verifying token:', error);
    return res.status(400).send('Invalid token.');
  }
});

// Your POST route to handle password reset form submission
app.post('/reset-password/:token', async (req, res) => {
  const { password } = req.body;
  const { token } = req.params;

  try {
    // Verify JWT token and get user
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findOne({
      _id: decoded._id,
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      console.log('Password reset token is invalid or has expired.');
      // Redirect with error message
      return res.redirect(`/reset-password/${token}?message=${encodeURIComponent('Password reset token is invalid or has expired.')}`);
    }

    // Hash new password for local application
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update password in local application
    await User.updateOne({ _id: user._id }, {
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null
    });

    console.log(`Local password updated for user: ${user.username}`);

    // Now update the password in Moodle
    try {
      const moodleResponse = await updateMoodlePassword(user.username, password);
      console.log('Moodle response:', moodleResponse);
      // Check if the Moodle response indicates success
      if (moodleResponse && moodleResponse.exception) {
        console.error('Moodle password update failed with exception:', moodleResponse);
        // Redirect with Moodle error message
        return res.redirect(`/reset-password/${token}?message=${encodeURIComponent('Your local password has been updated, but there was an error updating your Moodle password.')}`);
      } else {
        console.log(`Moodle password updated for user: ${user.username}`);
        // Redirect to the Moodle login page after successful password reset
        return res.redirect(`https://moodle.upskill.globalmedacademy.com/login/index.php?message=${encodeURIComponent('Your password has been successfully reset.')}`);
      }
    } catch (moodleError) {
      // Handle the case where the Moodle password update fails
      console.error('Moodle password update failed:', moodleError);
      // Redirect with Moodle error message
      return res.redirect(`/reset-password/${token}?message=${encodeURIComponent('Your local password has been updated, but there was an error updating your Moodle password.')}`);
    }

  } catch (error) {
    console.error('Error resetting password:', error);
    // Redirect with generic error message
    return res.redirect(`/reset-password/${token}?message=${encodeURIComponent('Error resetting password.')}`);
  }
});

























const url = process.env.MONGODB_URI;
const storage = new GridFsStorage({ url });


app.get('/upload-documents', isAuthenticated, (req, res) => {
  const pageTitle = 'Upload Documents';
  const metaRobots = '';
  const metaKeywords = '';
  const ogDescription = '';
  const canonicalLink = 'https://globalmedacademy.com/upload-documents';
  const courseID = req.query.courseID || '';
  const username = req.session.username || null;
  let firstname = null;
  if (req.isUserLoggedIn && req.user && req.user.fullname) {
    firstname = req.user.fullname.split(' ')[0]; // Extract the first name from the full name
  }
  res.render('data', {
    courseID, isUserLoggedIn: req.isUserLoggedIn,
    username: username, pageTitle,
    metaRobots,
    metaKeywords,
    ogDescription,
    canonicalLink, isBlogPage: false,
    firstname: firstname
  });
});



app.post('/upload-documents', upload.fields([
  { name: 'officialIDCard' },
  { name: 'medicalCertificate' },
  { name: 'mciCertificate' },
  { name: 'degree' },
  { name: 'passportPhoto' }
]), async (req, res) => {
  // Extract the JWT token from the cookie
  const token = req.cookies.authToken;
  if (!token) {
    return res.status(401).send('Unauthorized: No token provided');
  }

  let userId, userFullName;
  try {
    // Verify and decode the token to get the user's ID and full name
    const decoded = jwt.verify(token, JWT_SECRET);
    userId = decoded.userId;
    userFullName = decoded.fullname; // Assuming fullname is part of the JWT payload
  } catch (error) {
    return res.status(401).send('Unauthorized: Invalid token');
  }

  try {
    const uploadedFiles = [];
    const userFolder = userFullName.replace(/\s+/g, '_'); // Replace spaces with underscores

    for (const [key, value] of Object.entries(req.files)) {
      const file = value[0];

      // Upload file to DigitalOcean Spaces in the user-specific folder
      const uploadResult = await s3.upload({
        Bucket: 'lmsuploadedfilesdata',
        Key: `${userFolder}/${file.originalname}`, // Storing in a folder named after the user
        Body: file.buffer,
        ACL: 'public-read' // or 'private', depending on your needs
      }).promise();

      // Push the file URL and title to the uploadedFiles array
      uploadedFiles.push({ url: uploadResult.Location, title: file.originalname });
    }

    const userUpdate = {
      $push: { uploadedFiles: { $each: uploadedFiles } },
      mciNumber: req.body.mciNumber,
      address: req.body.address,
      idNumber: req.body.idNumber,
    };

    // Find the user by ID and update the uploadedFiles array
    const user = await User.findByIdAndUpdate(userId, userUpdate, { new: true });

    if (!user) {
      console.error('User not found:', userId);
      return res.status(404).send('User not found');
    }

    // Send an email to the user after successfully uploading documents
    const userEmail = user.username; // Assuming the email is stored as username in the database
    const emailSubject = 'Thank You for Uploading Documents';
    const emailText = `Dear Dr. ${user.fullname || 'User'},\n\nThank you for uploading your documents. We will enroll you in the Moodle course within 24 hours after verifying the documents you have submitted.\n\nBest Regards,\nGlobal Med Academy`;

    sendEmail({
      to: userEmail,
      subject: emailSubject,
      text: emailText
    });

    // Redirect the user to the /user route after uploading the documents
    res.redirect('/user');
  } catch (error) {
    console.error('Error in upload route:', error);
    res.status(500).send('Internal Server Error');
  }
});


const updateMoodlePassword = async (email, newPassword) => {
  const moodleUrl = 'https://moodle.upskill.globalmedacademy.com'; // Replace with your Moodle URL
  const token = process.env.MOODLE_TOKEN; // Replace with your actual token
  const functionname = 'core_user_update_users';

  // Retrieve Moodle user ID using the function we've just implemented
  const moodleUserId = await getMoodleUserId(email);

  const users = [{
    id: moodleUserId,
    password: newPassword
  }];

  const postData = {
    wstoken: token,
    wsfunction: functionname,
    moodlewsrestformat: 'json',
    users: users
  };

  try {
    const response = await axios.post(`${moodleUrl}/webservice/rest/server.php`, null, {
      params: postData
    });

    // Moodle usually returns an empty object on success for update functions
    return response.data; // Handle the response data as needed
  } catch (error) {
    console.error('Failed to update password in Moodle:', error);
    // Handle the error accordingly
    throw error; // It's good practice to rethrow the error if you cannot handle it properly here
  }
};

async function getMoodleUserId(email) {
  const formData = new FormData();
  formData.append('moodlewsrestformat', 'json');
  formData.append('wsfunction', 'core_user_get_users');
  formData.append('wstoken', process.env.MOODLE_TOKEN); // Ensure your Moodle token is correctly set in your environment

  // Criteria for searching the user
  formData.append('criteria[0][key]', 'email');
  formData.append('criteria[0][value]', email);

  try {
    const response = await axios.post('https://moodle.upskill.globalmedacademy.com/webservice/rest/server.php', formData, {
      headers: formData.getHeaders()
    });

    if (response.data && response.data.users && response.data.users.length > 0) {
      return response.data.users[0].id; // Returns the first user's ID
    } else {
      throw new Error('User not found.');
    }
  } catch (error) {
    console.error('Error in getMoodleUserId:', error);
    throw new Error('Failed to retrieve Moodle user ID.');
  }
}

// const getMoodleUserId = async (email) => {
//   const moodleUrl = 'https://moodle.upskill.globalmedacademy.com'; // Replace with your Moodle URL
//   const token = process.env.MOODLE_TOKEN; // Replace with your actual token
//   const functionname = 'core_user_get_users_by_field';

//   try {
//     const response = await axios.post(`${moodleUrl}/webservice/rest/server.php`, null, {
//       params: {
//         wstoken: token,
//         wsfunction: functionname,
//         moodlewsrestformat: 'json',
//         field: 'email',
//         values: [email]
//       }
//     });

//     const users = response.data;
//     if (users.length === 0) {
//       throw new Error('No Moodle user found with the given email address.');
//     }

//     return users[0].id;
//   } catch (error) {
//     console.error('Failed to retrieve Moodle user ID:', error);
//     throw error;
//   }
// };
//AdminPanel

//  async function hashPassword() {
//   const password = 'GLobalmed1cloud'; // Your plain text password
//   const saltRounds = 10; // You can adjust the number of rounds
//   const hashedPassword = await bcrypt.hash(password, saltRounds);
//   console.log(hashedPassword);
// }

const adminUser = {
  username: 'admin',
  password: process.env.ADMIN_PASSWORD// Use bcrypt to hash your actual password
};
app.post("/admin-login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if the username matches and verify the password
    if (username === adminUser.username && await bcrypt.compare(password, adminUser.password)) {
      // Generate a JWT token for the admin
      const adminToken = jwt.sign({ adminId: "admin_unique_id" }, JWT_SECRET, { expiresIn: '1h' });

      // Set the token in an HTTPOnly cookie
      res.cookie('adminToken', adminToken, { httpOnly: true, maxAge: 3600 * 1000 });

      // Redirect or send a success response
      res.redirect('/admin-panel');
    } else {
      return res.status(401).json({ success: false, message: "Invalid admin credentials" });
    }
  } catch (error) {
    console.error("Error while logging in as admin:", error);
    return res.status(500).json({ success: false, message: "Error while logging in as admin" });
  }
});

const authenticateAdminJWT = (req, res, next) => {
  const token = req.cookies.adminToken; // Assuming the token is stored in a cookie

  if (!token) {
    // Redirect to admin login if no token is provided
    return res.redirect('/admin-login');
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = decoded; // Add the decoded token to the request
    next();
  } catch (ex) {
    // Redirect to admin login if token is invalid
    res.redirect('/admin-login');
  }
};
app.get('/admin-panel', authenticateAdminJWT, async function (req, res) {
  const view = req.query.view || 'users'; // Default to 'users' view
  const page = parseInt(req.query.page) || 1;
  const pageSize = 10;

  try {
      // Common data for pagination
      let context = {
          currentPage: page,
          view,
      };

      if (view === 'users') {
          // Fetch user-related data only if in the 'users' view
          const users = await User.find({}).skip((page - 1) * pageSize).limit(pageSize);
          const totalUsers = await User.countDocuments();

          const nonMoodleUsers = await NonMoodleUser.find({}).skip((page - 1) * pageSize).limit(pageSize);
          const totalNonMoodleUsers = await NonMoodleUser.countDocuments();

          const guestCheckouts = await GuestCheckout.find({}).skip((page - 1) * pageSize).limit(pageSize);
          const totalGuestCheckouts = await GuestCheckout.countDocuments();

          const totalPagesUsers = Math.ceil(totalUsers / pageSize);
          const totalPagesNonMoodleUsers = Math.ceil(totalNonMoodleUsers / pageSize);
          const totalPagesGuestCheckouts = Math.ceil(totalGuestCheckouts / pageSize);

          Object.assign(context, {
              users,
              nonMoodleUsers,
              guestCheckouts,
              totalPagesUsers,
              totalPagesNonMoodleUsers,
              totalPagesGuestCheckouts,
          });
      } else if (view === 'courses') {
          // Fetch course-related data only if in the 'courses' view
          const courses = await Course.find({})
          const totalCourses = await Course.countDocuments();
          const totalPagesCourses = Math.ceil(totalCourses / pageSize);

          Object.assign(context, { courses, totalPagesCourses });
      }

      res.render('admin-panel', context);
  } catch (error) {
      console.error("Error fetching entities:", error);
      res.status(500).send("Error fetching data");
  }
});

app.post('/update-guest-checkout-status', async (req, res) => {
  try {
      const { checkoutId, newStatus } = req.body;
      // Assuming `coursePurchased` is an array and you want to update all courses within a checkout
      await GuestCheckout.updateOne({ "_id": checkoutId }, 
                                     { "$set": { "coursePurchased.$[].status": newStatus } });
      res.redirect('/admin-panel?statusUpdated=true'); // Redirect back to the admin panel, optionally with a query param to show a success message
  } catch (error) {
      console.error("Error updating guest checkout status:", error);
      res.status(500).send("Error updating status");
  }
});

app.post('/manage-guest-checkout', upload.fields([
  { name: 'officialIDCard' },
  { name: 'medicalCertificate' },
  { name: 'mciCertificate' },
  { name: 'degree' },
  { name: 'passportPhoto' }
]), async (req, res) => {
  const { email, password, coursePurchased } = req.body;

  try {
    // Fetch guest checkout details by email
    const guestCheckout = await GuestCheckout.findOne({ email: email });
    if (!guestCheckout) {
      return res.status(404).send("Guest checkout details not found for the provided email");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Assuming createUserInMoodle, getMoodleUserId, enrollUserInMoodle are correctly implemented
    await createUserInMoodle(email, password, guestCheckout.name, guestCheckout.phoneNumber, email);
    const moodleUserId = await getMoodleUserId(email);

    // Enroll user in Moodle course
    const courseId = await getOrCreateCourseIdByName(coursePurchased);
    const roleId = 5; // Assuming roleId 5 is for students
    await enrollUserInMoodle(moodleUserId, courseId, roleId);

    // Process uploaded files
    const uploadedFiles = [];
    const userFolder = `guest-${email.replace(/[@\.]/g, '_')}`; // Sanitize email for use in file path

    for (const [key, value] of Object.entries(req.files)) {
      const file = value[0];

      const uploadResult = await s3.upload({
        Bucket: 'lmsuploadedfilesdata',
        Key: `${userFolder}/${file.originalname}`,
        Body: file.buffer,
        ACL: 'public-read'
      }).promise();

      uploadedFiles.push({ url: uploadResult.Location, title: file.originalname });
    }

    // Update guest checkout with uploaded files information
    await GuestCheckout.findByIdAndUpdate(guestCheckout._id, {
      $push: { uploadedFiles: { $each: uploadedFiles } }
    }, { new: true });

    // Send confirmation email
    sendEmail({
      to: email,
      subject: 'Welcome to Our Learning Platform!',
      text: `Dear ${guestCheckout.name},\n\n` +
        `You have been successfully enrolled in ${coursePurchased}.\n` +
        `Your access credentials are as follows:\n` +
        `Username: ${email}\n` +
        `Password: ${password}\n\n` +
        `You can now access your course materials and start learning. If you encounter any issues, please contact support.\n\n` +
        `Best,\n` +
        `The Learning Platform Team`
    });

    res.redirect('/admin-panel?guestCheckoutAdded=true');
  } catch (error) {
    console.error("Error processing guest checkout:", error);
    res.status(500).send("Error processing request");
  }
});



app.post('/migrateToMoodle', async (req, res) => {
  const { userId, password } = req.body;

  try {
    const nonMoodleUser = await NonMoodleUser.findById(userId);
    if (!nonMoodleUser) {
      return res.status(404).send('User not found');
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    // Map coursesInterested to their full names using courseNames object
    const coursesFullNames = nonMoodleUser.coursesIntrested.map(abbr => courseNames[abbr] || abbr);

    // Prepare the new user details
    const newUserDetails = {
      fullname: nonMoodleUser.fullname,
      username: nonMoodleUser.username,
      password: hashedPassword,
      phone: nonMoodleUser.number,
      coursesPurchased: coursesFullNames,
      // Add any other fields you need to migrate
    };

    // Create a new user in the User collection
    const newUser = new User(newUserDetails);
    await newUser.save();

    // Create Moodle username and set Moodle password
    await createUserInMoodle(newUser.username, password, newUser.fullname, '.', newUser.username);
    // Get Moodle user ID
    const moodleUserId = await getMoodleUserId(newUser.username);

    // Enroll user in Moodle courses
    for (let courseName of coursesFullNames) {
      const courseId = await getOrCreateCourseIdByName(courseName); // Make sure this function matches the course name to its Moodle ID
      const roleId = 5; // Assuming role ID for student
      await enrollUserInMoodle(moodleUserId, courseId, roleId);
    }
    // Optionally delete the nonMoodleUser or mark as migrated
    await NonMoodleUser.findByIdAndDelete(userId);

    // Send confirmation email
    sendEmail({
      to: newUser.username,
      subject: 'Welcome to GlobalMed Academy!',
      text: `Dear Dr. ${newUser.fullname.split(" ")[0]},\n\n` +
        `Welcome aboard!\n` +
        `We are excited to share your credentials for the GlobalMed Academy’s Learning Management System (LMS) to support your commitment to upskilling yourself. Our LMS provides you the platform to access self-learning contents and other required information.\n` +
        `Below are the access credentials and instructions to get you started:\n` +
        `Website: https://moodle.upskill.globalmedacademy.com/login/index.php\n` +
        `Username: ${newUser.username}\n` +
        `Password: ${password}\n\n` +
        `Once logged in, our user-friendly interface will allow you to navigate through different courses and learning materials effortlessly. Feel free to browse the available courses and explore the learning modules and resources specific to your area of interest.\n` +
        `For User Support:\n` +
        `We have a dedicated support team available to assist you with any questions or issues you may encounter while using the LMS. Should you require any assistance, please contact 9730020462.\n\n` +
        `Happy Learning!\n\n` +
        `GlobalMED Academy.`
    });

    res.send('User migrated successfully to Moodle system.');
  } catch (error) {
    console.error('Migration error:', error);
    res.status(500).send('Error migrating user');
  }
});

app.post('/update-user', async function (req, res) {
  const { userId, field, value } = req.body;

  try {
    const user = await User.findById(userId);
    user[field] = value;
    await user.save();
    res.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).send("Error updating user data");
  }
});
app.post('/update-course/:courseId', async function(req, res) {
  const { courseId } = req.params;
  const updatedCourse = req.body;

  try {
      await Course.findOneAndUpdate({ courseID: courseId }, updatedCourse);
      // Redirect to the admin panel with a success message
      res.redirect('/admin-panel?update=success');
  } catch (error) {
      console.error("Error updating course:", error);
      // Redirect to the admin panel with an error message
      res.redirect('/admin-panel?update=error');
  }
});


mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });


// Mapping from course abbreviation to full course name
const courseNames = {
  PCDM: "Professional Certificate in Diabetes Management",
  ACDM: "Advanced Certificate in Diabetes Management",
  FDM: "Fellowship in Diabetes Management",
  FIMD: "Fellowship in Integrated Management of Diabetes",
  PCC: "Professional Certificate in Critical Care",
  ACC: "Advance Certificate in Critical Care",
  FCC: "Fellowship in Critical Care",
  PCGP: "Professional Certificate in General Practice",
  ACGP: "Advance Certificate in General Practice",
  FGP: "Fellowship in General Practice",
  PCIM: "Professional Certificate in Internal Medicine",
  ACIM: "Advance Certificate in Internal Medicine",
  FIM: "Fellowship in Internal Medicine",
  FFM: "Fellowship in Family Medicine" // New course added
};

app.post('/create-user', upload.fields([
  { name: 'officialIDCard' },
  { name: 'mciCertificate' },
  { name: 'degree' },
  { name: 'passportPhoto' }
]), async (req, res) => {
  const { username, password, fullname, email, enrollmentNumber, phone, mciNumber, address, idNumber } = req.body;
  const selectedCourseAbbr = req.body.course;
  const courseName = courseNames[selectedCourseAbbr] || 'Default Course Name';
  const roleId = 5; // Assuming role ID for student

  try {
    // Step 1: Hash password
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Step 2: Create user in Moodle and retrieve user ID
    let moodleUserId;
    try {
      await createUserInMoodle(username, password, fullname, '.', username);
      moodleUserId = await getUserIdFromUsername(username);
    } catch (error) {
      throw new Error('Failed to create user in Moodle or retrieve Moodle user ID.');
    }

    // Step 3: Get or create the course in Moodle
    let courseId;
    try {
      courseId = await getOrCreateCourseIdByName(courseName); // This will create the course if missing
    } catch (error) {
      throw new Error('Failed to retrieve or create course in Moodle.');
    }

    // Step 4: Enroll user in the Moodle course
    try {
      await enrollUserInCourse(username, courseId);
    } catch (error) {
      throw new Error('Failed to enroll user in the Moodle course.');
    }

    // Step 5: Create user in local database
    const newUser = new User({
      username,
      password: hashedPassword,
      fullname,
      email,
      phone,
      mciNumber,
      address,
      idNumber,
      enrollmentNumber,
      coursesPurchased: [courseName]
    });

    const savedUser = await newUser.save();

    // Step 6: Handle file uploads to S3
    const uploadedFiles = [];
    const userFolder = `guest-${username.replace(/[@\.]/g, '_')}`; // Sanitize email for use in file path

    for (const [key, value] of Object.entries(req.files)) {
      const file = value[0];

      const uploadResult = await s3.upload({
        Bucket: 'lmsuploadedfilesdata',
        Key: `${userFolder}/${file.originalname}`,
        Body: file.buffer,
        ACL: 'public-read'
      }).promise();

      uploadedFiles.push({ url: uploadResult.Location, title: file.originalname });
    }

    await User.findByIdAndUpdate(savedUser._id, {
      $push: { uploadedFiles: { $each: uploadedFiles } }
    }, { new: true });

    // Step 7: Send confirmation email
    sendEmail({
      to: username,
      subject: 'Welcome to GlobalMed Academy!',
      text: `Dear Dr. ${fullname.split(" ")[0]},\n\n` +
        `Welcome aboard!\n` +
        `We are excited to share your credentials for the GlobalMed Academy’s Learning Management System (LMS) to support your commitment to upskilling yourself. Our LMS provides you the platform to access self-learning contents and other required information.\n` +
        `Below are the access credentials and instructions to get you started:\n` +
        `Website: https://moodle.upskill.globalmedacademy.com/login/index.php\n` +
        `Username: ${username}\n` +
        `Password: ${password}\n\n` +
        `Once logged in, our user-friendly interface will allow you to navigate through different courses and learning materials effortlessly. Feel free to browse the available courses and explore the learning modules and resources specific to your area of interest.\n` +
        `For User Support:\n` +
        `We have a dedicated support team available to assist you with any questions or issues you may encounter while using the LMS. Should you require any assistance, please contact 9730020462.\n\n` +
        `Happy Learning!\n\n` +
        `GlobalMED Academy.`
    });

    res.redirect('/admin-panel?userAdded=true');

  } catch (error) {
    console.error('Error in /create-user route:', error.message);
    res.status(500).send("An error occurred during user registration.");
  }
});

// searchAndLogCourseDetails("Fellowship in Diabetes Management");

//success route for verifying user after payment
app.get('/success', async (req, res) => {
  const courseID = req.query.courseID; // Extract courseID from the URL

  if (!courseID) {
    return res.status(400).send('Course ID is required');
  }

  // Extract the JWT token from the cookie
  const token = req.cookies.authToken;
  if (!token) {
    return res.status(401).send('Unauthorized: No token provided');
  }

  let userId;
  try {
    // Verify and decode the token to get the user's ID
    const decoded = jwt.verify(token, JWT_SECRET);
    userId = decoded.userId;
  } catch (error) {
    return res.status(401).send('Unauthorized: Invalid token');
  }

  try {
    // Find the course by courseID
    const course = await Course.findOne({ courseID: courseID });
    if (!course) return res.status(404).send('Course not found');

    const courseName = course.name;
    console.log(courseName);
    // Add the course to the user's purchased courses
    const user = await User.findByIdAndUpdate(userId, {
      $addToSet: { coursesPurchased: courseName }
    }, { new: true });

    if (!user) {
      console.error('User not found:', userId);
      return res.status(404).send('User not found');
    }
    console.log(`User ${user.username} found. Proceeding to enroll in Moodle.`);

    // Assuming you have a function to get Moodle user ID similar to your createUserInMoodle logic
    const moodleUserId = await getMoodleUserId(user.username);
    const courseNameForMoodle = "Fellowship in Diabetes Management";
    // Assuming you have a function to get Course ID by Name for Moodle
    const courseId = await getOrCreateCourseIdByName(courseName);
    const roleId = 5; // Assuming role ID for student
    searchAndLogCourseDetails(courseNameForMoodle);
    console.log(`Enrolling user in Moodle. MoodleUserId: ${moodleUserId}, CourseId: ${courseId}, RoleId: ${roleId}`);

    // Enroll the user in the Moodle course
    const enrollmentResponse = await enrollUserInMoodle(moodleUserId, courseId, roleId);

    console.log('Moodle enrollment response:', enrollmentResponse);

    // Send a payment receipt to the user
    sendEmail({
      to: [user.username],
      subject: 'Your Payment Receipt',
      text: `Thank you for purchasing the course. Your payment was successful! We will send you the receipt!`
    });

    // Send a new enrollment message to the admin
    sendEmail({
      to: 'onlinemedcourses@gmail.com',
      subject: 'New User Enrollment',
      text: `A new user has enrolled in the course. \n\nUser Email: ${user.username}\nCourse: ${courseName}\nPayment Status: Successful`
    });

    // Redirect to the user page with a success message
    res.redirect('/user?message=Payment successful! Course added.');
  } catch (error) {
    console.error('Error in success route:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/user-submit', upload.fields([
  { name: 'officialIDCard' },
  { name: 'mciCertificate' },
  { name: 'degree' },
  { name: 'passportPhoto' }
]), async (req, res) => {
  const { username, fullname, email, number } = req.body;
  const selectedCourseAbbr = req.body.course;
  // Assume courseNames is defined somewhere
  const courseName = courseNames[selectedCourseAbbr] || 'Default Course Name';

  try {
    const existingUser = await NonMoodleUser.findOne({ username: username });
    if (existingUser) {
      return res.status(400).json({ message: "Email already used" });
    }

    const newUser = new NonMoodleUser({
      fullname,
      username,
      number,
      coursesIntrested: [courseName],
      // other fields as needed...
    });

    const savedUser = await newUser.save();



    // Handle file uploads
    const uploadedFiles = [];
    const userFolder = username; // Use username as folder name
    // Use MongoDB ID as folder name


    for (const [key, value] of Object.entries(req.files)) {
      const file = value[0];

      const uploadResult = await s3.upload({
        Bucket: 'nonmoodleuserdata', // Updated bucket name
        Key: `${userFolder}/${file.originalname}`,
        Body: file.buffer,
        ACL: 'public-read'
      }).promise();

      uploadedFiles.push({ url: uploadResult.Location, title: file.originalname });
    }

    await NonMoodleUser.findByIdAndUpdate(savedUser._id, { // Make sure to update this model reference
      $push: { uploadedFiles: { $each: uploadedFiles } }
    }, { new: true });
    console.log({ selectedCourseAbbr, courseName });
    // Instead of redirecting directly, send the redirect URL in the response
    res.status(200).json({ success: true, redirectUrl: 'https://globalmedacademy.ccavenue.com/stores/storefront.do?command=validateMerchant&param=globalmedacademy#' });
  } catch (error) {
    console.error('Error in /user-submit route:', error);
    res.status(500).send("An error occurred during user registration.");
  }
});

app.post('/delete-selected-users', authenticateAdminJWT, async function (req, res) {
  try {
    await User.deleteMany({ _id: { $in: req.body.userIds } });
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting users:", error);
    res.status(500).json({ success: false });
  }
});



app.post('/update-users', async (req, res) => {
  try {
    const updates = req.body.updates;
    for (const update of updates) {
      await User.findByIdAndUpdate(update.id, { [update.field]: update.value });
    }
    res.json({ success: true });
  } catch (error) {
    console.error("Error updating users:", error);
    res.status(500).json({ success: false });
  }
});
app.get('/search-courses', async (req, res) => {
  const searchQuery = req.query.query;
  console.log("Search query received:", searchQuery); // Check the input from the user

  if (!searchQuery) {
      console.log("No search query provided");
      return res.render('search-course', {
        courses: [],
        isUserLoggedIn: req.isUserLoggedIn,
        message: "Please enter a valid search term.",

        pageTitle: 'About Fellowship, Certificate Courses Online - GlobalMedAcademy',
        metaRobots: 'follow, index, max-snippet:-1, max-video-preview:-1, max-image-preview:large',
        metaKeywords: 'certificate courses online, fellowship course, fellowship course details, fellowship in diabetology, critical care medicine, internal medicine',
        ogDescription: 'GlobalMedAcademy (GMA) is a cutting-edge Medical Ed-tech organization that provides specialized courses for medical graduates through hybrid learning approach.',
        canonicalLink: 'https://www.globalmedacademy.com/search-course',
        username: req.session.username || null,
        firstname: req.isUserLoggedIn && req.user && req.user.fullname ? req.user.fullname.split(' ')[0] : null,
        isBlogPage: false
      });
  }
  try {
      const courses = await searchCourses(searchQuery);
       // This will tell you how many courses matched the search
      res.render('search-course', {
          courses: courses,
          isUserLoggedIn: req.isUserLoggedIn,
          message: "Please enter a valid search term.",
          pageTitle: 'About Fellowship, Certificate Courses Online - GlobalMedAcademy',
          metaRobots: 'follow, index, max-snippet:-1, max-video-preview:-1, max-image-preview:large',
          metaKeywords: 'certificate courses online, fellowship course, fellowship course details, fellowship in diabetology, critical care medicine, internal medicine',
          ogDescription: 'GlobalMedAcademy (GMA) is a cutting-edge Medical Ed-tech organization that provides specialized courses for medical graduates through hybrid learning approach.',
          canonicalLink: 'https://www.globalmedacademy.com/search-course',
          username: req.session.username || null,
          firstname: req.isUserLoggedIn && req.user && req.user.fullname ? req.user.fullname.split(' ')[0] : null,
          isBlogPage: false
      });
  } catch (error) {
      console.error('Search Error:', error);
      res.status(500).send('Error retrieving courses');
  }
});


app.listen(3000, function () {
  console.log("Server started successfully!");
});
setRoutes(app);
