require('dotenv').config();
const express = require('express');
const router = express.Router();
const { useUberAPI } = require('../utils/uber');
const Order = require('../models/Order');

const UBER_API_ENDPOINT = `https://api.uber.com/v1/delivery/store/c3d4b941-c55a-4d5b-970f-802ac0625af3/orders`;

const saveOrdersToMongoDB = async (orders) => {
  for (const order of orders) {
    // Optionally, validate or sanitize 'order' before saving
    await Order.findOneAndUpdate({ external_id: order.external_id }, order, { upsert: true });
  }
};

router.get('/fetchUberOrders', async (req, res) => {
  try {
    const uberOrders = await useUberAPI(UBER_API_ENDPOINT);
    await saveOrdersToMongoDB(uberOrders);
    res.status(200).json({ success: true, data: uberOrders });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

const fetchAndSaveOrders = async () => {
  try {
    const uberOrders = await useUberAPI(UBER_API_ENDPOINT);
    await saveOrdersToMongoDB(uberOrders);
    console.log('Successfully fetched and saved Uber orders.');
  } catch (error) {
    console.error('Failed to fetch and save Uber orders:', error.message);
  }
};

module.exports = { router, saveOrdersToMongoDB, fetchAndSaveOrders };
