const multer = require('multer');
const path = require('path');

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = path.join(__dirname, '../../uploads');
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}_${file.originalname}`);
    }
  }),
  fileFilter: (req, file, cb) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png|pdf|docx|txt|mp4|mp3)$/i)) {
      return cb(new Error('Solo se permiten archivos JPG, JPEG, PNG, PDF, DOCX, TXT, MP4 y MP3'));
    }
    cb(undefined, true);
  }
});

module.exports = upload;