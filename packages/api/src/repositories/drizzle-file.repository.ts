import { IFileRepository } from "./file-repository.interface";
import { File } from "../domain/entities/file";
import { db } from "../db/connection";
import { files } from "../db/schema";
import { eq, ilike } from "drizzle-orm";

export class DrizzleFileRepository implements IFileRepository {
  async findFilesByFolderId(folderId: string): Promise<File[]> {
    return await db.select().from(files).where(eq(files.folderId, folderId)).orderBy(files.name);
  }

  async findById(id: string): Promise<File | null> {
    const result = await db.select().from(files).where(eq(files.id, id));
    return result[0] || null;
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

  async delete(id: string): Promise<void> {
    await db.delete(files).where(eq(files.id, id));
  }

  async update(id: string, file: Partial<Omit<File, "id" | "createdAt" | "updatedAt">>): Promise<File> {
    const result = await db
      .update(files)
      .set({ ...file, updatedAt: new Date() })
      .where(eq(files.id, id))
      .returning();
    return result[0];
  }
}
