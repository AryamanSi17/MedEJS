const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");
const findOrCreate = require('mongoose-findorcreate');
const { Schema } = mongoose;

mongoose.connect(process.env.MONGODB_URI);

const courseSchema = new mongoose.Schema({
  courseID: String,
  name: String,
  currentPrice: Number,
  discountedPrice: Number,
  currency: String,
  imagePath: String,
  courseDetailLink: String,
  duration: String,
  description: String,
  logos: [{ src: String, alt: String }],
  category: String
});

const Course = mongoose.model('Course', courseSchema);

const UserSchema = new Schema({
  fullname: String,
  username: String,
  password: String,
  googleId: String,
  enrollmentNumber: Number,
    // Add form data fields for handling form submissions
    name: String,
    phone: String,
    email: {type : String,unique:true},
    course: String,
    coursesPurchased: [String],
    uploadedFiles: [
      {
        url: String, // URL of the uploaded file
        title: String // Title of the file
      },
    ],
    mciNumber: String,
    address: String,
    idNumber: String,
    ipAddress: String, 
    enrollmentNumber: String,
    referrals: [
      {
          friendMobile: String,
          friendName: String,
          recommendedCourse: String,
      },
  ],
  resetPasswordToken: String,
  resetPasswordExpires: Date,
});

// UserSchema.plugin(passportLocalMongoose, {
//   usernameField: "email"
// });

// UserSchema.plugin(findOrCreate);
// Define a Mongoose Schema for handling form submissions
const requestSchema = new mongoose.Schema({
  name: String,
  phone: String,
  email: String,
  course: String,
});

const User = mongoose.model('User', UserSchema);


const FileSchema = new Schema({
  originalname: String,
  name: String,
  path: String,
  size: Number,
  userId : {type : Schema.Types.ObjectId, ref:'User' },
});

const File = mongoose.model('File',FileSchema);
const sessionSchema = new mongoose.Schema({
  sessionId: String,
  courseID: String,
});
const UserSessionSchema = new mongoose.Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  token: { type: String, required: true },
  ipAddress: { type: String, required: true },
  userAgent: { type: String, required: true }, // Add this line
});
const instructorApplicationSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  city: String,
  country: String,
  graduationDegree: String,
  specialization: String,
  lastDegree: String,
  medicalCollege: String,
  interestIn: String,
  email: String,
  mobile: Number,
  // Add other fields as needed
});

const InstructorApplication = mongoose.model('InstructorApplication', instructorApplicationSchema);

const UserSession = mongoose.model('UserSession', UserSessionSchema);
const Session = mongoose.model('Session', sessionSchema);
const Request = mongoose.model('Request', requestSchema);

const transactionSchema = new mongoose.Schema({
  transactionId: String, // Unique ID for the transaction, could be from the payment gateway
  userId: { type: Schema.Types.ObjectId, ref: 'User' }, // Reference to the User who made the transaction
  courseName: String, // Name of the course purchased
  amount: Number, // Amount of the transaction
  currency: String, // Currency of the transaction
  status: String, // Status of the transaction (e.g., pending, completed, failed)
  createdAt: { type: Date, default: Date.now }, // Timestamp of when the transaction was created
  // Add other fields as necessary, such as payment gateway specific data
});
const NonMoodleUserSchema = new Schema({
  fullname: String,
  username: { type: String, unique: true, required: true },
  number: String,
  coursesIntrested: [String],
  uploadedFiles: [
    {
      url: String,
      title: String
    }
  ],
  // Include any other fields you find necessary
});
const userInterestSchema = new mongoose.Schema({
  name: String,
  phone: String,
  email: String,
  city: String,
  education: String,
  courseInterested: String,
  country: String
});
const guestCheckoutSchema = new mongoose.Schema({
  name: String,
  email: String,
  phoneNumber: String,
  coursePurchased: [{
    courseID: String,
    courseName: String,
    transactionId: String,
    amount: Number,
    currency: String,
    purchaseDate: { type: Date, default: Date.now },
    status: { type: String, default: 'pending' } // e.g., 'pending', 'completed'
  }],
  uploadedFiles: [{ // Added to handle document uploads
    url: String,
    title: String
  }]
});

const GuestCheckout = mongoose.model('GuestCheckout', guestCheckoutSchema);
const UserInterest = mongoose.model('UserInterest', userInterestSchema);

const Transaction = mongoose.model('Transaction', transactionSchema);

const NonMoodleUser = mongoose.model('NonMoodleUser', NonMoodleUserSchema);

// Export the new model along with others
module.exports = { mongoose, Course, User, File, Request, Session, UserSession, InstructorApplication, Transaction, NonMoodleUser, UserInterest,GuestCheckout };