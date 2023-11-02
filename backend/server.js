// Load environment variables
require('dotenv').config();

// Import required packages
const express = require('express');
const cron = require('node-cron');
const { callback, refreshAccessToken, useUberAPI } = require('./utils/uber'); // Import from uber.js

// Import your router and the fetchAndSaveUberOrders function from uberRoutes
const { router: uberRouter, fetchAndSaveOrders: fetchAndSaveUberOrders } = require('./routes/uberRoutes');

// Connect to the database using your new setup
const { connectDB } = require('./config/db');

// Initialize Express app
const app = express();

// Initialize Middleware
app.use(express.json({ extended: false }));

// Define Routes
app.use('/api/uber', uberRouter);  // Use the router we imported as uberRouter

// Add the /callback route from the uber.js file
app.get('/callback', callback);

app.get('/', (req, res) => {
  res.send('Server is up and running');
});

// Function to initialize server and other startup tasks
async function initializeServer() {
  try {

    // Start the server
    const PORT = 5004;
    app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
    
    await connectDB(); // Make sure to await the database connection
    console.log("Database connected");
  
    // Fetch Uber orders
    console.log('Fetching Uber orders...');
    fetchAndSaveUberOrders();  // Now we are sure the DB is connected

  } catch (error) {
    console.log("Failed to initialize server:", error);
  }
}

// Call initializeServer to start everything up
initializeServer();

// Schedule tasks to be run on the server
cron.schedule('*/5 * * * *', function() {
  const currentTime = new Date();
  
  // Check if the current time is between 4 PM and 1 AM
  if ((currentTime.getHours() >= 16 && currentTime.getHours() <= 23) || 
      (currentTime.getHours() >= 0 && currentTime.getHours() <= 1)) {
    
    console.log('Fetching Uber orders...');
    fetchAndSaveUberOrders();  // Using the function we imported
  }
});
