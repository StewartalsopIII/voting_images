const adminPassword = 'hello'; // Replace with your chosen password

function isAuthenticated(req, res, next) {
  if (req.session.isAdmin) {
    next();
  } else {
    res.redirect('/admin/login');
  }
}

// Add this function to ensure the uploads directory exists
function ensureUploadsDirectory() {
  const fs = require('fs');
  const path = require('path');
  const uploadsDir = path.join(__dirname, '..', 'public', 'uploads');
  
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
}

// Add this line at the end of the file
ensureUploadsDirectory();

module.exports = { isAuthenticated, adminPassword, ensureUploadsDirectory };