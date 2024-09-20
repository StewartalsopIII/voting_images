const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../database.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err);
  } else {
    console.log('Connected to the SQLite database.');
    db.run(`CREATE TABLE IF NOT EXISTS images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      filename TEXT NOT NULL,
      title TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS votes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      image_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (image_id) REFERENCES images (id)
    )`);
  }
});

module.exports = db;