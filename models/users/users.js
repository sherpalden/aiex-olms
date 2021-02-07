//Require Mongoose
const mongoose = require('mongoose');
//Define a schema
const UserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  fullName: {
    type: String,
    required: true
  },
  email: {
  	type: String,
  	required: true,
    unique: true,
  },
  profilePic: {
    type: String,
  },
  gender: {
    type: String,
  },
  socialLinks: {
    facebook: {type: String},
    instagram: {type: String},
    twitter: {type: String},
    linkedin: {type: String},
  },
  about: {
    type: String
  }
});

const Users = mongoose.model('User', UserSchema );
module.exports = Users;