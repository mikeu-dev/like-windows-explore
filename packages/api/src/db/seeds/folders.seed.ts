import { DbType } from "../connection";
import { folders } from "../schema";

export async function seedFolders(db: DbType) {
  // 1. Root Level Folders
  const [docFolder, picFolder, musicFolder, downloadFolder, oneDriveFolder] = await db
    .insert(folders)
    .values([
      { name: "Documents", parentId: null },
      { name: "Pictures", parentId: null },
      { name: "Music", parentId: null },
      { name: "Downloads", parentId: null },
      { name: "OneDrive", parentId: null }
    ])
    .returning();

  // 2. Subfolders under Documents
  const [workFolder, personalFolder, archiveFolder, projectsFolder] = await db
    .insert(folders)
    .values([
      { name: "Work", parentId: docFolder.id },
      { name: "Personal", parentId: docFolder.id },
      { name: "Archive", parentId: docFolder.id },
      { name: "Projects", parentId: docFolder.id }
    ])
    .returning();

  // 3. Subfolders under Pictures
  const [vacationFolder, projectsPicFolder] = await db
    .insert(folders)
    .values([
      { name: "Vacation 2025", parentId: picFolder.id },
      { name: "Design Assets", parentId: picFolder.id }
    ])
    .returning();

  // 4. Subfolders under OneDrive
  const [oneDriveDocs, oneDrivePics, oneDriveBackups] = await db
    .insert(folders)
    .values([
      { name: "Shared Documents", parentId: oneDriveFolder.id },
      { name: "Family Photos", parentId: oneDriveFolder.id },
      { name: "System Backups", parentId: oneDriveFolder.id }
    ])
    .returning();

  // 5. Nested Folder under Archive (3rd Level)
  const [archive2024, archive2025] = await db
    .insert(folders)
    .values([
      { name: "2024 Records", parentId: archiveFolder.id },
      { name: "2025 Records", parentId: archiveFolder.id }
    ])
    .returning();

  // 6. Deeply nested folder (4th Level)
  const [taxes2024] = await db
    .insert(folders)
    .values([{ name: "Tax Returns", parentId: archive2024.id }])
    .returning();

  // --- PROGRAMMATIC ENRICHMENT ---

  // 7. Subfolders under Music (Genres)
  const genreFolders = await db
    .insert(folders)
    .values([
      { name: "Rock & Metal", parentId: musicFolder.id },
      { name: "Jazz & Blues", parentId: musicFolder.id },
      { name: "Classical", parentId: musicFolder.id },
      { name: "Lo-Fi Beats", parentId: musicFolder.id },
      { name: "Pop Favorites", parentId: musicFolder.id },
      { name: "Electronic & Dance", parentId: musicFolder.id }
    ])
    .returning();

  // 8. Subfolders under Downloads (Categories)
  const downloadFolders = await db
    .insert(folders)
    .values([
      { name: "Installers", parentId: downloadFolder.id },
      { name: "PDF Receipts", parentId: downloadFolder.id },
      { name: "Zip Archives", parentId: downloadFolder.id },
      { name: "Torrent Torrents", parentId: downloadFolder.id }
    ])
    .returning();

  // 9. Subfolders under Projects
  const projectFolders = await db
    .insert(folders)
    .values([
      { name: "Project Alpha", parentId: projectsFolder.id },
      { name: "Project Beta", parentId: projectsFolder.id },
      { name: "Website Redesign", parentId: projectsFolder.id },
      { name: "Mobile App Prototype", parentId: projectsFolder.id },
      { name: "E-Commerce Integration", parentId: projectsFolder.id }
    ])
    .returning();

  // 10. Subfolders under Vacation 2025
  const vacationDayFolders = await db
    .insert(folders)
    .values([
      { name: "Day 1 - Arrival & Hotel", parentId: vacationFolder.id },
      { name: "Day 2 - Beach Picnic", parentId: vacationFolder.id },
      { name: "Day 3 - Mountain Hiking", parentId: vacationFolder.id },
      { name: "Day 4 - City Exploration", parentId: vacationFolder.id }
    ])
    .returning();

  // 11. Subfolders under Personal
  const personalSubfolders = await db
    .insert(folders)
    .values([
      { name: "Finances & Taxes", parentId: personalFolder.id },
      { name: "Fitness & Health", parentId: personalFolder.id },
      { name: "Travel Plans", parentId: personalFolder.id }
    ])
    .returning();

  // 12. Subfolders under OneDrive Backups
  const backupFolders = await db
    .insert(folders)
    .values([
      { name: "Database Dumps", parentId: oneDriveBackups.id },
      { name: "Config Backups", parentId: oneDriveBackups.id }
    ])
    .returning();

  return {
    workFolder,
    personalFolder,
    vacationFolder,
    projectsPicFolder,
    taxes2024,
    downloadFolder,
    oneDriveFolder,
    projectsFolder,
    oneDriveDocs,
    genreFolders,
    downloadFolders,
    projectFolders,
    vacationDayFolders,
    personalSubfolders,
    backupFolders
  };
}
export type SeededFolderIds = Awaited<ReturnType<typeof seedFolders>>;
