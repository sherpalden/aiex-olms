const mongoose = require('mongoose')

const CourseSchema = new mongoose.Schema({
	title: { type: String, required: true },
	authors: [{ 
		firstName: {type: String},
		lastName: {type: String},
	}],
	categoryID: { type: mongoose.Types.ObjectId, required: true },
	level: { type: String },
	description: { type: Object, required: true },
	thumbnail: { type: String, required: true },
	files: [{ type: String }],
	createdAt: { type: Date, default: Date.now },
	updatedAt: { type: Date }
})

CourseSchema.index({title: "text"});
const Courses = mongoose.model('Course', CourseSchema)

module.exports = Courses