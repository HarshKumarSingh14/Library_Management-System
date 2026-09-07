const mongoose = require('mongoose');

const storeBookSchema = new mongoose.Schema({
    title: { type: String, required: true },
    author: { type: String, required: true },
    marketPrice: { type: Number, required: true, default: 0 },
    ourPrice: { type: Number, required: true, default: 0 },
    stockForSale: { type: Number, required: true, default: 0 },
    availableCopies: { type: Number, required: true, default: 0 },
    coverImage: { type: String, default: "" }
}, { timestamps: true });

module.exports = mongoose.model('StoreBook', storeBookSchema);