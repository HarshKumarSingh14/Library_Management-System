const Book = require('../models/BookModel');
const Student = require('../models/Student');
const Transaction = require('../models/Transaction');

exports.getAdminDashboard = async (req, res) => {
    try {
        const totalBooks = await Book.countDocuments();
        const totalStudents = await Student.countDocuments({ isVerified: true });
        const activeIssues = await Transaction.countDocuments({ status: 'issued' });
        const pendingRequests = await Transaction.countDocuments({ status: 'pending' });

        const recentTransactions = await Transaction.find()
            .sort({ createdAt: -1 })
            .limit(10)
            .populate('book', 'title')
            .populate('student', 'name');

        const formattedTransactions = recentTransactions.map(t => ({
            id: t._id,
            book_title: t.book ? t.book.title : 'Unknown Book',
            student_name: t.student ? t.student.name : 'Unknown Student',
            issue_date: t.issueDate || null,
            request_date: t.createdAt,
            status: t.status
        }));

        res.status(200).json({
            totalBooks,
            totalStudents,
            activeIssues,
            pendingRequests,
            recentTransactions: formattedTransactions
        });
    } catch (error) {
        console.error("Dashboard Error:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};