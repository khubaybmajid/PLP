// Load environment variables
require('dotenv').config();

// Import required packages
const express = require('express');
const { connectDB } = require('./config/db');
const cron = require('node-cron');

// Import your router and the fetchAndSaveUberOrders function from uberRoutes
const { router: uberRouter, fetchAndSaveOrders: fetchAndSaveUberOrders } = require('./routes/uberRoutes');

// Initialize Express app
const app = express();

// Connect to the database
connectDB();

// Initialize Middleware
app.use(express.json({ extended: false }));

// Define Routes
app.use('/api/uber', uberRouter);  // Use the router we imported as uberRouter

// Start the server
const PORT = process.env.PORT || 5004;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

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
