require('dotenv').config();
const axios = require('axios');
const qs = require('qs');
const { UBER_CLIENT_ID, UBER_CLIENT_SECRET } = process.env;

// Function to fetch access token
const fetchAccessToken = async (authorizationCode) => {
  try {
    const response = await axios.post('https://login.uber.com/oauth/v2/token', qs.stringify({
      client_id: UBER_CLIENT_ID,
      client_secret: UBER_CLIENT_SECRET,
      grant_type: 'authorization_code',
      redirect_uri: 'http://localhost:5004/callback',
      code: authorizationCode  
    }), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const accessToken = response.data.access_token;
    const refreshToken = response.data.refresh_token;
    const expiresIn = response.data.expires_in;
    const expiresAt = new Date().getTime() + expiresIn * 1000;

    // Here you can save the tokens to your database

  } catch (error) {
    console.error('Error in OAuth callback:', error.message);
    throw new Error(error.message || 'Internal Server Error');
  }
};

// Function to refresh access token
const refreshAccessToken = async (apiTokensCollection) => {
  try {
    const tokenData = await apiTokensCollection.findOne({ userId: 'Dezerts' });
    if (!tokenData) {
      throw new Error('No token data available in the database');
    }
    const refreshToken = tokenData.refreshToken;

    const response = await axios.post('https://login.uber.com/oauth/v2/token', qs.stringify({
      client_id: UBER_CLIENT_ID,
      client_secret: UBER_CLIENT_SECRET,
      grant_type: 'refresh_token',
      refresh_token: refreshToken
    }), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const newAccessToken = response.data.access_token;
    const newRefreshToken = response.data.refresh_token;
    const expiresIn = response.data.expires_in;
    const expiresAt = new Date().getTime() + expiresIn * 1000;

    // Here you can update the tokens in your database

    return newAccessToken;
  } catch (error) {
    console.error('Error refreshing token:', error.message);
    throw new Error(error.message || 'Could not refresh token');
  }
};

// Function to use Uber API
const useUberAPI = async (url, apiTokensCollection) => {
  const tokenData = await apiTokensCollection.findOne({ userId: 'Dezerts' });

  if (!tokenData) {
    console.error('Error fetching token: Token data is null, can\'t proceed.');
    return null;
  }

  let { accessToken, expiresAt } = tokenData;
  const now = new Date().getTime();

  const makeApiCall = async (token) => {
    console.log("Token being used:", token);
    const options = {
      method: 'GET',
      url: url,
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };
  
    try {
      return await axios(options);
    } catch (error) {
      console.error('Detailed error:', error.response.data);  // Print detailed error
      throw error;
    }
  };
  

  try {
    if (now >= expiresAt) {
      accessToken = await refreshAccessToken(apiTokensCollection);
      if (!accessToken) {
        console.log("Couldn't refresh the access token, can't proceed.");
        return;
      }
      const response = await makeApiCall(accessToken);
      console.log("Received Uber data: ", response.data);
      return response.data;
    }

    const response = await makeApiCall(accessToken);
    console.log("Received Uber data: ", response.data);
    return response.data;
  } catch (error) {
    console.error('Error while calling Uber API:', error.message);
    throw new Error(error.message || 'Error calling Uber API');
  }
};

// OAuth callback function
const callback = async (req, res) => {
  const authorizationCode = req.query.code;

  if (!authorizationCode) {
    return res.status(400).send("Authorization code is missing");
  }

  try {
    const response = await axios.post('https://login.uber.com/oauth/v2/token', qs.stringify({
      client_id: UBER_CLIENT_ID,
      client_secret: UBER_CLIENT_SECRET,
      grant_type: 'authorization_code',
      redirect_uri: 'http://localhost:5004/callback',
      code: authorizationCode
    }), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    // Here you should save the tokens to your database

    res.send("Success");
  } catch (error) {
    console.error("Error in callback:", error.message);
    res.status(500).send(error.message || "Internal Server Error");
  }
};

module.exports = { useUberAPI, refreshAccessToken, callback };
