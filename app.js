const express = require('express');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const db = require('./connection')

const app = express();
const port = 3000;

db.connect(err => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Connected to MySQL database');
  }
});

app.use(bodyParser.json());

const authenticateToken = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) return res.status(401).send('Access denied. Token not provided.');

  jwt.verify(token, 'emblaasia', (err, user) => {
    if (err) return res.status(403).send('Invalid token.');
    req.user = user;
    next();
  });
};

app.post('/api/createUsers', (req, res) => {
  const { name, password, email } = req.body;
  
  const query = 'INSERT INTO users (name, password, email) VALUES (?, ?, ?)';
  db.query(query, [name, password, email], (err, result) => {
    if (err) {
      console.error('Error creating user:', err);
      res.status(500).send('Error creating user.');
    } else {
      res.status(201).send('User created successfully.');
    }
  });
});

app.post('/api/login', (req, res) => {
  const { name, password } = req.body;
  
  const query = 'SELECT * FROM users WHERE name = ? AND password = ?';
  db.query(query, [name, password], (err, result) => {
    if (err) {
      console.error('Login error:', err);
      res.status(500).send('Login error.');
    } else if (result.length > 0) {
      const user = { name, email: result[0].email };
      const token = jwt.sign(user, 'emblaasia');
      res.json({ message: 'Login successful', token });
    } else {
      res.status(401).send('Invalid credentials.');
    }
  });
});

app.get('/api/users', (req, res) => {
  const query = 'SELECT * FROM users';
  db.query(query, (err, result) => {
    if (err) {
      console.error('Error fetching users:', err);
      res.status(500).send('Error fetching users.');
    } else {
      res.json(result);
    }
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
