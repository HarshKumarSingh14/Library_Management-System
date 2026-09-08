// server.js  // Backend ko deploy krne ke ye code comment kiya hu

require('dotenv').config();
const express = require('express');
const cors = require('cors');

// --- DATABASE CONNECTION ---
const connectDB = require('./config/db');

// --- ROUTE IMPORTS ---
const bookRoutes = require('./routes/bookRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes'); 
const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const chatRoutes = require('./routes/chatRoutes');
const resourceRoutes = require("./routes/resourceRoutes");
const storeRoutes = require('./routes/store');

const app = express();
const PORT = process.env.PORT || 5000;

// --- MIDDLEWARE ---
// Express mein ab alag se body-parser ki zaroorat nahi hoti, ye built-in hai
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
    origin: ["http://localhost:8080", "http://localhost:5173", "http://localhost:3000"], 
    credentials: true 
}));

// --- ROUTES SETUP ---
app.get('/', (req, res) => {
    res.status(200).json({ status: "success", message: "CodeSage & Library API is Running..." });
});

app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/dashboard', dashboardRoutes); 
app.use('/api/chat', chatRoutes); 
app.use('/api/resources', resourceRoutes);
app.use('/api/store', storeRoutes); 

// --- GLOBAL ERROR HANDLING MIDDLEWARE ---
app.use((err, req, res, next) => {
    console.error('❌ Uncaught Error:', err.stack);
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

// --- DATABASE CONNECTION & SERVER START ---
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
    });
}).catch((err) => {
    console.error('❌ Server failed to start due to Database Error:', err.message);
    process.exit(1);
});



