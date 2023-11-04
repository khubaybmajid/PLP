const express = require('express');
const axios = require('axios');
const qs = require('qs');
const { connectDB, getApiTokensCollection } = require('./config/db');

const app = express();

app.use(express.json());

const PORT = 5004;
const CLIENT_ID = 'bksVmm0C5_8-zr_oRLaAqR5THjp_IlYO';
const CLIENT_SECRET = 'YkV0l3Q5Vx9ssVmnKfRcWQmcT1heMPFoOOwcWHwT';
const REDIRECT_URI = 'http://localhost:5004/callback';

app.get('/callback', async (req, res) => {
  const authorizationCode = req.query.code;

  if (authorizationCode) {
    try {
      const response = await axios.post('https://login.uber.com/oauth/v2/token', qs.stringify({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: 'authorization_code',
        redirect_uri: REDIRECT_URI,
        code: authorizationCode,
      }), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      const { access_token: accessToken, refresh_token: refreshToken, expires_in } = response.data;

      const userId = "Dezerts";  // Replace with actual user identification logic
      const expiresAt = new Date().getTime() + (expires_in * 1000);

      // Fetch the collection and insert the document
      const apiTokensCollection = getApiTokensCollection();
      await apiTokensCollection.insertOne({ userId, accessToken, refreshToken, expiresAt });

      res.send('Authorization successful');
    } catch (error) {
      console.log(error);
      res.send('An error occurred. Please try again.');
    }
  } else {
    res.send('Missing authorization code');
  }
});

// Initialize the database connection before starting the server
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch(err => console.log(err));

