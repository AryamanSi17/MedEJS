const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");
const findOrCreate = require('mongoose-findorcreate');
const { Schema } = mongoose;

mongoose.connect(process.env.DB_URL);

const UserSchema = new Schema({
  fullname: String,
  username: String,
  password: String,
  googleId: String,
});

// UserSchema.plugin(passportLocalMongoose, {
//   usernameField : "email"});
// UserSchema.plugin(findOrCreate);

const User = mongoose.model('User', UserSchema);

const FileSchema = new Schema({
  // originalname: String,
  name: String,
  path: String,
  size: Number,
})

const FileModel = mongoose.model('File',FileSchema);


module.exports = { mongoose, User,FileModel};