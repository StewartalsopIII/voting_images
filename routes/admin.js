const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../models/db');
const { isAuthenticated, adminPassword } = require('../middleware/auth');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

router.get('/login', (req, res) => {
  res.render('admin/login');
});

router.post('/login', (req, res) => {
  const { password } = req.body;

  if (password === adminPassword) {
    req.session.isAdmin = true;
    res.redirect('/admin/upload');
  } else {
    res.status(401).send('Invalid password');
  }
});

router.get('/upload', isAuthenticated, (req, res) => {
  res.render('admin/upload');
});

router.post('/upload', isAuthenticated, upload.single('image'), (req, res) => {
  const { title } = req.body;
  const filename = req.file.filename;

  db.run('INSERT INTO images (filename, title) VALUES (?, ?)', [filename, title], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error uploading image');
    }
    res.redirect('/');
  });
});

module.exports = router;