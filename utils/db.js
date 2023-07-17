const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");
const findOrCreate = require('mongoose-findorcreate');

mongoose.connect(`${process.env.DB_URL}`);

const UserSchema = new mongoose.Schema({
  name: String,
  username:String,
  email: String,
  password: String,
  googleId: String
});

UserSchema.plugin(passportLocalMongoose, { usernameField: 'email' });
UserSchema.plugin(findOrCreate);
const User = mongoose.model("User", UserSchema);

module.exports = { mongoose, User };
