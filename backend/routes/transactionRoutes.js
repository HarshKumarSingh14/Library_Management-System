const express = require('express');
const router = express.Router();
const Book = require('../models/Book');
const Student = require('../models/Student');
const Transaction = require('../models/Transaction');

// ==========================================
//  SECTION A: ADMIN MANUAL OPERATIONS
// ==========================================

// --- 1. ADMIN DIRECT ISSUE BOOK ---
router.post('/issue', async (req, res) => {
    const { book_id, student_id, due_date } = req.body; 

    console.log("➡️ Admin Issue Request Data:", req.body);

    if (!book_id || !student_id || !due_date) {
        return res.status(400).json({ error: "Book ID, Student ID, and Due Date are required!" });
    }

    try {
        // Check if student exists in DB
        const student = await Student.findById(student_id);
        if (!student) {
            return res.status(404).json({ error: `Student with ID ${student_id} does not exist in the database!` });
        }

        // Check book stock
        const book = await Book.findById(book_id);
        if (!book) {
            return res.status(404).json({ error: "Book not found in the library." });
        }

        if (book.available_copies <= 0) {
            return res.status(400).json({ error: "Book is currently out of stock!" });
        }

        // 1. Create Transaction
        await Transaction.create({
            book_id,
            student_id,
            issue_date: new Date(),
            due_date: new Date(due_date),
            status: 'issued',
            request_date: new Date()
        });

        // 2. Decrease Stock
        book.available_copies = Math.max(0, book.available_copies - 1);
        await book.save();

        res.status(201).json({ message: "Book issued successfully!" });

    } catch (err) {
        console.error("❌ Issue Error:", err.message);
        res.status(500).json({ error: "Failed to issue book." });
    }
});

// --- 2. GET ACTIVE TRANSACTIONS ---
router.get('/active', async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const transactions = await Transaction.find({ status: 'issued' })
            .populate('book_id', 'title author')
            .populate('student_id', 'name username')
            .sort({ due_date: 1 });

        const rows = transactions.map(t => {
            let calculated_fine = 0;
            if (t.due_date) {
                const dueDate = new Date(t.due_date);
                dueDate.setHours(0, 0, 0, 0);
                if (today > dueDate) {
                    const diffTime = Math.abs(today - dueDate);
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    calculated_fine = diffDays * 10;
                }
            }

            return {
                transaction_id: t._id,
                book_id: t.book_id?._id,
                student_id: t.student_id?._id,
                issue_date: t.issue_date,
                due_date: t.due_date,
                book_title: t.book_id?.title || 'Unknown',
                author: t.book_id?.author || 'Unknown',
                student_name: t.student_id?.name || 'Unknown',
                roll_no: t.student_id?.username || 'Unknown',
                calculated_fine
            };
        });

        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
//  SECTION B: STUDENT REQUEST FLOW
// ==========================================

// --- 3. STUDENT REQUEST BOOK ---
router.post('/request', async (req, res) => {
    const bookId = req.body.bookId || req.body.book_id;
    const studentId = req.body.studentId || req.body.userId || req.body.student_id; 

    console.log("➡️ Student Request Data:", req.body);
    console.log(`➡️ Extracted IDs -> Book: ${bookId}, Student: ${studentId}`);

    if (!bookId || !studentId) {
        return res.status(400).json({ error: "Book ID and Student ID are required!" });
    }

    try {
        const studentCheck = await Student.findById(studentId);
        if (!studentCheck) {
            return res.status(404).json({ error: `Your account (ID: ${studentId}) was not found in database. Please log out and log in again.` });
        }

        const book = await Book.findById(bookId);
        if (!book) return res.status(404).json({ error: "Book not found in library!" });
        if (book.available_copies <= 0) return res.status(400).json({ error: "Book is currently out of stock!" });

        const existing = await Transaction.findOne({ 
            student_id: studentId, 
            book_id: bookId, 
            status: 'pending' 
        });
        
        if (existing) return res.status(400).json({ error: "Your request for this book is already pending." });

        await Transaction.create({
            book_id: bookId,
            student_id: studentId,
            status: 'pending',
            request_date: new Date()
        });
        
        res.status(201).json({ message: "Book request sent to admin successfully!" });
    } catch (err) {
        console.error("❌ TRANSACTION REQUEST ERROR:", err);
        res.status(500).json({ error: `Database Error: ${err.message}` });
    }
});

// --- 4. GET PENDING REQUESTS ---
router.get('/pending', async (req, res) => {
    try {
        const transactions = await Transaction.find({ status: 'pending' })
            .populate('book_id', 'title')
            .populate('student_id', 'name')
            .sort({ request_date: 1 });

        const rows = transactions.map(t => ({
            id: t._id,
            request_date: t.request_date,
            book_title: t.book_id?.title || 'Unknown',
            user_name: t.student_id?.name || 'Unknown'
        }));

        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- 5. APPROVE REQUEST ---
router.put("/approve", async (req, res) => {
    const { transactionId } = req.body;
    const daysAllowed = 7; 
    const issueDate = new Date();
    const dueDate = new Date();
    dueDate.setDate(issueDate.getDate() + daysAllowed);

    try {
        const transaction = await Transaction.findOneAndUpdate(
            { _id: transactionId, status: 'pending' },
            { status: 'issued', issue_date: issueDate, due_date: dueDate },
            { new: true }
        );

        if (!transaction) {
            return res.status(400).json({ message: "Invalid request or already processed" });
        }

        const book = await Book.findById(transaction.book_id);
        if (book) {
            book.available_copies = Math.max(0, book.available_copies - 1);
            await book.save();
        }

        res.status(200).json({ message: "Approved successfully!" });
    } catch (error) {
        console.error("Approval Error:", error);
        res.status(500).json({ message: "Database error during approval" });
    }
});

// --- 6. REJECT REQUEST ---
router.put("/reject", async (req, res) => {
    const { transactionId } = req.body;
    try {
        const transaction = await Transaction.findOneAndUpdate(
            { _id: transactionId, status: 'pending' },
            { status: 'rejected' },
            { new: true }
        );
        if (!transaction) return res.status(400).json({ message: "Invalid request" });
        res.status(200).json({ message: "Rejected" });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

// ==========================================
//  SECTION C: COMMON OPERATIONS
// ==========================================

// --- 7. RETURN BOOK ---
router.post('/return', async (req, res) => {
    const { transaction_id, book_id } = req.body;

    try {
        const tx = await Transaction.findOne({ _id: transaction_id, status: 'issued' });
        if (!tx) {
            return res.status(404).json({ error: "No active record found" });
        }

        const dueDate = new Date(tx.due_date);
        const today = new Date();
        today.setHours(0,0,0,0);
        dueDate.setHours(0,0,0,0);

        let fine = 0;
        if (today > dueDate) {
            const diffTime = Math.abs(today - dueDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
            fine = diffDays * 10;
        }

        tx.return_date = new Date();
        tx.fine_amount = fine;
        tx.status = 'returned';
        await tx.save();

        const book = await Book.findById(book_id || tx.book_id);
        if (book) {
            book.available_copies += 1;
            await book.save();
        }

        res.json({ message: "Returned successfully", fine });
    } catch (err) {
        console.error("Return Error:", err);
        res.status(500).json({ error: "Return failed" });
    }
});

// --- 8. STUDENT HISTORY ---
router.get('/student/:id', async (req, res) => {
    const studentId = req.params.id;
    try {
        const transactions = await Transaction.find({ student_id: studentId })
            .populate('book_id', 'title')
            .sort({ request_date: -1, issue_date: -1 });

        const rows = transactions.map(t => ({
            id: t._id,
            issue_date: t.issue_date,
            due_date: t.due_date,
            return_date: t.return_date,
            fine_amount: t.fine_amount,
            status: t.status,
            request_date: t.request_date,
            title: t.book_id?.title || 'Unknown'
        }));

        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: "History error" });
    }
});

// --- 9. REPORTS SUMMARY ---
router.get('/reports/summary', async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const transactions = await Transaction.find({ status: 'issued' })
            .populate('book_id', 'title')
            .populate('student_id', 'name')
            .sort({ due_date: 1 });

        const rows = transactions.map(t => {
            let days_overdue = 0;
            let fine = 0;

            if (t.due_date) {
                const dueDate = new Date(t.due_date);
                dueDate.setHours(0, 0, 0, 0);
                if (today > dueDate) {
                    const diffTime = Math.abs(today - dueDate);
                    days_overdue = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    fine = days_overdue * 10;
                }
            }

            return {
                id: t._id,
                book_id: t.book_id?._id,
                student_id: t.student_id?._id,
                issue_date: t.issue_date,
                due_date: t.due_date,
                book_title: t.book_id?.title || 'Unknown',
                student_name: t.student_id?.name || 'Unknown',
                days_overdue,
                fine
            };
        });

        // Sort descending by days_overdue, then ascending by due_date
        rows.sort((a, b) => {
            if (b.days_overdue !== a.days_overdue) {
                return b.days_overdue - a.days_overdue;
            }
            return new Date(a.due_date) - new Date(b.due_date);
        });

        res.json(rows);
    } catch (err) {
        console.error("Reports Error:", err);
        res.status(500).json({ message: "Failed to generate report" });
    }
});

module.exports = router;