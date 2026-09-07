const mongoose = require('mongoose');

const storeOrderSchema = new mongoose.Schema({
    orderId: { type: String, required: true, unique: true },
    studentId: { type: String, required: true },
    studentName: { type: String, required: true },
    studentEmail: { type: String, required: true },
    bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'StoreBook', required: true },
    bookTitle: { type: String, required: true },
    amount: { type: Number, required: true },
    status: { type: String, default: 'Delivered' },
    paymentStatus: { type: String, default: 'Success' }
}, { timestamps: true });

module.exports = mongoose.model('StoreOrder', storeOrderSchema);