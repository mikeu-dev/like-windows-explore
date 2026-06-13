import { IFolderRepository } from "./folder-repository.interface";
import { Folder } from "../domain/entities/folder";
import { db } from "../db/connection";
import { folders } from "../db/schema";
import { eq, isNull, ilike, sql } from "drizzle-orm";

export class DrizzleFolderRepository implements IFolderRepository {
  async findSubfolders(parentId: string | null): Promise<(Folder & { hasChildren: boolean })[]> {
    const parentIdColumn = folders.parentId;
    
    // Gunakan subquery EXISTS yang dioptimasi untuk mendeteksi apakah subfolder memiliki anak lagi.
    // Index folders_parent_id_idx akan digunakan oleh PostgreSQL untuk mengoptimalkan EXISTS ini.
    const query = db
      .select({
        id: folders.id,
        name: folders.name,
        parentId: folders.parentId,
        createdAt: folders.createdAt,
        updatedAt: folders.updatedAt,
        hasChildren: sql<boolean>`EXISTS(SELECT 1 FROM ${folders} AS sub WHERE sub.parent_id = ${folders.id})`
      })
      .from(folders);

    let results;
    if (parentId === null) {
      results = await query.where(isNull(parentIdColumn)).orderBy(folders.name);
    } else {
      results = await query.where(eq(parentIdColumn, parentId)).orderBy(folders.name);
    }

    return results;
  }

  async findById(id: string): Promise<Folder | null> {
    const result = await db.select().from(folders).where(eq(folders.id, id));
    return result[0] || null;
  }

  async searchFolders(query: string): Promise<Folder[]> {
    return await db
      .select()
      .from(folders)
      .where(ilike(folders.name, `%${query}%`))
      .orderBy(folders.name)
      .limit(50);
  }

  async create(folder: Omit<Folder, "id" | "createdAt" | "updatedAt">): Promise<Folder> {
    const result = await db.insert(folders).values(folder).returning();
    return result[0];
  }
}
