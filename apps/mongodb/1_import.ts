/* eslint-disable turbo/no-undeclared-env-vars */
import * as dotenv from "dotenv";
import * as fs from "fs";
import { MongoClient } from "mongodb";

// Load environment variables from local .env file
dotenv.config();

const jsonFile = "tinytweets.json";
const mongoUri = process.env.MONGODB_URI!;
const databaseName = process.env.MONGODB_DATABASE!;
const collectionName = process.env.MONGODB_COLLECTION!;

async function importJsonToMongo() {
  // Load the tweets from a local file
  const tweets = JSON.parse(fs.readFileSync(jsonFile, "utf-8"));

  // Create a new client and connect to the server
  const client = new MongoClient(mongoUri);

  const db = client.db(databaseName);
  const collection = db.collection(collectionName);

  // Insert the tweets into mongo
  await collection.insertMany(tweets);

  console.log(
    `Data imported successfully to the MongoDB collection ${collectionName}.`,
  );
  await client.close();
}

// Run the import function
importJsonToMongo();
