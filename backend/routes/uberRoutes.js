const express = require('express');
const axios = require('axios');
const router = express.Router();
const Order = require('../models/Order');
const fetchOrdersFromUber = require('../utils/uber'); // Assume this function fetches orders from Uber

const saveOrdersToMongoDB = async (orders) => {
  try {
    for (const order of orders) {
      // Use the 'external_id' field to find existing records and update them or create new ones
      await Order.findOneAndUpdate({ external_id: order.external_id }, order, { upsert: true });
    }
  } catch (error) {
    console.error('Error saving to MongoDB:', error);
    throw error;
  }
};

router.get('/fetchUberOrders', async (req, res) => {
  try {
    // Get the current date
    const currentDate = new Date();
    const nextDate = new Date(currentDate); // Clone currentDate
    nextDate.setDate(currentDate.getDate() + 1); // Set to the next day

    // Create date objects for 4 PM of the current day and 1 AM of the next day
    const startTime = new Date(currentDate);
    startTime.setHours(16, 0, 0, 0); // Set to 4 PM

    const endTime = new Date(nextDate);
    endTime.setHours(1, 0, 0, 0); // Set to 1 AM of the next day

    // Convert to ISO 8601 format
    const startTimeISO = startTime.toISOString();
    const endTimeISO = endTime.toISOString();

    const uberOrders = await fetchOrdersFromUber(startTimeISO, endTimeISO);

    // Save these to MongoDB
    await saveOrdersToMongoDB(uberOrders);

    res.status(200).json({ success: true, data: uberOrders });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

module.exports = router;
