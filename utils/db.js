const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");
const findOrCreate = require('mongoose-findorcreate');
const { Schema } = mongoose;

mongoose.connect(process.env.DB_URL);

const UserSchema = new Schema({
  name: String,
  email: { type: String, unique: true },
  username: { type: String, unique: true },
  password: String,
  googleId: String,
  password: String,
  otp: String,
  otpExpiresAt: Date,
  isVerified: { type: Boolean, default: false }
});



UserSchema.plugin(passportLocalMongoose, { usernameField: 'email', });
UserSchema.plugin(findOrCreate);



module.exports = { mongoose, User };
