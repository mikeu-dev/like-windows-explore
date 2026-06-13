import { File } from "../domain/entities/file";

export interface IFileRepository {
  findFilesByFolderId(folderId: string): Promise<File[]>;
  findById(id: string): Promise<File | null>;
  searchFiles(query: string): Promise<File[]>;
  create(file: Omit<File, "id" | "createdAt" | "updatedAt">): Promise<File>;
  delete(id: string): Promise<void>;
  update(id: string, file: Partial<Omit<File, "id" | "createdAt" | "updatedAt">>): Promise<File>;
}
