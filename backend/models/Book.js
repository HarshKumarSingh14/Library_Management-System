const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    title: { type: String, required: true },
    author: { type: String, required: true },
    category: { type: String, default: '' },
    isbn: { type: String, default: '' },
    total_copies: { type: Number, required: true, default: 1 },
    available_copies: { type: Number, required: true, default: 1 },
    cover_image: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Book', bookSchema);