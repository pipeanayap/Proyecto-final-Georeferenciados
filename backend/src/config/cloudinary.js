const multer = require('multer');

// Usamos almacenamiento en memoria local sin Cloudinary
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }
});

module.exports = { upload };
