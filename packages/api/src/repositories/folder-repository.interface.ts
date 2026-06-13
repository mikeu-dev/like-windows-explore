import { Folder } from "../domain/entities/folder";

export interface IFolderRepository {
  findSubfolders(parentId: string | null): Promise<(Folder & { hasChildren: boolean })[]>;
  findById(id: string): Promise<Folder | null>;
  searchFolders(query: string): Promise<Folder[]>;
  create(folder: Omit<Folder, "id" | "createdAt" | "updatedAt">): Promise<Folder>;
}
