const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");
const findOrCreate = require('mongoose-findorcreate');
const { Schema } = mongoose;

mongoose.connect("mongodb+srv://priyanshu:priyanshu@globalmedacademy.v6hvz4f.mongodb.net/?retryWrites=true&w=majority");

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


const FileSchema = new Schema({
  // originalname: String,
  name: String,
  path: String,
  size: Number,
})

const FileModel = mongoose.model('File',FileSchema);
const Request = mongoose.model('Request', requestSchema);

module.exports = { mongoose, User,FileModel,Request};
