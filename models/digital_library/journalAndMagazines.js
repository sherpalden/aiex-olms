const mongoose = require('mongoose')

const JournalAndMagazineSchema = new mongoose.Schema({
	title: { type: String, required: true },
	authors: [{ 
		firstName: {type: String},
		lastName: {type: String},
	}],
	category: { type: String, required: true},
	noOfPages: { type: Number},
	categoryID: { type: mongoose.Types.ObjectId, required: true },
	abstract: { type: Object, required: true },
	keywords: [{ type: String }],
	youtubeLinks: [{ type: String }],
	publisher: { type: String, required: true },
	edition: { type: String, required: true },
	publicationDate: { type: Date, required: true },
	doi: { type: String},
	thumbnail: { type: String, required: true },
	files: [{ type: String }],
	createdAt: { type: Date, default: Date.now },
	updatedAt: { type: Date }
})

JournalAndMagazineSchema.index({title: "text"});
const JournalAndMagazines = mongoose.model('Journal_Magazine', JournalAndMagazineSchema)

module.exports = JournalAndMagazines