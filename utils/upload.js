const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '..', 'public', 'uploads', 'blog');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const safeBase = path
      .basename(file.originalname, path.extname(file.originalname))
      .replace(/[^a-z0-9]+/gi, '-')
      .toLowerCase()
      .slice(0, 40);
    cb(null, `${Date.now()}-${safeBase}${path.extname(file.originalname)}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedImages = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  const allowedVideos = ['video/mp4', 'video/webm', 'video/quicktime'];

  if (file.fieldname === 'coverImage' && !allowedImages.includes(file.mimetype)) {
    return cb(new Error('Cover image must be JPG, PNG, WEBP, or GIF.'));
  }
  if (file.fieldname === 'videoFile' && !allowedVideos.includes(file.mimetype)) {
    return cb(new Error('Video must be MP4, WEBM, or MOV.'));
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 60 * 1024 * 1024 } // 60MB — generous for a cover image, workable for a short video clip
});

module.exports = upload;
