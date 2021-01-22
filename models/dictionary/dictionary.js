const mongoose = require('mongoose');

const DictionarySchema = new mongoose.Schema({
	keyword: {
		type: String,
		required: true
	},
	description: {
		type: String,
		required: true
	},
	relatedWords: [
		{
			type: String
		}
	],
	images: [
		{
			type: String
		}
	],
	youtubeLinks: [
		{
			type: String
		}
	],
	createdAt: {
		type: Date,
		default: Date.now
	},
	updatedAt: {
		type: Date,
	}
})

DictionarySchema.index({fullName: "text", description: "text"});
const Dictionary = mongoose.model('Dictionary', DictionarySchema);
module.exports = Dictionary;