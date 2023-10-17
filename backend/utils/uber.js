const axios = require('axios');
const ApiToken = require('../models/ApiToken');
const { clientID, clientSecret } = require('../config/uberAPI');

const fetchOrdersFromUber = async (startTime, endTime) => {
  try {
    // Retrieve existing token from MongoDB
    const existingToken = await ApiToken.findOne({ apiName: 'uber' });

    let accessToken;

    // If token exists and is not expired
    if (existingToken && new Date(existingToken.expiresAt) > new Date()) {
      accessToken = existingToken.accessToken;
    } else {
      // Otherwise, refresh token or get a new one
      const newTokens = await refreshAccessToken(); // Assume this function refreshes and returns new tokens
      accessToken = newTokens.accessToken;

      // Update the tokens in MongoDB
      if (existingToken) {
        existingToken.accessToken = accessToken;
        existingToken.refreshToken = newTokens.refreshToken;
        existingToken.expiresAt = new Date(new Date().getTime() + (newTokens.expiresIn * 1000));
        await existingToken.save();
      } else {
        await ApiToken.create({
          apiName: 'uber',
          accessToken,
          refreshToken: newTokens.refreshToken,
          expiresAt: new Date(new Date().getTime() + (newTokens.expiresIn * 1000)),
        });
      }
    }

    const response = await axios.get('https://api.uber.com/orders', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
      params: {
        'start_time': startTime,
        'end_time': endTime,
      },
    });

    return response.data;

  } catch (error) {
    console.error('Error fetching orders from Uber:', error);
    throw error;
  }
};

const refreshAccessToken = async () => {
  try {
    // Here you would perform the logic to refresh the access token.
    // I'll use a placeholder object to represent the refreshed tokens.
    return {
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token',
      expiresIn: 3600, // seconds
    };
  } catch (error) {
    console.error('Error refreshing access token:', error);
    throw error;
  }
};

module.exports = {
  fetchOrdersFromUber,
};
