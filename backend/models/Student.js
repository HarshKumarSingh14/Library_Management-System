const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    password: { type: String, required: true },
    course: { type: String },
    branch: { type: String },
    year: { type: String },
    section: { type: String },
    isVerified: { type: Boolean, default: false },
    otp: { type: String },
    otpExpire: { type: Date },
    resetPasswordToken: { type: String },
    resetPasswordExpire: { type: Date },
    profile_pic: { type: String, default: null }

}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);