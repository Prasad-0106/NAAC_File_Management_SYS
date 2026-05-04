require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./db/database');

const app = express();
const FRONTEND_URL = process.env.FRONTEND_URL || '';
app.use(cors({
  origin: (origin, callback) => {
    // Allow localhost (any port) for local dev, and the deployed Render frontend URL
    const isLocalhost = !origin || /^http:\/\/localhost(:\d+)?$/.test(origin);
    const isAllowedOrigin = FRONTEND_URL && origin === FRONTEND_URL;
    if (isLocalhost || isAllowedOrigin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/criteria', require('./routes/criteria'));
app.use('/api/documents', require('./routes/documents'));
app.use('/api/verifications', require('./routes/verifications'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/audit', require('./routes/audit'));
app.use('/api/export', require('./routes/export'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date() }));

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`NAAC Backend running on http://localhost:${PORT}`));
});
