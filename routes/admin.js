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
  db.all('SELECT * FROM images', [], (err, images) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error fetching images');
    }
    res.render('admin/upload', { images });
  });
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

router.post('/delete/:id', isAuthenticated, (req, res) => {
  const imageId = req.params.id;

  db.get('SELECT filename FROM images WHERE id = ?', [imageId], (err, row) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error fetching image');
    }

    if (!row) {
      return res.status(404).send('Image not found');
    }

    const filename = row.filename;
    const filePath = path.join(uploadsDir, filename);

    // Delete the file from the uploads directory
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Error deleting image file');
      }

      // Delete the image record from the database
      db.run('DELETE FROM images WHERE id = ?', [imageId], (err) => {
        if (err) {
          console.error(err);
          return res.status(500).send('Error deleting image from database');
        }

        // Delete associated votes
        db.run('DELETE FROM votes WHERE image_id = ?', [imageId], (err) => {
          if (err) {
            console.error(err);
            return res.status(500).send('Error deleting associated votes');
          }

          res.redirect('/admin/upload');
        });
      });
    });
  });
});

module.exports = router;