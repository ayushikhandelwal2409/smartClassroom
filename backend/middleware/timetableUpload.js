const multer = require('multer');

const storage = multer.memoryStorage();

const timetableUpload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.originalname.endsWith('.xlsx')) cb(null, true);
    else cb('Only Excel files allowed');
  }
}).single('file');

module.exports = timetableUpload;