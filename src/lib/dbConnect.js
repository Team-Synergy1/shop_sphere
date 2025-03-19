
import { MongoClient, ServerApiVersion } from 'mongodb';
const uri= process.env.DB_URI;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function dbConnect(collectionName) {
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    return client.db(process.env.DB_NAME).collection(collectionName);
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw error; // Rethrow the error to handle it in the calling function
  }
}

export default dbConnect
// Create a MongoClient with a MongoClientOptions object to set the Stable API version



