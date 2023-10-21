const express = require('express');
const axios = require('axios');
const qs = require('qs');
const { saveToken, getToken } = require('../models/ApiToken');
const { UBER_CLIENT_ID, UBER_CLIENT_SECRET } = process.env;

const app = express();
const PORT = process.env.PORT || 5004;

app.get('/callback', async (req, res) => {
  const authorizationCode = req.query.code;

  try {
    const response = await axios.post('https://login.uber.com/oauth/v2/token', qs.stringify({
      client_id: UBER_CLIENT_ID,
      client_secret: UBER_CLIENT_SECRET,
      grant_type: 'authorization_code',
      redirect_uri: 'http://localhost:5004/callback', // Make sure this matches with the redirect_uri you've registered in Uber developer console.
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

    res.redirect('/'); // Redirect to home or another page
  } catch (error) {
    console.error('Error in OAuth callback:', error);
    res.status(500).send('Internal Server Error');
  }
});

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
        'Content-Type': 'application/x-www-form-urlencoded'
      }
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
    let { accessToken, expiresAt } = tokenData;
    const now = new Date().getTime();
  
    if (now >= expiresAt) {
      accessToken = await refreshAccessToken();
    }
  
    const options = {
      method,
      url: apiEndpoint,
      headers: {
        'Authorization': `Bearer ${accessToken}`
      },
      data
    };
  
    const response = await axios(options);
    return response.data;
  };

// Start the server
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});

module.exports = { useUberAPI };
