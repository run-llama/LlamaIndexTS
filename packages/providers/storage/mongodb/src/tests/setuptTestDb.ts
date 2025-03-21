import { MongoClient } from "mongodb";
import { MongoMemoryServer } from "mongodb-memory-server";

//setup a in memory test db for testing
export async function setupTestDb() {
  const mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  const mongoClient = new MongoClient(mongoUri);
  await mongoClient.connect();

  return {
    mongoServer,
    mongoClient,
    mongoUri,
    // return a cleanup function to close the db and stop the server
    cleanup: async () => {
      await mongoClient.close();
      await mongoServer.stop();
    },
  };
}
