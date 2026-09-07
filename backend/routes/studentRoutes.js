const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const Transaction = require('../models/Transaction');
const { protect } = require('../middleware/authMiddleware'); 

// --- 1. GET ALL STUDENTS (With Year, Books & Fines) ---
router.get('/all', protect, async (req, res) => {
    try {
        const students = await Student.find({}).sort({ name: 1 }).lean();

        // Attach active_books and total_fine for each student (mimicking SQL subqueries)
        const studentsWithDetails = await Promise.all(
            students.map(async (student) => {
                const active_books = await Transaction.countDocuments({ 
                    student_id: student._id, 
                    status: 'issued' 
                });

                const fineData = await Transaction.aggregate([
                    { $match: { student_id: student._id } },
                    { $group: { _id: null, total: { $sum: '$fine_amount' } } }
                ]);
                const total_fine = fineData[0]?.total || 0;

                return {
                    ...student,
                    id: student._id, // Mapping _id to id for frontend compatibility
                    active_books,
                    total_fine
                };
            })
        );

        res.json(studentsWithDetails);
    } catch (err) {
        console.error("Fetch All Error:", err);
        res.status(500).json({ error: err.message });
    }
});

// --- 2. GET SINGLE STUDENT ---
router.get('/:id', protect, async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (!student) return res.status(404).json({ message: "Student not found" });

        const studentObj = student.toObject();
        studentObj.id = studentObj._id;

        res.json(studentObj);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- 3. UPDATE STUDENT DETAILS (Safely handle partial updates) ---
router.put('/:id', protect, async (req, res) => {
    const { id } = req.params;
    const { name, phone, course, branch, year } = req.body;

    try {
        // Build update object dynamically for only provided fields (similar to COALESCE behavior)
        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (phone !== undefined) updateData.phone = phone;
        if (course !== undefined) updateData.course = course;
        if (branch !== undefined) updateData.branch = branch;
        if (year !== undefined) updateData.year = year;

        const updatedStudent = await Student.findByIdAndUpdate(
            id, 
            { $set: updateData }, 
            { new: true, runValidators: true }
        );

        if (!updatedStudent) {
            return res.status(404).json({ message: "Student not found" });
        }
        
        res.json({ 
            message: "Student profile updated successfully"
        });
    } catch (err) {
        console.error("Update Error:", err);
        res.status(500).json({ error: "Failed to update student academic details" });
    }
});

// --- 4. DELETE STUDENT ACCOUNT ---
router.delete('/:id', protect, async (req, res) => {
    const studentId = req.params.id;

    try {
        const deletedStudent = await Student.findByIdAndDelete(studentId);
        
        if (!deletedStudent) return res.status(404).json({ message: "Student not found" });

        // Mimicking ON DELETE CASCADE: remove related transactions for this student
        await Transaction.deleteMany({ student_id: studentId });

        res.status(200).json({ message: "Account and data deleted successfully" });
    } catch (err) {
        console.error("Delete Student Error:", err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;