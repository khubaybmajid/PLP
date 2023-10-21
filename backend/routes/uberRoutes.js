const express = require('express');
const router = express.Router();
const { useUberAPI } = require('../utils/uber');
const Order = require('../models/Order');

const saveOrdersToMongoDB = async (orders) => {
  for (const order of orders) {
    await Order.findOneAndUpdate({ external_id: order.external_id }, order, { upsert: true });
  }
};

router.get('/fetchUberOrders', async (req, res) => {
  try {
    const apiEndpoint = 'https://api.uber.com/v1/eats/orders';
    const uberOrders = await useUberAPI(apiEndpoint);
    await saveOrdersToMongoDB(uberOrders);
    res.status(200).json({ success: true, data: uberOrders });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// Combine fetchOrders and saveOrders into a single function
const fetchAndSaveOrders = async () => {
  try {
    const apiEndpoint = 'https://api.uber.com/v1/eats/orders';
    const uberOrders = await useUberAPI(apiEndpoint);
    await saveOrdersToMongoDB(uberOrders);
    console.log('Successfully fetched and saved Uber orders.');
    console.log("Received Uber orders: ", uberOrders);
  } catch (error) {
    console.error('Failed to fetch and save Uber orders:', error);
  }
};

module.exports = { router, saveOrdersToMongoDB, fetchAndSaveOrders };


