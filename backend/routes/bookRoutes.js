const express = require('express');
const router = express.Router();
const Book = require('../models/Book'); // Mongoose Book Model

// --- 1. SEARCH ROUTE (Library Books) ---
router.get('/search', async (req, res) => {
    const { q } = req.query;
    try {
        // Regex ka use karke case-insensitive search perform karenge title, author, ya category mein
        const searchRegex = new RegExp(q, 'i');
        const books = await Book.find({
            $or: [
                { title: searchRegex },
                { author: searchRegex },
                { category: searchRegex }
            ]
        }).sort({ title: 1 });
        
        res.json(books);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- 2. GET ALL LIBRARY BOOKS ---
router.get(['/', '/all'], async (req, res) => {
    try {
        const books = await Book.find({}).sort({ _id: -1 });
        
        // Dynamically generating the status for the frontend
        const processedRows = books.map(book => {
            const bookObj = book.toObject();
            return {
                ...bookObj,
                status: bookObj.available_copies > 0 ? 'available' : 'out_of_stock'
            };
        });
        
        res.json(processedRows);
    } catch (err) { 
        res.status(500).json({ error: err.message }); 
    }
});

// --- 3. ADD NEW LIBRARY BOOK ---
router.post('/', async (req, res) => {
    const { title, author, category, isbn, total_copies, available_copies, cover_image } = req.body;
    
    const initialAvailable = available_copies !== undefined ? available_copies : (total_copies || 1);
    const status = initialAvailable > 0 ? 'available' : 'out_of_stock';

    try {
        const newBook = await Book.create({
            title,
            author,
            category: category || '',
            isbn: isbn || '',
            total_copies: total_copies || 1,
            available_copies: initialAvailable,
            cover_image: cover_image || ''
        });

        res.status(201).json({ id: newBook._id, message: "Library Book added successfully", status });
    } catch (err) { 
        console.error("Add Book Error:", err);
        res.status(500).json({ error: err.message }); 
    }
});

// --- 4. UPDATE LIBRARY BOOK ---
router.put('/:id', async (req, res) => {
    const { title, author, category, isbn, total_copies, available_copies, cover_image } = req.body;

    try {
        const updatedBook = await Book.findByIdAndUpdate(
            req.params.id,
            {
                title,
                author,
                category: category || '',
                isbn: isbn || '',
                total_copies,
                available_copies,
                cover_image: cover_image || ''
            },
            { new: true }
        );

        if (!updatedBook) {
            return res.status(404).json({ error: "Book not found" });
        }

        res.json({ message: "Library Book updated successfully" });
    } catch (err) { 
        console.error("Update Book Error:", err);
        res.status(500).json({ error: err.message }); 
    }
});

// --- 5. DELETE LIBRARY BOOK ---
router.delete('/:id', async (req, res) => {
    try {
        const deletedBook = await Book.findByIdAndDelete(req.params.id);
        
        if (!deletedBook) {
            return res.status(404).json({ error: "Book not found" });
        }

        res.json({ message: "Library Book deleted" });
    } catch (err) { 
        res.status(500).json({ error: err.message }); 
    }
});

module.exports = router;