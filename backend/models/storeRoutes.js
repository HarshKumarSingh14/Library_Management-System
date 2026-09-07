// const express = require('express');
// const router = express.Router();
// const db = require('../db'); // Database connection import kiya

// // 1. GET ALL BOOKS (Read)
// router.get('/books', async (req, res) => {
//   try {
//     // "id AS _id" use kiya taaki React frontend me bina kisi change ke chal jaye
//     const [books] = await db.query('SELECT id AS _id, title, author, marketPrice, ourPrice, stockForSale, availableCopies, coverImage FROM StoreBooks ORDER BY createdAt DESC');
//     res.status(200).json(books);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, error: "Failed to fetch books" });
//   }
// });

// // 2. ADD NEW BOOK (Create)
// router.post('/books', async (req, res) => {
//   try {
//     const { title, author, marketPrice, ourPrice, stockForSale, availableCopies, coverImage } = req.body;

//     const query = `INSERT INTO StoreBooks (title, author, marketPrice, ourPrice, stockForSale, availableCopies, coverImage) VALUES (?, ?, ?, ?, ?, ?, ?)`;
//     const values = [title, author, marketPrice, ourPrice, stockForSale, availableCopies, coverImage || ""];

//     await db.query(query, values);
    
//     res.status(201).json({ success: true, message: "Book added successfully!" });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, error: "Failed to add book" });
//   }
// });

// // 3. UPDATE BOOK (Update)
// router.put('/books/:id', async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { title, author, marketPrice, ourPrice, stockForSale, availableCopies, coverImage } = req.body;

//     const query = `UPDATE StoreBooks SET title=?, author=?, marketPrice=?, ourPrice=?, stockForSale=?, availableCopies=?, coverImage=? WHERE id=?`;
//     const values = [title, author, marketPrice, ourPrice, stockForSale, availableCopies, coverImage || "", id];

//     const [result] = await db.query(query, values);

//     if (result.affectedRows === 0) {
//       return res.status(404).json({ success: false, error: "Book not found" });
//     }

//     res.status(200).json({ success: true, message: "Book updated successfully!" });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, error: "Failed to update book" });
//   }
// });

// // 4. DELETE BOOK (Delete)
// router.delete('/books/:id', async (req, res) => {
//   try {
//     const { id } = req.params;
    
//     const [result] = await db.query('DELETE FROM StoreBooks WHERE id=?', [id]);
    
//     if (result.affectedRows === 0) {
//       return res.status(404).json({ success: false, error: "Book not found" });
//     }

//     res.status(200).json({ success: true, message: "Book deleted successfully!" });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, error: "Failed to delete book" });
//   }
// });

// module.exports = router;


const express = require('express');
const router = express.Router();
const StoreBook = require('../models/StoreBook');
const StoreOrder = require('../models/StoreOrder');

// ==========================================
// 1. INVENTORY MANAGEMENT ROUTES (Admin)
// ==========================================

// GET ALL BOOKS
router.get('/books', async (req, res) => {
  try {
    const books = await StoreBook.find({}).sort({ createdAt: -1 });
    res.status(200).json(books);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Failed to fetch books" });
  }
});

// ADD NEW BOOK
router.post('/books', async (req, res) => {
  try {
    const { title, author, marketPrice, ourPrice, stockForSale, availableCopies, coverImage } = req.body;
    
    await StoreBook.create({
      title,
      author,
      marketPrice,
      ourPrice,
      stockForSale,
      availableCopies,
      coverImage: coverImage || ""
    });

    res.status(201).json({ success: true, message: "Book added successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Failed to add book" });
  }
});

// UPDATE BOOK
router.put('/books/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, author, marketPrice, ourPrice, stockForSale, availableCopies, coverImage } = req.body;
    
    const updatedBook = await StoreBook.findByIdAndUpdate(
      id, 
      { title, author, marketPrice, ourPrice, stockForSale, availableCopies, coverImage: coverImage || "" },
      { new: true }
    );

    if (!updatedBook) return res.status(404).json({ success: false, error: "Book not found" });

    res.status(200).json({ success: true, message: "Book updated successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Failed to update book" });
  }
});

// DELETE BOOK
router.delete('/books/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedBook = await StoreBook.findByIdAndDelete(id);
    
    if (!deletedBook) return res.status(404).json({ success: false, error: "Book not found" });

    res.status(200).json({ success: true, message: "Book deleted successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Failed to delete book" });
  }
});


// ==========================================
// 2. ORDER & PAYMENT ROUTES (E-Commerce)
// ==========================================

// SIMULATED CHECKOUT (Fake Payment Flow)
router.post('/checkout', async (req, res) => {
  try {
    const { studentId, studentName, studentEmail, bookId, bookTitle, amount } = req.body;

    // Step 1: Check if the book exists and is in stock
    const book = await StoreBook.findById(bookId);
    if (!book) {
      return res.status(404).json({ success: false, error: "Book not found in store." });
    }
    
    if (book.stockForSale <= 0) {
      return res.status(400).json({ success: false, error: "Sorry, this book is currently Out of Stock!" });
    }

    // Step 2: Generate a Fake Order ID
    const orderId = `ORD-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

    // Step 3: Insert Order into Database
    await StoreOrder.create({
      orderId,
      studentId,
      studentName,
      studentEmail,
      bookId,
      bookTitle,
      amount,
      status: 'Delivered',
      paymentStatus: 'Success'
    });

    // Step 4: Decrease the Book's Stock
    book.stockForSale -= 1;
    await book.save();

    res.status(200).json({ 
      success: true, 
      message: "Payment Successful! Order Placed.",
      orderId: orderId 
    });

  } catch (error) {
    console.error("Checkout Error:", error);
    res.status(500).json({ success: false, error: "Checkout process failed." });
  }
});

// GET PURCHASE HISTORY
router.get('/orders', async (req, res) => {
  try {
    const { email } = req.query;
    let query = {};

    if (email) {
      query = { studentEmail: email };
    }

    const orders = await StoreOrder.find(query).sort({ createdAt: -1 });
    res.status(200).json(orders);

  } catch (error) {
    console.error("Order Fetch Error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch order history." });
  }
});

module.exports = router;