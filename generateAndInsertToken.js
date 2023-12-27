const jwt = require('jsonwebtoken');
const mysql = require('mysql2/promise');

// Load database configuration
const dbConfig = require('./dbConfig');

// Your secret key (replace this with your actual secret)
const secretKey = 'your_actual_secret_key';

// Function to generate and insert the JWT token
async function generateAndInsertToken() {
  try {
    // Prompt for the username
    const username = await prompt('Enter username: ');

    // Payload for the JWT token
    const payload = {
      username: username,
    };

    // Token options (e.g., expiration time)
    const options = {
      expiresIn: '24h',  // replace with the desired expiration time
    };

    // Generate the JWT token
    const token = jwt.sign(payload, secretKey, options);

    console.log('Generated JWT Token:', token);

    // Insert the token into the secrets table
    const connection = await mysql.createConnection(dbConfig);

    await connection.execute(
      'INSERT INTO secrets (secret_key) VALUES (?)',
      [token]
    );

    console.log('Token inserted into secrets table.');

    // Close the database connection
    await connection.end();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Helper function to prompt for user input
function prompt(question) {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise(resolve => {
    rl.question(question, answer => {
      rl.close();
      resolve(answer);
    });
  });
}

// Call the function to generate and insert the token
generateAndInsertToken();
