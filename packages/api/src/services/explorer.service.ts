import { IFolderRepository } from "../repositories/folder-repository.interface";
import { IFileRepository } from "../repositories/file-repository.interface";
import { FolderDTO, FileDTO, FolderContentsDTO, SearchResultsDTO } from "@explorer/common";

export class ExplorerService {
  constructor(
    private folderRepo: IFolderRepository,
    private fileRepo: IFileRepository
  ) {}

  // Mengambil subfolder bertingkat (lazy loading)
  async getSubfolders(parentId: string | null): Promise<FolderDTO[]> {
    const folders = await this.folderRepo.findSubfolders(parentId);
    return folders.map((f) => ({
      id: f.id,
      name: f.name,
      parentId: f.parentId,
      hasChildren: f.hasChildren
    }));
  }

  // Mengambil subfolder dan file dari folder tertentu (panel kanan)
  async getFolderContents(folderId: string): Promise<FolderContentsDTO> {
    const [folders, files] = await Promise.all([
      this.folderRepo.findSubfolders(folderId),
      this.fileRepo.findFilesByFolderId(folderId)
    ]);

    return {
      subfolders: folders.map((f) => ({
        id: f.id,
        name: f.name,
        parentId: f.parentId,
        hasChildren: f.hasChildren
      })),
      files: files.map((f) => ({
        id: f.id,
        name: f.name,
        size: f.size,
        folderId: f.folderId
      }))
    };
  }

  // Mendapatkan path lengkap untuk breadcrumb (misal: Root > Documents > Work)
  async getFolderPath(folderId: string): Promise<FolderDTO[]> {
    const path: FolderDTO[] = [];
    let currentId: string | null = folderId;

    // Menelusuri ke atas hingga root (parentId = null)
    // Umumnya kedalaman folder tidak lebih dari 10-20 level, kueri berulang sangat aman
    while (currentId !== null) {
      const folder = await this.folderRepo.findById(currentId);
      if (!folder) break;

      path.unshift({
        id: folder.id,
        name: folder.name,
        parentId: folder.parentId
      });
      currentId = folder.parentId;
    }

    return path;
  }

  // Pencarian global folder & file
  async search(query: string): Promise<SearchResultsDTO> {
    const trimmedQuery = query.trim();
    if (trimmedQuery.length < 2) {
      return { folders: [], files: [] };
    }

    const [folders, files] = await Promise.all([
      this.folderRepo.searchFolders(trimmedQuery),
      this.fileRepo.searchFiles(trimmedQuery)
    ]);

    return {
      folders: folders.map((f) => ({
        id: f.id,
        name: f.name,
        parentId: f.parentId
      })),
      files: files.map((f) => ({
        id: f.id,
        name: f.name,
        size: f.size,
        folderId: f.folderId
      }))
    };
  }
}
