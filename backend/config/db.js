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
   // Now let's insert a document
   const db = client.db(); // Use the database already specified in the URI
   const collection = db.collection("testCollection"); // Choose the collection
   
   const result = await collection.insertOne({ name: "John Doe", age: 30 }); // Insert one document
   
   console.log(`Document inserted with ID: ${result.insertedId}`);
   
 } catch (error) {
   // Log any errors
   console.dir(error);
 } finally {
   // Close the client connection
   await client.close();
 }
}

// Run the connectDB function
connectDB();