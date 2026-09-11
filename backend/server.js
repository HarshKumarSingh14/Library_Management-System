// // server.js  // Backend ko deploy krne ke ye code comment kiya hu

// require('dotenv').config();
// const express = require('express');
// const cors = require('cors');

// // --- DATABASE CONNECTION ---
// const connectDB = require('./config/db');

// // --- ROUTE IMPORTS ---
// const bookRoutes = require('./routes/bookRoutes');
// const dashboardRoutes = require('./routes/dashboardRoutes'); 
// const authRoutes = require('./routes/authRoutes');
// const studentRoutes = require('./routes/studentRoutes');
// const transactionRoutes = require('./routes/transactionRoutes');
// const chatRoutes = require('./routes/chatRoutes');
// const resourceRoutes = require("./routes/resourceRoutes");
// const storeRoutes = require('./routes/store');

// const app = express();
// const PORT = process.env.PORT || 5000;

// // --- MIDDLEWARE ---
// // Express mein ab alag se body-parser ki zaroorat nahi hoti, ye built-in hai
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// app.use(cors({
//     origin: ["https://bookify-library14.netlify.app"], 
//     credentials: true 
// }));

// // --- ROUTES SETUP ---
// app.get('/', (req, res) => {
//     res.status(200).json({ status: "success", message: "CodeSage & Library API is Running..." });
// });

// app.use('/api/auth', authRoutes);
// app.use('/api/books', bookRoutes);
// app.use('/api/students', studentRoutes);
// app.use('/api/transactions', transactionRoutes);
// app.use('/api/dashboard', dashboardRoutes); 
// app.use('/api/chat', chatRoutes); 
// app.use('/api/resources', resourceRoutes);
// app.use('/api/store', storeRoutes); 

// // --- GLOBAL ERROR HANDLING MIDDLEWARE ---
// app.use((err, req, res, next) => {
//     console.error('❌ Uncaught Error:', err.stack);
//     res.status(500).json({ message: 'Internal Server Error', error: err.message });
// });

// // --- DATABASE CONNECTION & SERVER START ---
// connectDB().then(() => {
//     app.listen(PORT, () => {
//         console.log(`🚀 Server running on port ${PORT}`);
//     });
// }).catch((err) => {
//     console.error('❌ Server failed to start due to Database Error:', err.message);
//     process.exit(1);
// });



// server.js

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
const resourceRoutes = require('./routes/resourceRoutes');
const storeRoutes = require('./routes/store');

const app = express();

// Render apna PORT provide karega
const PORT = process.env.PORT || 5000;


// =====================================================
// MIDDLEWARE
// =====================================================

// JSON request body limit
app.use(express.json({ limit: '1mb' }));

// URL encoded body limit
app.use(express.urlencoded({
    extended: true,
    limit: '1mb'
}));


// =====================================================
// CORS
// =====================================================

const allowedOrigins = [
    'https://bookify-library14.netlify.app'
];

app.use(cors({
    origin: function (origin, callback) {

        // Allow requests with no origin
        // (Postman, curl, server-to-server requests, etc.)
        if (!origin) {
            return callback(null, true);
        }

        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true
}));


// =====================================================
// HEALTH / ROOT ROUTE
// =====================================================

app.get('/', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'Library API is Running...'
    });
});


// =====================================================
// API ROUTES
// =====================================================

app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/store', storeRoutes);


// =====================================================
// 404 HANDLER
// =====================================================

app.use((req, res) => {
    res.status(404).json({
        message: 'API endpoint not found'
    });
});


// =====================================================
// GLOBAL ERROR HANDLER
// =====================================================

app.use((err, req, res, next) => {

    console.error('❌ Server Error:', err);

    // CORS error
    if (err.message === 'Not allowed by CORS') {
        return res.status(403).json({
            message: 'Access denied'
        });
    }

    // Production mein internal error details
    // client ko expose nahi karenge
    res.status(500).json({
        message: 'Internal Server Error'
    });
});


// =====================================================
// DATABASE CONNECTION & SERVER START
// =====================================================

const startServer = async () => {
    try {

        await connectDB();

        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });

    } catch (err) {

        console.error(
            '❌ Server failed to start due to Database Error:',
            err.message
        );

        process.exit(1);
    }
};

startServer();


