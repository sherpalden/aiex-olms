const mongoose = require('mongoose')

const JournalMagazineSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  parentID: {
    type: mongoose.Types.ObjectId,
  },
})

const JournalMagazines = mongoose.model('Journal_Magazine_Category', JournalMagazineSchema)

module.exports = JournalMagazines