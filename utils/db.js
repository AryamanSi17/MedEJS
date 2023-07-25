const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");
const findOrCreate = require('mongoose-findorcreate');

mongoose.connect(`${process.env.DB_URL}`);

const UserSchema = new mongoose.Schema({
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
const User = mongoose.model("User", UserSchema);



module.exports = { mongoose, User };
