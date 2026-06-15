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

  return {
    workFolder,
    personalFolder,
    vacationFolder,
    projectsPicFolder,
    taxes2024,
    downloadFolder,
    oneDriveFolder,
    projectsFolder,
    oneDriveDocs
  };
}
export type SeededFolderIds = Awaited<ReturnType<typeof seedFolders>>;
