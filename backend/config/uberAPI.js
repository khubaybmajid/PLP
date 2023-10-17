require('dotenv').config();

let accessToken = process.env.UBER_ACCESS_TOKEN; // Assuming you set initial values in environment variables
let refreshToken = process.env.UBER_REFRESH_TOKEN;
let tokenExpiration = Date.now() + 3600 * 1000; // Token expires in 1 hour initially

module.exports = {
  clientID: process.env.UBER_CLIENT_ID,
  clientSecret: process.env.UBER_CLIENT_SECRET,
  serverToken: process.env.UBER_SERVER_TOKEN,
  accessToken,
  refreshToken,
  tokenExpiration,
};
