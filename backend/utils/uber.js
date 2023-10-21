const axios = require('axios');
const qs = require('qs');
const { saveToken, getToken } = require('../models/ApiToken');
const { UBER_CLIENT_ID, UBER_CLIENT_SECRET } = process.env;



const fetchAccessToken = async (authorizationCode) => {
  try {
    const response = await axios.post('https://login.uber.com/oauth/v2/token', qs.stringify({
      client_id: UBER_CLIENT_ID,
      client_secret: UBER_CLIENT_SECRET,
      grant_type: 'authorization_code',
      redirect_uri: 'http://localhost:5004/callback',
      code: authorizationCode,
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
    console.error('Error in OAuth callback:', error);
    throw new Error('Internal Server Error');
  }
};

const refreshAccessToken = async () => {
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
};

const useUberAPI = async (apiEndpoint, method = 'GET', data = null) => {
  let tokenData = await getToken();
  
  if (!tokenData) {
    console.log("Token data is null, can't proceed.");
    return;
  }
  
  let { accessToken, expiresAt } = tokenData;
  const now = new Date().getTime();

  if (now >= expiresAt) {
    accessToken = await refreshAccessToken();
    if (!accessToken) {
      console.log("Couldn't refresh the access token, can't proceed.");
      return;
    }
  }

  const options = {
    method,
    url: apiEndpoint,
    headers: {
      'Authorization': `Bearer ${accessToken}`
    },
    data
  };

  try {
    const response = await axios(options);
    console.log("Received Uber data: ", response.data);
    return response.data;
  } catch (error) {
    console.log("Error while calling Uber API: ", error);
  }
};


const callback = async (req, res) => {
  const authorizationCode = req.query.code;

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

      // Handle response, maybe save token etc.
      res.send("Success"); // Or redirect, etc.
    } catch (error) {
      console.error("Error in callback: ", error);
      res.status(500).send("Internal Server Error");
    }
  } else {
    res.status(400).send("Bad Request");
  }
};

module.exports = { useUberAPI, refreshAccessToken, callback };

