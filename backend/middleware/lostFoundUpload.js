const multer = require('multer');
const path = require('path');

// storage engine for lost & found images
const storage = multer.diskStorage({
  destination: './uploads/lost_items',  // NEW upload folder
  filename: function(req, file, cb) {
    cb(
      null,
      file.fieldname + '-' + Date.now() + path.extname(file.originalname)
    );
  }
});

// File filter
function checkFileType(file, cb) {
  const filetypes = /jpeg|jpg|png/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) cb(null, true);
  else cb('Error: Only images allowed!');
}

// Upload middleware
const lostFoundUpload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: function(req, file, cb) {
    checkFileType(file, cb);
  }
}).single('image');  // IMPORTANT: field name = "image"

module.exports = lostFoundUpload;