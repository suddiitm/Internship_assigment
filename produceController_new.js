const express = require('express');
const mysql = require('mysql2/promise');
const dbConfig = require('./dbConfig'); // Your database configuration file

const router = express.Router();

// Function to connect to the database
async function connectToDatabase() {
  const connection = await mysql.createConnection(dbConfig);
  return connection;
}

// Endpoint to calculate and distribute produce share
router.post('/calculate-distribute-produce-share', async (req, res) => {
  const connection = await connectToDatabase();

  try {
    // Delete all existing rows in user_produce_shares table
    await connection.execute('DELETE FROM user_produce_shares');

    // Query to get all adopted trees and their corresponding produce
    const [treeAdoptions] = await connection.execute(
        'SELECT ta.id AS adoption_id, ta.tree_id, p.produce_id, p.quantity, u.id AS user_id, u.username AS username, t.name AS tree_name ' +
        'FROM tree_adoptions ta ' +
        'JOIN trees t ON ta.tree_id = t.id ' +
        'JOIN produce p ON ta.tree_id = p.tree_id ' +
        'JOIN users u ON ta.username = u.username'
      );

    // Calculate total produce quantity for each tree adoption
    const treeProduceTotals = {};
    treeAdoptions.forEach((adoption) => {
      const treeId = adoption.tree_id;
      const quantity = adoption.quantity;

      if (!treeProduceTotals[treeId]) {
        treeProduceTotals[treeId] = 0;
      }

      treeProduceTotals[treeId] += quantity;
    });

    // Distribute produce share to tree adoptions
    for (const adoption of treeAdoptions) {
      const adoptionId = adoption.adoption_id;
      const treeId = adoption.tree_id;
      const produceId = adoption.produce_id;
      const quantity = adoption.quantity;
      const userId = adoption.user_id; // user_id from the users table
      const username = adoption.username;
      const tree_name = adoption.tree_name; 

      // Calculate share as a percentage based on total produce for the tree
      const sharePercentage = (quantity / treeProduceTotals[treeId]) * 100;

      // Insert share into user_produce_shares table
      await connection.execute(
        'INSERT INTO user_produce_shares (share_id, user_id, produce_id, share_quantity, username, tree_name) VALUES (?, ?, ?, ?, ?, ?)',
        [adoptionId, userId, produceId, sharePercentage, username, tree_name]
      );
    }

    res.status(200).json({ message: 'Produce share calculation and distribution completed successfully.' });
  } catch (error) {
    console.error('Error calculating and distributing produce share:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  } finally {
    // Close the database connection
    await connection.end();
  }
});

module.exports = router;
