import { Db, MongoClient } from "mongodb";

let db: Db;

export const connectDB = async () => {
  console.log("[MONGODB] Connecting to MongoDB");

  try {
    const client = new MongoClient(process.env.MONGODB_URI!);
    
    await client.connect();
    
    db = await client.db(process.env.MONGO_DATABASE);

    console.log("[MONGODB] Connected to MongoDB", db.databaseName);
  } catch(error) {
		console.log(error);
	}
}

export const getDB = () => db;
