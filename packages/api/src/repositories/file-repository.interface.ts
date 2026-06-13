import { File } from "../domain/entities/file";

export interface IFileRepository {
  findFilesByFolderId(folderId: string): Promise<File[]>;
  searchFiles(query: string): Promise<File[]>;
  create(file: Omit<File, "id" | "createdAt" | "updatedAt">): Promise<File>;
}
