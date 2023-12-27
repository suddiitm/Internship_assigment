const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2');
const dbConfig = require('./dbConfig');
const router = express.Router();
const pool = mysql.createPool(dbConfig).promise();

// Global variable to store the secret key
let secretKey = null;

// Function to retrieve the secret key from the database
async function fetchSecretKey() {
  try {
    const [secretResult] = await pool.execute(
        'SELECT secret_key FROM secrets ORDER BY id DESC LIMIT 1'
    );

    if (!secretResult[0]) {
      console.error('Secret key not found in the database');
      return null;
    }

    return secretResult[0].secret_key;
  } catch (error) {
    console.error('Error fetching secret key from the database:', error);
    return null;
  }
}

// Fetch the secret key when the server starts
(async () => {
  secretKey = await fetchSecretKey();
  if (!secretKey) {
    process.exit(1); // Exit the application if the secret key is not available
  }
})();

router.post('/register', async (req, res) => {
  const { username, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const [result] = await pool.execute(
      'INSERT INTO users (username, password) VALUES (?, ?)',
      [username, hashedPassword]
    );

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const [user] = await pool.execute(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );

    if (!user[0] || !(await bcrypt.compare(password, user[0].password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Use the global secretKey variable
    const token = jwt.sign({ username }, secretKey, {
      expiresIn: '24h',
    });

    res.status(200).json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});
  
router.post('/adopt-tree', async (req, res) => {
    try {
      // Ensure the Authorization header is present
      const authorizationHeader = req.headers.authorization;
      if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized - Missing or invalid token' });
      }
  
      // Extract the token from the Authorization header
      const token = authorizationHeader.split(' ')[1];
  
      // Use the global secretKey variable
      const decodedToken = jwt.verify(token, secretKey);
  
      const username = decodedToken.username;
  
      // Assuming you have a 'trees' table with 'id' as the tree identifier
      const [result] = await pool.execute(
        'INSERT INTO tree_adoptions (username, tree_id) VALUES (?, ?)',
        [username, req.body.tree_id]
      );
  
      res.status(201).json({ message: 'Tree adopted successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });

module.exports = router;
