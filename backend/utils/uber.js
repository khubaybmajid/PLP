require('dotenv').config();
const axios = require('axios');
const qs = require('qs');
const { saveToken, getToken } = require('../models/ApiToken');  // Make sure the path is correct
const { UBER_CLIENT_ID, UBER_CLIENT_SECRET } = process.env;

const fetchAccessToken = async (authorizationCode) => {
  try {
    const response = await axios.post('https://login.uber.com/oauth/v2/token', qs.stringify({
      client_id: UBER_CLIENT_ID,
      client_secret: UBER_CLIENT_SECRET,
      grant_type: 'authorization_code',
      redirect_uri: 'http://localhost:5004/callback',
      code: authorizationCode  // Fixed this line
    }), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const accessToken = response.data.access_token;
    const refreshToken = response.data.refresh_token;
    const expiresIn = response.data.expires_in;
    const expiresAt = new Date().getTime() + expiresIn * 1000;

    await saveToken(accessToken, refreshToken, expiresAt);
  } catch (error) {
    console.error('Error in OAuth callback:', error.message);
    throw new Error(error.message || 'Internal Server Error');
  }
};

const refreshAccessToken = async () => {
  try {
  const tokenData = await getToken();
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

  await saveToken(newAccessToken, newRefreshToken, expiresAt);
  return newAccessToken;
} catch (error) {
  console.error('Error refreshing token:', error.message);
  throw new Error(error.message || 'Could not refresh token');
}
};


const useUberAPI = async (apiEndpoint, method = 'GET', data = null) => {
  let tokenData = await getToken();
  
  if (!tokenData) {
    console.log("Token data is null, can't proceed.");
    return;
  }

  let { accessToken, expiresAt } = tokenData;
  const now = new Date().getTime();
  
  // Function to make the actual API call
  const makeApiCall = async (token) => {
    const options = {
      method,
      url: apiEndpoint,
      headers: {
        'Authorization': `Bearer ${token}`
      },
      data
    };
    return await axios(options);
  };

  try {
    if (now >= expiresAt) {
      accessToken = await refreshAccessToken();
      if (!accessToken) {
        console.log("Couldn't refresh the access token, can't proceed.");
        return;
      }
      // Retry the API call after refreshing the token
      const response = await makeApiCall(accessToken);
      console.log("Received Uber data: ", response.data);
      return response.data;
    }

    // Initial API call
    const response = await makeApiCall(accessToken);
    console.log("Received Uber data: ", response.data);
    return response.data;
  } catch (error) {
    console.error('Error while calling Uber API:', error.message);
    throw new Error(error.message || 'Error calling Uber API');
  }
};

const callback = async (req, res) => {
  const authorizationCode = req.query.code;

  if (!authorizationCode) {
    return res.status(400).send("Authorization code is missing");
  }

  if (authorizationCode) {
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

      // Handle response, maybe save token etc
      res.send("Success"); 
    } catch (error) {
      console.error("Error in callback:", error.message);
      res.status(500).send(error.message || "Internal Server Error");
    }
  }
};  


module.exports = { useUberAPI, refreshAccessToken, callback };

