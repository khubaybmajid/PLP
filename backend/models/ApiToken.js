const { connectDB } = require('../config/db'); // Import the main function from your db.js file

// Save token function
const saveToken = async (accessToken, refreshToken, expiresAt) => {
  const client = await connectDB();
  const db = client.db('PlatformDatabase');
  const collection = db.collection('apiTokens');

  // Caution: This will delete all existing tokens in the collection
  await collection.deleteMany({}); 

  // Save the new token
  await collection.insertOne({ accessToken, refreshToken, expiresAt });
};

// Get token function
const getToken = async () => {
  const client = await connectDB();
  const db = client.db('PlatformDatabase');
  const collection = db.collection('apiTokens');

  const token = await collection.findOne({});

  // Be cautious about logging sensitive information in production
  console.log("Retrieved token: ", token);

  return token;
};

module.exports = { saveToken, getToken };
