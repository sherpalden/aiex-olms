//Require Mongoose
const mongoose = require('mongoose');
//Define a schema
const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  parentID: {
    type: mongoose.Types.ObjectId,
  },
});

const NewsCategories = mongoose.model('News_Category', CategorySchema );
module.exports = NewsCategories;