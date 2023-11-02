const { MongoClient } = require('mongodb');

let client;
let database;
let apiTokensCollection;
let ordersCollection;

// Initialize database connection
async function connectDB() {
  const uri = 'mongodb+srv://nismomajid:Deqsnuqc123@platformcluster.6wpo58h.mongodb.net/?retryWrites=true&w=majority';
   client = new MongoClient(uri);
  
  try {
    // Connect to the MongoDB cluster
    await client.connect();
    console.log("Connected to MongoDB");

    // Select a database
    database = client.db('PlatformDatabase');
    
    // Check if collections exist, create them if they don't
    const collections = await database.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);

    if (!collectionNames.includes('apiTokens')) {
      await database.createCollection('apiTokens');
    }

    if (!collectionNames.includes('orders')) {
      await database.createCollection('orders');
    }

    // Define collections
    apiTokensCollection = database.collection('apiTokens');
    ordersCollection = database.collection('orders');
    
  } catch (error) {
    console.error('An error occurred:', error);
  }
}

module.exports = { connectDB };
