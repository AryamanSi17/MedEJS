require('dotenv').config({path:__dirname+'/./../../.env'})
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const ejs = require("ejs");
const passportLocalMongoose = require("passport-local-mongoose");
const passport = require("passport");
const session = require("express-session");
const { mongoose, User, Course, Request } = require("./utils/db"); // Import from db.js
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
const jwt = require('jsonwebtoken');
const isAuthenticated = require('./utils/authMiddleware');
const bcrypt = require('bcrypt');
const JWT_SECRET = "med ejs is way to success";
const multer = require('multer');
const checkUserLoggedIn = require('./utils/authMiddleware');
const cookieParser = require('cookie-parser');
const { postReq, postRes } = require('./utils/ccavRequestHandler');
const {saveEnquiry}= require('./utils/kit19Integration');
const { Types } = require('mongoose');
let loggedIn = true;
// const enrollUserInCourse = require('./utils/enrollUser.js')
const app = express();
app.use(session({
  secret: "global med academy is way to success",
  resave: false,
  saveUninitialized: true
}));
// Use the middleware globally for all routes

app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use(passport.initialize());
app.use(passport.session());
app.use(cookieParser());
app.use(checkUserLoggedIn);

passport.use(new GoogleStrategy({
  clientID: "768289392704-eivkc190qgbss1afm45ul4g0pvk9ddjf.apps.googleusercontent.com",
  clientSecret: "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",
  callbackURL: "https://globalmedacademy.com/auth/google/test",
  userProfileURL: "https://www.googleapis.com/oauth2/v2/userinfo"
},
  async (accessToken, refreshToken, profile, done) => {
    try {
      const user = await findOrCreateUser(profile);
      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }));

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

    return newUser.save();
  }
};

// ends

app.get("/auth/google",
  passport.authenticate('google', {
    scope: ['profile', 'email']
  })
);

app.get("/auth/google/test",
  passport.authenticate('google', { failureRedirect: '/login' }),
  function (req, res) {
    // Successful authentication, redirect home.
    res.render('auth_index');
  }
);
app.get('/logout', (req, res) => {
  // Clear the authToken cookie
  res.clearCookie('authToken');

  // Destroy the session
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
      return res.status(500).send("Error logging out");
    }

    // Redirect to homepage or login page
    res.redirect('/');
  });
});


// Store generated OTP
let storedOTP = null;

app.use(express.json()); // Add this middleware to parse JSON in requests
app.post("/register", async (req, res) => {
  try {
    const { username, fullname, password } = req.body;
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ error: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, fullname, password: hashedPassword });
    await newUser.save();

    // Generate and set the JWT token
    const token = jwt.sign({ userId: newUser._id }, JWT_SECRET);
    res.cookie('authToken', token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 }); // Cookie will expire after 24 hours

    createUserInMoodle(username, password, fullname, '.', username)
      .then(() => {
        req.session.save();
        passport.authenticate("local")(req, res, function () {
          res.render("auth_index", { username: username });
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
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET);
    // console.log("Generated Token:", token);
    // Set JWT token as a cookie
    res.cookie('authToken', token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 }); // Cookie will expire after 24 hours

    // Set username in the session
    req.session.username = username;
    // req.session.fullname= fullname;
    res.render("auth_index", { username: username });
  } catch (error) {
    console.error("Error while logging in:", error);
    res.status(500).json({ error: "Error while logging in" });
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
    pass: "ejdqgdnqhdmlmpxc"
  }
});

app.post('/send-otp', (req, res) => {
  const email = req.body.email;
  const otp = Math.floor(100000 + Math.random() * 900000);
  otps[email] = otp;

  const mailOptions = {
    from: 'info@globalmedacademy.com',
    to: email,
    subject: 'Your Verification Code',
    text: `Your verification code is ${otp}`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
      res.status(500).json({ message: 'Failed to send OTP' });
    } else {
      console.log('Email sent: ' + info.response);
      res.status(200).json({ message: 'OTP sent successfully' });
    }
  });
});

app.post('/verify-otp', (req, res) => {
  const email = req.body.email;
  const userOtp = req.body.otp;

  if (otps[email] === parseInt(userOtp, 10)) {
    delete otps[email];
    res.status(200).json({ message: 'OTP verified successfully' });
  } else {
    res.status(400).json({ message: 'Invalid OTP. Please try again!' });
  }
});

const enrollUserInCourse = async (userId, courseid) => {
  const formData = new FormData();
  formData.append('moodlewsrestformat', 'json');
  formData.append('wsfunction', 'enrol_manual_enrol_users');
  formData.append('wstoken', "3fecec7d7227a4369b758e917800db5d");
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


// // API endpoint to handle form submission
// app.post('/submitRequestForMore', (req, res) => {
//   const formData = req.body;

//   // Create a new Request object with the form data
//   const request = new Request({
//     name: formData.name,
//     phone: formData.phone,
//     email: formData.email,
//     course: formData.course,
//   });

//   // Save the form data to MongoDB
//   request.save()
//     .then(() => {
//       console.log('Form data saved to MongoDB:', request);
//       // Send a success message to the client
//       res.send('Form data submitted successfully. Redirecting to the homepage...<meta http-equiv="refresh" content="2;url=/">');

//     })

//     .catch((err) => {
//       console.error('Error saving form data to MongoDB:', err);
//       res.status(500).send('An error occurred while submitting the form, PLease go back !');
//     });
// });

// Route to start the payment
app.post('/pay', (req, res) => {
  postReq(req, res);
});

// Route to handle the response from CCAvenue (you might need to set this URL in your CCAvenue dashboard as the response URL)
app.post('/handleResponse', (req, res) => {
  postRes(req, res);
});


// app.post('/pay/:objectId',async (req, res) => {
//   const objectId = req.params.objectId;

//   // Validate the ObjectId format using Mongoose's Types.ObjectId
//   if (!mongoose.Types.ObjectId.isValid(objectId)) {
//       return res.status(400).send('Invalid ObjectId format');
//   }

//   // Fetch course from the database using the ObjectId
//   try {
//     const course = await Course.findById(objectId);
//     if (!course) {
//         return res.status(404).send("Course not found");
//     }


//       // Store the ObjectId in the user's session
//       req.session.objectId = objectId;

//       // Redirect to the /user page
//       res.redirect(`/user/${objectId}`);
    
  
// } catch(err){
//   return res.status(500).send("error fetching course");
// }
// });


// Usage
const userId = '15'; // Replace with the actual user ID
const courseid = '9'; // Replace with the actual Course ID
// enrollUserInCourse(userId, courseid);
setRoutes(app);
// sendEmail();


// File handaling method by multer

const FileModel = require("./utils/db");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/tmp/')
  },
  //   filename: function (req, file, cb) {
  //     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9.pdf)
  //     cb(null, file.filename + '-' + uniqueSuffix)
  //   }
  // })

  filename: function (req, file, cb) {

    const originalName = file.originalname;
    const timestamp = Date.now();
    const fileExtension = originalName.split('.').pop(); // Get the file extension
    cb(null, `${timestamp}-${file.fieldname}.${fileExtension}`);
  },
});

const upload = multer({ storage: storage })

app.get("/data", (req, res) => {
  res.render("data");
})


//multer db config starts

function uploadAndSaveToDatabase(req, res, next) {
  upload.array('photu', 24)(req, res, function (err) {
    if (err) {
      // Handle any upload errors
      return res.status(500).json({ error: 'File upload failed' });
    }

    // Create a new document with file information from req.file
    const { originalname, filename, path, size } = req.file;
    const fileData = {
      originalname,
      filename,
      path,
      size,
      // Add other relevant fields as needed
    };

    FileModel.create(fileData, function (err, photu) {
      if (err) {
        // Handle any database save errors
        return res.status(500).json({ error: 'Database save failed' });
      }

      // File information saved successfully
      res.json({ message: 'File uploaded and saved to the database!' });
    });
  });
}

//  multer config ends here 

//Kit19Integration
app.post('/submitRequestForMore', async (req, res) => {
  try {
      const response = await saveEnquiry(req.body);

      console.log("Kit19 Response:", response);  // Log the entire response

      if (response.data.Status === 0) {
        res.send('Form data submitted successfully. Redirecting to the homepage...<meta http-equiv="refresh" content="2;url=/">');
      } else {
          res.status(400).send('Failed to save enquiry.');
      }
  } catch (error) {
      console.error('Error:', error);
      res.status(500).send('Internal server error.');
  }
});




app.post("/data", uploadAndSaveToDatabase, (req, res) => {
  // res.send("uploaded")
  res.json({ message: 'File uploaded and saved to the database!' });
  console.log(req.file);
});

app.listen(3000, function () {
  console.log("Server started successfully!");
});