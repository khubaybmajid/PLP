const { apiTokensCollection } = require('../config/db');

// Save token function
const saveToken = async (accessToken, refreshToken, expiresAt) => {
  try {
    // Caution: This will delete all existing tokens in the collection
    await apiTokensCollection.deleteMany({}); 

    // Save the new token
    await apiTokensCollection.insertOne({ accessToken, refreshToken, expiresAt });
    console.log('Token saved successfully');
  } catch (error) {
    console.error('Error saving token:', error);
  }
};

// Get token function
const getToken = async () => {
  try {
    const token = await apiTokensCollection.findOne({});
    console.log("Retrieved token: ", token);
    return token;
  } catch (error) {
    console.error('Error fetching token:', error);
  }
};

module.exports = { saveToken, getToken };
