const express = require('express');
const router = express.Router();
const db = require('../models/db');

router.get('/', (req, res) => {
  db.all('SELECT * FROM images', [], (err, images) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error fetching images');
    }
    console.log('Fetched images:', images); // Add this line for debugging
    res.render('index', { images });
  });
});

router.post('/vote', (req, res) => {
  const { imageId } = req.body;
  
  if (!imageId) {
    return res.status(400).send('Image selection is required');
  }

  // Check if the user has already voted
  if (req.cookies.voted) {
    return res.status(400).send('You have already voted');
  }

  db.run('INSERT INTO votes (image_id) VALUES (?)', [imageId], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error recording vote');
    }

    // Set a cookie to indicate that the user has voted
    res.cookie('voted', 'true', { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true });
    res.redirect('/results');
  });
});

router.get('/results', (req, res) => {
  db.all(`
    SELECT i.id, i.title, i.filename, COUNT(v.id) as votes
    FROM images i
    LEFT JOIN votes v ON i.id = v.image_id
    GROUP BY i.id
    ORDER BY votes DESC
  `, [], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error fetching results');
    }
    res.render('results', { results });
  });
});

module.exports = router;