//Require Mongoose
const mongoose = require('mongoose');
//Define a schema
const CourseCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  parentID: {
    type: mongoose.Types.ObjectId,
  },
});

const CourseCategories = mongoose.model('Course_Category', CourseCategorySchema );
module.exports = CourseCategories;