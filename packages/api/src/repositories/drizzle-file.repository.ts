import { IFileRepository } from "./file-repository.interface";
import { File } from "../domain/entities/file";
import { db } from "../db/connection";
import { files } from "../db/schema";
import { eq, ilike } from "drizzle-orm";

export class DrizzleFileRepository implements IFileRepository {
  async findFilesByFolderId(folderId: string): Promise<File[]> {
    return await db
      .select()
      .from(files)
      .where(eq(files.folderId, folderId))
      .orderBy(files.name);
  }

  async searchFiles(query: string): Promise<File[]> {
    return await db
      .select()
      .from(files)
      .where(ilike(files.name, `%${query}%`))
      .orderBy(files.name)
      .limit(50);
  }

  async create(file: Omit<File, "id" | "createdAt" | "updatedAt">): Promise<File> {
    const result = await db.insert(files).values(file).returning();
    return result[0];
  }
}
