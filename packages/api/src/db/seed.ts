import { db } from "./connection";
import { folders, files } from "./schema";
import { seedFolders } from "./seeds/folders.seed";
import { seedFiles } from "./seeds/files.seed";

async function main() {
  console.log("Clearing existing database tables...");
  // Clear in correct order due to foreign key constraints
  await db.delete(files);
  await db.delete(folders);

  console.log("Seeding folders...");
  const folderIds = await seedFolders(db);

  console.log("Seeding files...");
  await seedFiles(db, folderIds);

  console.log("Database seeded successfully!");
  process.exit(0);
}

main().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
