const mongoose = require('mongoose')

const BookSchema = new mongoose.Schema({
	title: { type: String, required: true },
	authors: [{ 
		firstName: {type: String},
		lastName: {type: String},
		fullName: {type: String}
	}],
	topicID: { type: mongoose.Types.ObjectId, required: true },
	publisher: { type: String, required: true },
	abstract: { type: String, required: true },
	edition: { type: String, required: true },
	publicationDate: { type: Date, required: true },
	isbn: { type: String, required: true },
	doi: { type: String, required: true},
	thumbnail: { type: String, required: true },
	pdf: { type: String, required: true },
	createdAt: { type: Date, default: Date.now },
	updatedAt: { type: Date }
})

const Books = mongoose.model('Book', BookSchema)

module.exports = Books