const express = require('express');
const router = express.Router();
const Resource = require('../models/Resource');
const multer = require('multer');
const { storage } = require('../config/cloudinary');

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 9.5 * 1024 * 1024 // 9.5 MB
  }
});

// ---------------------------------------------
// 1. GET ALL RESOURCES
// ---------------------------------------------
router.get('/', async (req, res) => {
  try {
    const { type, course, branch, year, search } = req.query;

    let filter = {};

    if (type) {
      filter.type = type;
    }

    if (course && course !== 'All') {
      filter.course = { $regex: new RegExp(`^${course}$`, 'i') };
    }

    if (branch && branch !== 'All') {
      filter.branch = { $regex: new RegExp(`^${branch}$`, 'i') };
    }

    if (year && year !== 'All') {
      filter.year = year;
    }

    if (search) {
      filter.title = { $regex: search, $options: 'i' };
    }

    const resources = await Resource.find(filter).sort({ createdAt: -1 });

    res.json(resources);

  } catch (error) {
    console.error("Database Error:", error);
    res.status(500).json({
      message: "Database error"
    });
  }
});

// ---------------------------------------------
// 2. ADD NEW RESOURCE
// ---------------------------------------------
router.post('/add', (req, res, next) => {

  upload.single('file')(req, res, (error) => {

    // File size error
    if (error instanceof multer.MulterError) {

      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          message: "File size must be less than 10 MB."
        });
      }

      return res.status(400).json({
        message: "File upload failed."
      });
    }

    // Other upload errors
    if (error) {
      console.error("Upload Error:", error);

      return res.status(400).json({
        message: "File upload failed."
      });
    }

    next();
  });

}, async (req, res) => {

  try {
    const { title, type, course, branch, year, url } = req.body;

    let finalUrl = url;

    // If file uploaded, use Cloudinary URL
    if (req.file) {
      finalUrl = req.file.path;
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

    res.status(500).json({
      message: "Failed to add resource"
    });
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
      return res.status(404).json({
        message: "Resource not found"
      });
    }

    res.json({
      message: "Resource deleted"
    });

  } catch (error) {
    console.error("Delete Error:", error);

    res.status(500).json({
      message: "Failed to delete"
    });
  }
});

module.exports = router;