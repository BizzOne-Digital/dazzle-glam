import { connectDB } from "../lib/db/connect";
import mongoose from "mongoose";

async function migrate() {
  try {
    console.log("Connecting to database...");
    await connectDB();

    const db = mongoose.connection.db;
    if (!db) {
      throw new Error("Database connection not established");
    }

    console.log("Dropping old pagecontents collection...");
    try {
      await db.dropCollection("pagecontents");
      console.log("✓ Dropped pagecontents collection");
    } catch (error: any) {
      if (error.code === 26 || error.codeName === "NamespaceNotFound") {
        console.log("✓ Collection doesn't exist, nothing to drop");
      } else {
        throw error;
      }
    }

    console.log("\n✅ Migration completed successfully!");
    console.log("Now run: npm run seed:content");
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

migrate();
