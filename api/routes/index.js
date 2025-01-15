const middlewares = require('@blocklet/sdk/lib/middlewares');
const router = require('express').Router();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS profile (
    username TEXT,
    email TEXT,
    phone TEXT
  )`);

  db.get('SELECT * FROM profile', (err, row) => {
    if (err) {
      console.error(err);
      return;
    }

    if (!row) {
      db.run('INSERT INTO profile (username, email, phone) VALUES (?, ?, ?)', ['', '', '']);
    }
  });
});

// Utility functions for validation
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidChinesePhone(phone) {
  const phoneRegex = /^1[3-9]\d{9}$/;
  return phoneRegex.test(phone);
}

router.use('/user', middlewares.session(), (req, res) => res.json(req.user || {}));

router.use('/data', (req, res) =>
  res.json({
    message: 'Hello Blocklet!',
  }),
);

// API to get user profile
router.get('/profile', (req, res) => {
  db.get('SELECT * FROM profile', (err, row) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Database error' });
      return;
    }
    res.json(row);
  });
});

router.post('/profile', (req, res) => {
  const { username, email, phone } = req.body;
  if (username.length > 100) {
    return res.status(400).json({ error: 'username too long, maxLength:100' });
  }
  if (email.length > 100) {
    return res.status(400).json({ error: 'email too long, maxLength:100' });
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }
  if (!isValidChinesePhone(phone)) {
    return res.status(400).json({ error: 'Invalid phone number format' });
  }
  db.run('UPDATE profile SET username = ?, email = ?, phone = ?', [username, email, phone], function (err) {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'save failed:Database error' });
      return;
    }
    res.json({ username, email, phone });
  });
});

module.exports = router;
