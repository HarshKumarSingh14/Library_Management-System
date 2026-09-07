const express = require('express');
const router = express.Router();
const Book = require('../models/Book');
const Student = require('../models/Student');
const Transaction = require('../models/Transaction');

// --- 1. ADMIN DASHBOARD STATS (Pehle rakhein taaki '/admin' ko Express parameter na samajh le) ---
router.get('/admin', async (req, res) => {
    try {
        const currentDate = new Date();

        const totalBooks = await Book.countDocuments();
        const totalStudents = await Student.countDocuments();
        const activeIssues = await Transaction.countDocuments({ status: 'issued' });
        const pendingRequests = await Transaction.countDocuments({ status: 'pending' });
        
        const overdueCount = await Transaction.countDocuments({ 
            status: 'issued', 
            due_date: { $lt: currentDate } 
        });
        
        const rawRecentTransactions = await Transaction.find({})
            .populate('book_id', 'title')
            .populate('student_id', 'name')
            .sort({ request_date: -1, issue_date: -1 })
            .limit(5);

        const recentTransactions = rawRecentTransactions.map(t => ({
            id: t._id,
            status: t.status,
            issue_date: t.issue_date,
            request_date: t.request_date,
            book_title: t.book_id ? t.book_id.title : 'Unknown',
            student_name: t.student_id ? t.student_id.name : 'Unknown'
        }));

        res.json({
            totalBooks,
            totalStudents,
            activeIssues,
            pendingRequests,
            overdueCount,
            recentTransactions
        });
    } catch (err) {
        console.error("Admin Dashboard Error:", err);
        res.status(500).json({ error: err.message });
    }
});

// --- 2. STUDENT DASHBOARD STATS ---
router.get('/student/:id', async (req, res) => {
    const studentId = req.params.id;
    try {
        const currentDate = new Date();

        const issuedCount = await Transaction.countDocuments({ student_id: studentId, status: 'issued' });
        
        const overdueCount = await Transaction.countDocuments({ 
            student_id: studentId, 
            status: 'issued', 
            due_date: { $lt: currentDate } 
        });

        const pendingCount = await Transaction.countDocuments({ student_id: studentId, status: 'pending' });

        const rawPendingRequests = await Transaction.find({ student_id: studentId, status: 'pending' })
            .populate('book_id', 'title')
            .sort({ request_date: -1 });

        const pendingRequests = rawPendingRequests.map(t => ({
            id: t._id,
            request_date: t.request_date,
            title: t.book_id ? t.book_id.title : 'Unknown Book'
        }));

        const rawTransactions = await Transaction.find({ 
            student_id: studentId, 
            status: { $in: ['issued', 'returned'] } 
        })
        .populate('book_id', 'title author')
        .sort({ issue_date: -1 });

        const myBooks = rawTransactions.map(t => {
            let current_fine = 0;
            if (t.status === 'issued' && t.due_date && currentDate > new Date(t.due_date)) {
                const diffTime = Math.abs(currentDate - new Date(t.due_date));
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                current_fine = diffDays * 10; 
            }

            return {
                id: t._id,
                book_id: t.book_id?._id,
                title: t.book_id?.title || 'Unknown',
                author: t.book_id?.author || 'Unknown',
                issue_date: t.issue_date,
                due_date: t.due_date,
                status: t.status,
                paid_fine: t.fine_amount || 0,
                current_fine: current_fine
            };
        });

        const totalFine = myBooks.reduce((sum, book) => {
            const calculated = parseInt(book.current_fine) || 0;
            const existing = parseInt(book.paid_fine) || 0;
            return sum + calculated + existing;
        }, 0);

        res.json({
            issuedCount,
            overdueCount,
            pendingCount,
            totalFine,
            activeBooks: myBooks,
            pendingRequests
        });

    } catch (err) {
        console.error("Student Dashboard Error:", err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;