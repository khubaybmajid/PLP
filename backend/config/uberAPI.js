require('dotenv').config();

const uberCredentials = {
  clientID: process.env.UBER_CLIENT_ID,
  clientSecret: process.env.UBER_CLIENT_SECRET,
  serverToken: process.env.UBER_SERVER_TOKEN,
};

module.exports = uberCredentials;
