// server.js

const express = require('express');
const bodyParser = require('body-parser');
const authController = require('./authController');
const produceController = require('./produceController');

const app = express();
const PORT = 3000;

app.use(bodyParser.json());

// Routes
app.use('/auth', authController);
app.use('/produce', produceController);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
