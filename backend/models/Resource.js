const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
    title: { type: String, required: true },
    type: { type: String, required: true }, // e.g., notes, assignment, syllabus
    course: { type: String, default: '' },
    branch: { type: String, default: '' },
    year: { type: String, default: '' },
    url: { type: String, required: true } // Cloudinary File URL
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

module.exports = mongoose.model('Resource', resourceSchema);