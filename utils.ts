import { MongoClient } from 'mongodb';

export function handleMongoError(error: Error): void {
  console.error('An error occurred while interacting with MongoDB:', error);
}

export async function connectToMongoDB(connectionString: string): Promise<MongoClient> {
  try {
    const client = new MongoClient(connectionString);
    await client.connect();
    return client;
  } catch (error) {
    handleMongoError(error);
  }
}
