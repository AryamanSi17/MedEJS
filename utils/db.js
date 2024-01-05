const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");
const findOrCreate = require('mongoose-findorcreate');
const { Schema } = mongoose;

mongoose.connect(process.env.MONGODB_URI);

const courseSchema = new mongoose.Schema({
  courseID: String,
  name: String,
  realPrice: Number,
  discountedPrice: Number,
  currency: String
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
    email: String,
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

module.exports = { mongoose, User, File, Request, Course, Session,UserSession,InstructorApplication };