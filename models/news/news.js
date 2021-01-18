//Require Mongoose
const mongoose = require('mongoose');
//Define a schema
const NewsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  thumbnail: {
    type: String,
  },
  categoryID: {
    type: mongoose.Types.ObjectId,
  },
  description: {
    type: String,
    required: true
  },
  images: [
    {
      type: String
    }
  ],
  metaTags: [
    {
      type: String
    }
  ],  
  youtubeLink: {
    type: String
  },
  createdBy: {
    type: mongoose.Types.ObjectId,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date
  }
});

const News = mongoose.model('News', NewsSchema );
module.exports = News;