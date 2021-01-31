//Require Mongoose
const mongoose = require('mongoose');
//Define a schema
const BookCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  parentID: {
    type: mongoose.Types.ObjectId,
  },
});

const BookCategories = mongoose.model('Book_Category', BookCategorySchema );
module.exports = BookCategories;