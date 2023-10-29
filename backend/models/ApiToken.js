require('dotenv').config();
const mongoose = require('mongoose');

// Define schema for tokens
const TokenSchema = new mongoose.Schema({
  accessToken: String,
  refreshToken: String,
  expiresAt: Date
});

// Compile schema into a model
const TokenModel = mongoose.model('ApiToken', TokenSchema);

// Save token function
const saveToken = async (accessToken, refreshToken, expiresAt) => {
  // Caution: This will delete all existing tokens in the collection
  await TokenModel.deleteMany({}); 

  // Save the new token
  const token = new TokenModel({ accessToken, refreshToken, expiresAt });
  await token.save();
};

// Get token function
const getToken = async () => {
  const token = await TokenModel.findOne({});
  
  // Be cautious about logging sensitive information in production
  console.log("Retrieved token: ", token);
  
  return token;
};

module.exports = { saveToken, getToken };
