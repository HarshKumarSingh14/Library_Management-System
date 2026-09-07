// backend/config/cloudinary.js
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') }); // Explicit path load

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// 
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: 'lms_resources',
      // 'auto' use karne se Cloudinary khud decide karega 
      // aur image/upload/ wala path dega jo browser me asani se khulta hai
      resource_type: 'auto', 
      public_id: file.originalname.split('.')[0] + "_" + Date.now(),
    };
  },
});

module.exports = { cloudinary, storage };