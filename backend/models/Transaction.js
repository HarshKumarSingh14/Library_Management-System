const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    book_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
    fine_amount: { type: Number, default: 0 },
    status: { type: String, enum: ['pending', 'issued', 'returned', 'lost'], default: 'pending' },
    request_date: { type: Date, default: Date.now },
    issue_date: { type: Date },
    due_date: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);