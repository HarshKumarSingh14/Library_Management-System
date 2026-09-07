const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const Admin = require('../models/Admin');     // Mongoose Admin Model
const Student = require('../models/Student'); // Mongoose Student Model

// --- HELPER FUNCTION TO GET MODEL ---
const getModel = (role) => (role === 'admin' ? Admin : Student);

// ==========================================
// AUTHENTICATION ROUTES (Controller based)
// ==========================================

// POST /api/auth/signup
router.post('/signup', authController.signup);

// POST /api/auth/login
router.post('/login', authController.login);

router.post('/send-otp', authController.sendSignupOTP);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);


// ==========================================
// PROFILE MANAGEMENT ROUTES (Inline Mongoose)
// ==========================================

// --- UPDATE PROFILE DETAILS ---
router.put('/update-profile', async (req, res) => {
    const { userId, role, phone, branch, designation } = req.body;

    if (!userId || !role) {
        return res.status(400).json({ error: "User ID and role are required." });
    }

    try {
        const Model = getModel(role);
        
        let updateData = { 
            phone: phone || null, 
            branch: branch || null 
        };

        // Agar admin hai toh designation bhi update hoga
        if (role === 'admin') {
            updateData.designation = designation || null;
        }

        // Mongoose findByIdAndUpdate query
        const updatedUser = await Model.findByIdAndUpdate(userId, updateData, { new: true });

        if (!updatedUser) {
            return res.status(404).json({ error: "User not found in the database." });
        }

        res.json({ success: true, message: "Profile details updated successfully" });
    } catch (err) {
        console.error("Profile Details Update Error:", err);
        res.status(500).json({ error: "Server error while updating profile." });
    }
});

// --- UPDATE PROFILE PIC ---
router.post('/update-profile-pic', async (req, res) => {
    const { userId, role, imageUrl } = req.body;
    const Model = getModel(role);

    try {
        const updatedUser = await Model.findByIdAndUpdate(
            userId, 
            { profile_pic: imageUrl }, 
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ error: "User not found." });
        }
        
        res.json({ message: "Profile picture updated successfully", url: imageUrl });
    } catch (err) {
        console.error("Profile Pic Update Error:", err);
        res.status(500).json({ error: err.message });
    }
});

// --- REMOVE PROFILE PIC ---
router.post('/remove-profile-pic', async (req, res) => {
    const { userId, role } = req.body;
    const Model = getModel(role);
    
    try {
        const updatedUser = await Model.findByIdAndUpdate(
            userId, 
            { profile_pic: null }, 
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ error: "User not found." });
        }

        res.json({ success: true });
    } catch (err) {
        console.error("Profile Pic Remove Error:", err);
        res.status(500).json({ error: err.message });
    }
});

// --- DELETE ACCOUNT (Universal Route) ---
router.delete('/delete-account', async (req, res) => {
    const { userId, role } = req.body;

    if (!userId || !role) {
        return res.status(400).json({ error: "User ID and role are required." });
    }

    const Model = getModel(role);

    try {
        const deletedUser = await Model.findByIdAndDelete(userId);

        if (!deletedUser) {
            return res.status(404).json({ error: "User not found in the database." });
        }

        res.json({ success: true, message: "Account permanently deleted." });
    } catch (err) {
        console.error("Account Deletion Error:", err);
        res.status(500).json({ error: "Server error while deleting account." });
    }
});

module.exports = router;