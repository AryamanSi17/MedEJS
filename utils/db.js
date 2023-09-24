const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");
const findOrCreate = require('mongoose-findorcreate');
const { Schema } = mongoose;

mongoose.connect(process.env.MONGODB_URI);

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
    coursesPurchased: [String],
    files: [{ type: Schema.Types.ObjectId, ref: 'File' }],

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


// const FileSchema = new Schema({
//   originalname: String,
//   name: String,
//   path: String,
//   size: Number,
// })
const FileSchema = new mongoose.Schema({
  originalname: String,
  filename: String,
  path: String,
  size: Number,
  contentType: String,
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
});

const File = mongoose.model('File',FileSchema);
const Request = mongoose.model('Request', requestSchema);

module.exports = { mongoose,File,User,Request, Course};
