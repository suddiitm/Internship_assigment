// data-retrieval-service.js

const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

const app = express();
const PORT = 3003;

app.use(bodyParser.json());

// PostgreSQL configuration
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'myapp',
  password: 'Ankur',
  port: 5432,
});

// Secret key for verifying JWT
const jwtSecret = 'yourSecretKeyHere';

// Data retrieval endpoint
app.get('/retrieve-data', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized - Token missing' });
  }

  try {
    // Verify the JWT
    const decoded = jwt.verify(token, jwtSecret);
    console.log('Decoded JWT:', decoded); // Log decoded JWT for debugging

    // Use the decoded information (e.g., user ID) to retrieve data
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [decoded.username]);

    res.json(result.rows);
  } catch (error) {
    console.error('Error during data retrieval:', error);
    res.status(401).json({ message: 'Unauthorized - Invalid token' });
  }
});

app.listen(PORT, () => {
  console.log(`Data Retrieval Microservice is running on port ${PORT}`);
});
