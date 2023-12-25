// user-auth-service.js

const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken'); // Import the jsonwebtoken library

const app = express();
const PORT = 3001;

app.use(bodyParser.json());

// PostgreSQL configuration
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'myapp',
  password: 'Ankur',
  port: 5432,
});

// Secret key for signing the JWT
const jwtSecret = 'yourSecretKeyHere';

// Authentication and user registration endpoint
app.post('/authenticate', async (req, res) => {
  const { username, password, action } = req.body;

  try {
    if (action === 'register') {
      // Handle user registration
      const result = await pool.query('INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *', [username, password]);

      // Generate a JWT for the registered user
      const token = jwt.sign({ userId: result.rows[0].id, username: result.rows[0].username }, jwtSecret, { expiresIn: '1h' });

      res.json({ token });
    } else {
      // Handle authentication
      const result = await pool.query('SELECT * FROM users WHERE username = $1 AND password = $2', [username, password]);

      if (result.rows.length > 0) {
        // Generate a JWT for the authenticated user
        const token = jwt.sign({ userId: result.rows[0].id, username: result.rows[0].username }, jwtSecret, { expiresIn: '1h' });

        res.json({ token });
      } else {
        res.status(401).json({ message: 'Invalid credentials' });
      }
    }
  } catch (error) {
    console.error('Error during authentication/registration:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`User Authentication Microservice is running on port ${PORT}`);
});
