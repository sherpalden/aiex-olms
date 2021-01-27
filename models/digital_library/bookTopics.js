const mongoose = require('mongoose')

const BookTopicSchema = new mongoose.Schema({
	name: { type: String, required: true },
})

const BookTopics = mongoose.model('BookTopic', BookTopicSchema)

module.exports = BookTopics