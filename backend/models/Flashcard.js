const mongoose = require('mongoose');   // loads mongoose library

// Flashcard schema
const flashcardSchema = new mongoose.Schema({
    question: { type: String, required: true },
    answer: { type: String, required: true },
    folder: { type: mongoose.Schema.Types.ObjectId, ref: 'Folder', required: true },
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
});
module.exports = mongoose.model('Flashcard', flashcardSchema);

