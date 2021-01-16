//Require Mongoose
const mongoose = require('mongoose');
//Define a schema
const AdminSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  email: {
  	type: String,
  	required: true,
    unique: true,
  },
  role: {
    type: String,
  },
  password: {
  	type: String,
  },
  isVerified: {
    type: Boolean, default: false
  }
});

const Admins = mongoose.model('Admin', AdminSchema );
module.exports = Admins;