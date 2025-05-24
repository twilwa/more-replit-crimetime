import { db } from "../server/db";
import { migrate } from "drizzle-orm/neon-serverless/migrator";

// This script pushes the schema to the database
async function main() {
  console.log("Pushing schema to database...");
  
  try {
    await migrate(db, { migrationsFolder: "./drizzle" });
    console.log("Schema pushed successfully!");
  } catch (error) {
    console.error("Error pushing schema to database:", error);
    process.exit(1);
  }
  
  process.exit(0);
}

main();