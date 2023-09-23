require('dotenv').config();
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
const { log, error } = require('console');
const jwt = require('jsonwebtoken');
const isAuthenticated = require('./utils/authMiddleware');
const bcrypt = require('bcrypt');
const JWT_SECRET = "med ejs is way to success";
const multer = require('multer');
const checkUserLoggedIn = require('./utils/authMiddleware');
const cookieParser = require('cookie-parser');
<<<<<<< HEAD
const ccavRequestHandler = require('./ccavenue/ccavRequestHandler');
const ccavResponseHandler = require('./ccavenue/ccavResponseHandler');
// const GridFsStorage = require('gridfs-stream');
const {GridFsStorage} = require('multer-gridfs-storage');
// const crypto = require('crypto');

const {saveEnquiry}= require('./utils/kit19Integration');
const { Types, connection } = require('mongoose');
=======
const querystring = require('querystring');
const {saveEnquiry}= require('./utils/kit19Integration');
const { Types } = require('mongoose');
const { createCheckoutSession } = require('./utils/stripepay');
>>>>>>> a9705a94ecd0e716ea4250e5abc82a74c252a0c6
let loggedIn = true;
// const enrollUserInCourse = require('./utils/enrollUser.js')
const app = express();
app.use(session({
  secret: "global med academy is way to success",
  resave: false,
  saveUninitialized: true
}));
// Use the middleware globally for all routes
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use(passport.initialize());
app.use(passport.session());
app.use(cookieParser());
app.use(checkUserLoggedIn);
passport.use(new GoogleStrategy({
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
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
    pass: process.env.EMAIL_PASS
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
    
    // Set the session variable to indicate that the email has been verified
    req.session.emailVerified = true;

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

app.get('/success', async (req, res) => {
  const paymentIntentId = req.query.payment_intent; // get payment intent ID from query params
  const token = req.cookies.authToken;

  if (!token) {
    return res.status(401).send('Unauthorized: No token provided');
  }

  let userId;
  try {
    const decoded = jwt.verify(token, JWT_SECRET); // replace with your JWT secret
    userId = decoded.userId;
  } catch (error) {
    return res.status(401).send('Unauthorized: Invalid token');
  }

  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    const course = await Course.findById(paymentIntent.metadata.courseObjectId); // replace with how you're storing course ID in payment metadata
    if (!course) {
      return res.status(404).send('Course not found');
    }

    const courseName = course.title; // Assuming the course name is stored in the "title" field

    await User.findByIdAndUpdate(userId, {
      $addToSet: { coursesPurchased: courseName } // $addToSet ensures no duplicates
    });

    res.redirect('/user');
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});


app.get('/cancel', (req, res) => {
  res.send('Your purchase was canceled.');
});


app.post('/pay/:courseObjectId', async (req, res) => {
  const courseObjectId = req.params.courseObjectId;

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
    // Find the course using the ObjectId to ensure it exists and fetch its name
    const course = await Course.findById(courseObjectId);
    if (!course) {
      return res.status(404).send('Course not found');
    }

    const courseName = course.title; // Assuming the course name is stored in the "title" field

    // Update the user's coursesPurchased field with the course name
    await User.findByIdAndUpdate(userId, {
      $addToSet: { coursesPurchased: courseName } // $addToSet ensures no duplicates
    });

    // Redirect to the user profile page
    res.redirect('/user');
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});

app.get('/user', async function(req, res) {
  const pageTitle = 'User Profile';
  const metaRobots = '';
  const metaKeywords = '';
  const ogDescription = '';
  const canonicalLink = 'https://globalmedacademy.com/user';

  let coursesEnrolled = [];

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
      if (user && user.coursesPurchased) {
          coursesEnrolled = user.coursesPurchased;
      }

      // Render the user page with the course names and other details
      res.render('user_Profile', {
          pageTitle,
          metaRobots,
          metaKeywords,
          ogDescription,
          canonicalLink,
          isUserLoggedIn: req.isUserLoggedIn,
          username: user.username,  // Use the username from the fetched user data
          fullname: user.fullname,  // Similarly, use the fullname from the fetched user data
          coursesEnrolled  // Pass the courses to the EJS template
      });
  } catch (error) {
      console.error("Error fetching user's courses:", error);
      res.status(500).send('Server Error');
  }
});
// Usage
const userId = '15'; // Replace with the actual user ID
const courseid = '9'; // Replace with the actual Course ID
// enrollUserInCourse(userId, courseid);

// sendEmail();


// File handaling method

// const FileModel = require("./utils/db");

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, './uploads/tmp/')
  // },

  //   filename: function (req, file, cb) {
  //     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9.pdf)
  //     cb(null, file.filename + '-' + uniqueSuffix)
  //   }
  // })

//   filename: function (req, file, cb) {

//     const originalName = file.originalname;
//     const timestamp = Date.now();
//     const fileExtension = originalName.split('.').pop(); // Get the file extension
//     cb(null, `${timestamp}-${file.fieldname}.${fileExtension}`);
//   },
// });

// const upload = multer({ storage: storage })
app.get("/data", verifyToken, (req, res) => {
  res.render("data");
});


//multer db config starts

// const { ObjectID } = require('mongodb');


// const connection = mongoose.connection;

// let gfs;
// connection.once('open', () => {
//   gfs = Grid(conn.db, mongoose.mongo);
//   gfs.collection('uploads');
// });

// const storage = multer.memoryStorage();
// const upload = multer({ storage: storage });

// starting my old


// function uploadAndSaveToDatabase(req, res, next) {
//   upload.array('photu', 24)(req, res, function (err) {
//     if (err) {
//       // Handle any upload errors
//       return res.status(500).json({ error: 'File upload failed' });
//     }})};

    // Create a new document with file information from req.file


//     const { originalname, filename, path, size } = req.photu;
//     const fileData = {
//       originalname,
//       filename,
//       path,
//       size,
//       // Add other relevant fields as needed
//     };

//     File.create(fileData, function (err, photu) {
//       if (err) {
//         // Handle any database save errors
//         return res.status(500).json({ error: 'Database save failed' });
//       }

//       // File information saved successfully
//       res.json({ message: 'File uploaded and saved to the database!' });
//     });
//   });
// }


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

<<<<<<< HEAD
//  lolo
=======
app.get('/buy-now', async (req, res) => {
  const line_items = [
    {
      price_data: {
        currency: 'inr',  // Updated to INR
        product_data: {
          name: 'Advanced Professional Cerificate in Diabetes Management Course',
        },
        unit_amount: 637500, // price in paise (100 paise = 1 INR)
      },
      quantity: 1,
    },
  ];

  const session = await createCheckoutSession(line_items);
  console.log(session);  // Log the session object to inspect it
  if (session) {
    res.json({ id: session.id });
  } else {
    res.status(500).send('Error creating checkout session');
  }
});


app.get('/success', (req, res) => {
  res.send('Payment was successful!');
});

app.get('/cancel', (req, res) => {
  res.send('Payment was canceled.');
});

app.post('/webhook', async (req, res) => {
  const sig = req.headers['we_1Nr0A6SAfyNJyYlU3Tdt4lEg'];
  const endpointSecret = 'whsec_ur7gIFh1U4RWWmxvonmTnbh7b1DvsTPK';
  
  let event;
  
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event['type'] === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object; // contains payment details

    // Your existing script to handle successful payment
    const token = req.cookies.authToken;

    if (!token) {
      return res.status(401).send('Unauthorized: No token provided');
    }

    let userId;
    try {
      const decoded = jwt.verify(token, JWT_SECRET); // replace with your JWT secret
      userId = decoded.userId;
    } catch (error) {
      return res.status(401).send('Unauthorized: Invalid token');
    }

    try {
      const course = await Course.findById(paymentIntent.metadata.courseObjectId); // replace with how you're storing course ID in payment metadata
      if (!course) {
        return res.status(404).send('Course not found');
      }

      const courseName = course.title; // Assuming the course name is stored in the "title" field

      await User.findByIdAndUpdate(userId, {
        $addToSet: { coursesPurchased: courseName } // $addToSet ensures no duplicates
      });

      // Respond to Stripe to acknowledge receipt of the event
      res.json({ received: true });
    } catch (error) {
      console.error(error);
      res.status(500).send('Server Error');
    }
  } else {
    // Handle other event types
    res.status(200).end();
  }
});

>>>>>>> a9705a94ecd0e716ea4250e5abc82a74c252a0c6


// app.post("/data", uploadAndSaveToDatabase, (req, res) => {
//   // res.send("uploaded")
//   res.json({ message: 'File uploaded and saved to the database!' });
//   // console.log(req.file);

//   const writestream = gfs.createWriteStream({
//     filename: req.file.originalname,
//   });

//   writestream.on('close', (photu) => {
//     // return res.send(`File uploaded to MongoDB with id: ${file._id}`);
//     res.redirect("/data");
//   });

//   // Pipe the file data to MongoDB

//   writestream.write(req.file.buffer);
//   writestream.end();
//   console.log(error);
// });

// ...

// Configure Multer to handle multiple file uploads

// const storage = multer.memoryStorage();
// const upload = multer({ storage: storage });

// Define a route to upload multiple files

// app.post('/data', upload.array('files'), (req, res) => {
//   if (!req.files || req.files.length === 0) {
//     return res.status(400).send('No files uploaded.');
//   }

//   const uploadPromises = req.files.map((file) => {
//     return new Promise((resolve, reject) => {
//       // Create a writable stream to MongoDB
//       const writestream = gfs.createWriteStream({
//         filename: file.originalname,
//       });

//       writestream.on('close', (file) => {
//         resolve(`File uploaded to MongoDB with id: ${file._id}`);
//       });

//       writestream.on('error', (error) => {
//         reject(error);
//       });

//       // Pipe the file data to MongoDB
//       writestream.write(file.buffer);
//       writestream.end();
//     });
//   });

//   Promise.all(uploadPromises)
//     .then((results) => {
//       return res.send(results.join('\n'));
//     })
//     .catch((error) => {
//       return res.status(500).send(`Error uploading files: ${error.message}`);
//     });
// });

// ...

// new latest logic

// const storage = new GridFsStorage({
  const url = process.env.MONGODB_URI;
//   file: (req, file) => {
//     return {
//       filename: `${crypto.randomBytes(16).toString('hex')}${path.extname(file.originalname)}`,
//     };
//   },
// });
const storage = new GridFsStorage({ url });

const upload = multer({ storage });

// Define a route to handle file uploads
app.post('/data', upload.array('file',4), (req, res) => {
  return res.json({ message: 'File uploaded successfully to the database' });
  
});
app.use((err, req, res, next) => {
  if (err.name === 'UnauthorizedError') {
    res.redirect('/auth_email');
  }
});




app.listen(3000, function () {
  console.log("Server started successfully!");
});
setRoutes(app);
