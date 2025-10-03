const multer = require('multer');
const path = require('path');

// storage engine
const storage = multer.diskStorage({
  destination: './uploads/profiles', // path where img save
  filename: function(req, file, cb) {
    // unique filename = fieldname-timestamp.extension -> xyz-1759____.png
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

// upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 1000000 }, // size only <= 1MB
  fileFilter: function(req, file, cb) {
    checkFileType(file, cb);
  }
}).single('profileImage'); 

// file type
function checkFileType(file, cb) {
  // file type
  const filetypes = /jpeg|jpg|png/;
  // extension
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // mime type
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb('Error: Images Only!');
  }
}

module.exports = upload;