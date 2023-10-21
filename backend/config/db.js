// Import required modules and load environment variables
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');

// Retrieve MongoDB URL from environment variables
const uri = process.env.MONGODB_URL;

// Configure MongoDB client options
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// Define an asynchronous function to connect to MongoDB
async function connectDB() {
  try {
    // Connect the client to the server
    await client.connect();
    
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    
    // Log successful connection
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

    return client;
} catch (error) {
  console.dir(error);
  return null;
}
}

// Run the connectDB function
connectDB();
module.exports = { connectDB };