const express = require('express');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const path = require('path');
const { ensureUploadsDirectory } = require('./middleware/auth');

const app = express();

// Middleware
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true
}));

// Add this line to ensure the uploads directory exists
ensureUploadsDirectory();

// Routes
const indexRoutes = require('./routes/index');
const adminRoutes = require('./routes/admin');

app.use('/', indexRoutes);
app.use('/admin', adminRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});