const express = require('express');
const router = express.Router();
const StoreBook = require('../models/StoreBook');
const StoreOrder = require('../models/StoreOrder');

// ==========================================
// 1. ADMIN: MANAGE STORE INVENTORY
// ==========================================

// 1. GET: Fetch All Store Books
router.get("/books", async (req, res) => {
  try {
    const books = await StoreBook.find({}).sort({ _id: -1 });

    const formattedBooks = books.map(book => ({
      _id: book._id.toString(),
      title: book.title || "Unknown",
      author: book.author || "Unknown",
      coverImage: book.coverImage || "",
      marketPrice: Number(book.marketPrice) || 0,
      ourPrice: Number(book.ourPrice) || 0,
      stockForSale: Number(book.stockForSale) || 0,
      availableCopies: Number(book.availableCopies) || 0
    }));

    res.json(formattedBooks);
  } catch (error) {
    console.error("🔥 GET /store/books ERROR:", error.message);
    res.status(500).json({ error: `Backend Error: ${error.message}` }); 
  }
});

// 2. POST: Add New Book to Store
router.post("/books", async (req, res) => {
  try {
    const { title, author, coverImage, marketPrice, ourPrice, stockForSale, availableCopies } = req.body;

    const newBook = await StoreBook.create({
      title,
      author,
      coverImage: coverImage || "",
      marketPrice: marketPrice || 0,
      ourPrice: ourPrice || 0,
      stockForSale: stockForSale || 0,
      availableCopies: availableCopies || 0
    });

    res.status(201).json({ success: true, message: "Book added to store!", bookId: newBook._id });
  } catch (error) {
    console.error("🔥 POST /store/books ERROR:", error.message);
    res.status(500).json({ error: `Backend Error: ${error.message}` });
  }
});

// 3. PUT: Edit Store Book
router.put("/books/:id", async (req, res) => {
  try {
    const bookId = req.params.id;
    const { title, author, coverImage, marketPrice, ourPrice, stockForSale, availableCopies } = req.body;

    const updatedBook = await StoreBook.findByIdAndUpdate(
      bookId,
      { title, author, coverImage, marketPrice, ourPrice, stockForSale, availableCopies },
      { new: true }
    );

    if (!updatedBook) {
      return res.status(404).json({ success: false, error: "Book not found" });
    }

    res.json({ success: true, message: "Store book updated successfully!" });
  } catch (error) {
    console.error("🔥 PUT /store/books ERROR:", error.message);
    res.status(500).json({ error: `Backend Error: ${error.message}` });
  }
});

// 4. DELETE: Remove Book from Store
router.delete("/books/:id", async (req, res) => {
  try {
    const bookId = req.params.id;
    const deletedBook = await StoreBook.findByIdAndDelete(bookId);
    
    if (!deletedBook) {
      return res.status(404).json({ success: false, error: "Book not found" });
    }

    res.json({ success: true, message: "Book deleted from store!" });
  } catch (error) {
    console.error("🔥 DELETE /store/books ERROR:", error.message);
    res.status(500).json({ error: `Backend Error: ${error.message}` });
  }
});


// ==========================================
// 2. STUDENT: BUY BOOKS & HISTORY
// ==========================================

// 5. POST: Checkout (Student buys a book)
router.post("/checkout", async (req, res) => {
  try {
    const { studentId, studentName, studentEmail, bookId, bookTitle, amount } = req.body;

    // A. Check if the book is in stock
    const book = await StoreBook.findById(bookId);
    if (!book) return res.status(404).json({ error: "Book not found in store." });
    if (book.stockForSale <= 0) return res.status(400).json({ error: "Out of Stock!" });

    // B. Generate Fake Order ID
    const orderId = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    // C. Save Order (Marked as 'Processing' initially)
    await StoreOrder.create({
      orderId,
      studentId,
      studentName,
      studentEmail,
      bookId,
      bookTitle,
      amount,
      status: 'Processing',
      paymentStatus: 'Success'
    });

    // D. Decrease Stock in StoreBook model
    book.stockForSale -= 1;
    await book.save();

    res.status(200).json({ success: true, message: "Order placed successfully!", orderId });
  } catch (error) {
    console.error("🔥 CHECKOUT ERROR:", error.message);
    res.status(500).json({ error: `Checkout Failed: ${error.message}` });
  }
});

// 6. GET: Fetch Order History
router.get("/orders", async (req, res) => {
  try {
    const { email } = req.query; 
    let query = {};

    if (email) {
      query = { studentEmail: email };
    }

    const orders = await StoreOrder.find(query).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error("🔥 GET /orders ERROR:", error.message);
    res.status(500).json({ error: `Failed to load orders: ${error.message}` });
  }
});


// ==========================================
// 3. ADMIN: UPDATE ORDER STATUS
// ==========================================

// 7. PUT: Update Order Status
router.put("/orders/:orderId/status", async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body; 

    const allowedStatuses = ['Processing', 'Ready for Pickup', 'Collected', 'Cancelled'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, error: "Invalid status value" });
    }

    const updatedOrder = await StoreOrder.findOneAndUpdate(
      { orderId },
      { status },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ success: false, error: "Order not found" });
    }

    res.json({ success: true, message: `Order status updated to ${status}` });
  } catch (error) {
    console.error("🔥 UPDATE ORDER STATUS ERROR:", error.message);
    res.status(500).json({ error: `Backend Error: ${error.message}` });
  }
});

// 8. DELETE: Clear History (Collected or Cancelled orders)
router.delete("/orders/clear-history", async (req, res) => {
  try {
    await StoreOrder.deleteMany({ status: { $in: ['Collected', 'Cancelled'] } });
    res.json({ success: true, message: "All history cleared successfully!" });
  } catch (error) {
    console.error("🔥 CLEAR HISTORY ERROR:", error.message);
    res.status(500).json({ error: `Backend Error: ${error.message}` });
  }
});

// 9. DELETE: Delete a Single Order
router.delete("/orders/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;
    const deletedOrder = await StoreOrder.findOneAndDelete({ orderId });
    
    if (!deletedOrder) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json({ success: true, message: "Order deleted successfully!" });
  } catch (error) {
    console.error("🔥 DELETE SINGLE ORDER ERROR:", error.message);
    res.status(500).json({ error: `Backend Error: ${error.message}` });
  }
});

module.exports = router;