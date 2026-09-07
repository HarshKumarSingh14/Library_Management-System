const express = require('express');
const router = express.Router();
const Resource = require('../models/Resource'); // Mongoose Resource Model
const multer = require('multer');
const { storage } = require('../config/cloudinary'); 

const upload = multer({ storage: storage });

// ---------------------------------------------
// 1. GET ALL RESOURCES (Case-Insensitive & Filter Fix)
// ---------------------------------------------
router.get('/', async (req, res) => {
  try {
    const { type, course, branch, year, search } = req.query;

    // Base Query filter dictionary
    let filter = {};

    if (type) {
      filter.type = type;
    }

    // Course Filter (Case-insensitive match)
    if (course && course !== 'All') {
      filter.course = { $regex: new RegExp(`^${course}$`, 'i') };
    }

    // Branch Filter (Case-insensitive match)
    if (branch && branch !== 'All') {
      filter.branch = { $regex: new RegExp(`^${branch}$`, 'i') };
    }

    // Year Filter
    if (year && year !== 'All') {
      filter.year = year;
    }

    // Search Logic (Partial match case-insensitive for title)
    if (search) {
      filter.title = { $regex: search, $options: 'i' };
    }

    // Fetch resources sorted by latest created
    const resources = await Resource.find(filter).sort({ createdAt: -1 });
    res.json(resources);

  } catch (error) {
    console.error("Database Error:", error);
    res.status(500).json({ message: "Database error" });
  }
});

// ---------------------------------------------
// 2. ADD NEW RESOURCE
// ---------------------------------------------
router.post('/add', upload.single('file'), async (req, res) => {
  try {
    const { title, type, course, branch, year, url } = req.body;
    
    let finalUrl = url;

    if (req.file) {
      finalUrl = req.file.path; // Cloudinary secure URL
    }

    const newResource = await Resource.create({
      title,
      type,
      course: course || '',
      branch: branch || '',
      year: year || '',
      url: finalUrl || ''
    });
    
    res.status(201).json({ 
      message: "Resource added successfully", 
      url: finalUrl,
      resource: newResource
    });

  } catch (error) {
    console.error("Upload/DB Error:", error);
    res.status(500).json({ message: "Failed to add resource" });
  }
});

// ---------------------------------------------
// 3. DELETE RESOURCE
// ---------------------------------------------
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedResource = await Resource.findByIdAndDelete(id);

    if (!deletedResource) {
      return res.status(404).json({ message: "Resource not found" });
    }

    res.json({ message: "Resource deleted" });
  } catch (error) {
    console.error("Delete Error:", error);
    res.status(500).json({ message: "Failed to delete" });
  }
});

module.exports = router;