const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");
const findOrCreate = require('mongoose-findorcreate');
const { Schema } = mongoose;

mongoose.connect(process.env.DB_URL);

const UserSchema = new Schema({
  name: String,
  username: String,
  email: String,
  password: String,
  googleId: String,
});

const CourseSchema = new Schema({
  title: String,
  price: String,
});



UserSchema.plugin(passportLocalMongoose, { usernameField: 'email' });
UserSchema.plugin(findOrCreate);

const User = mongoose.model('User', UserSchema);
const Course = mongoose.model('Course', CourseSchema);

module.exports = { mongoose, User, Course };
