// config/db.js
const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    try {
        // Agar .env mein MONGO_URI nahi hai, toh ye automatically local MongoDB use kar lega
        const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/codesage_db';

        const conn = await mongoose.connect(MONGO_URI);
        console.log(`🟢 Local MongoDB Connected Successfully: ${conn.connection.host}`);
    } catch (error) {
        console.error("❌ Database connection failed:", error.message);
        process.exit(1);
    }
};

module.exports = connectDB;