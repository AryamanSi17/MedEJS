const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");
const findOrCreate = require('mongoose-findorcreate');
const { Schema } = mongoose;

mongoose.connect(process.env.DB_URL);

const courseSchema = new mongoose.Schema({
  title: String,
  price: String,
  // Add other fields as needed
});

const Course = mongoose.model('Course', courseSchema);

const UserSchema = new Schema({
  fullname: String,
  username: String,
  password: String,
  googleId: String,
    // Add form data fields for handling form submissions
    name: String,
    phone: String,
    email: String,
    course: String,
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

// Create a Mongoose Model for handling form submissions based on the defined schema
const Request = mongoose.model('Request', requestSchema);

module.exports = { Course, User, Request };
