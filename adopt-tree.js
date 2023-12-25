const express = require('express');
const jwtMiddleware = require('your-jwt-middleware'); // Replace with your actual JWT middleware
const { Pool } = require('pg');

const app = express();
const PORT = 3000;

// Replace the following with your actual database configuration
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'myapp',
    password: 'Ankur',
    port: 5432, // Change this if your database is on a different port
});

// Middleware to verify JWT
app.use(jwtMiddleware);

// Endpoint for adopting a tree
app.post('/api/adopt-tree', async (req, res) => {
  try {
    // Check if the user is authenticated (JWT verified)
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Assuming you have a 'trees' table in your database
    const treeId = req.body.treeId; // Assuming the tree ID is sent in the request body
    const userId = req.user.userId; // Extract user ID from the authenticated user

    // Record the adoption in the database
    const adoptionResult = await pool.query(
      'INSERT INTO adoptions (username, tree_id) VALUES ($1, $2) RETURNING *',
      [username, treeId]
    );

    res.status(201).json({ message: 'Tree adopted successfully', adoption: adoptionResult.rows[0] });
  } catch (error) {
    console.error('Error adopting tree:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
