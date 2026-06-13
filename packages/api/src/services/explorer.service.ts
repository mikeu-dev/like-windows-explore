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

  // Membuat Folder Baru
  async createFolder(name: string, parentId: string | null): Promise<FolderDTO> {
    const folder = await this.folderRepo.create({ name, parentId });
    return {
      id: folder.id,
      name: folder.name,
      parentId: folder.parentId,
      hasChildren: false
    };
  }

  // Membuat Berkas Baru
  async createFile(name: string, folderId: string, size: number = 0): Promise<FileDTO> {
    const file = await this.fileRepo.create({ name, folderId, size });
    return {
      id: file.id,
      name: file.name,
      size: file.size,
      folderId: file.folderId
    };
  }

  // Menghapus Folder
  async deleteFolder(id: string): Promise<void> {
    await this.folderRepo.delete(id);
  }

  // Menghapus Berkas
  async deleteFile(id: string): Promise<void> {
    await this.fileRepo.delete(id);
  }

  // Mengubah Nama Folder
  async renameFolder(id: string, name: string): Promise<FolderDTO> {
    const folder = await this.folderRepo.update(id, { name });
    const subfolders = await this.folderRepo.findSubfolders(id);
    return {
      id: folder.id,
      name: folder.name,
      parentId: folder.parentId,
      hasChildren: subfolders.length > 0
    };
  }

  // Mengubah Nama Berkas
  async renameFile(id: string, name: string): Promise<FileDTO> {
    const file = await this.fileRepo.update(id, { name });
    return {
      id: file.id,
      name: file.name,
      size: file.size,
      folderId: file.folderId
    };
  }

  // Memindahkan Folder (Cut & Paste)
  async moveFolder(id: string, parentId: string | null): Promise<FolderDTO> {
    const folder = await this.folderRepo.update(id, { parentId });
    const subfolders = await this.folderRepo.findSubfolders(id);
    return {
      id: folder.id,
      name: folder.name,
      parentId: folder.parentId,
      hasChildren: subfolders.length > 0
    };
  }

  // Memindahkan Berkas (Cut & Paste)
  async moveFile(id: string, folderId: string): Promise<FileDTO> {
    const file = await this.fileRepo.update(id, { folderId });
    return {
      id: file.id,
      name: file.name,
      size: file.size,
      folderId: file.folderId
    };
  }

  // Menyalin Folder secara Rekursif (Copy & Paste)
  async copyFolder(id: string, parentId: string | null): Promise<FolderDTO> {
    const srcFolder = await this.folderRepo.findById(id);
    if (!srcFolder) throw new Error("Folder sumber tidak ditemukan");

    // Tentukan nama untuk folder duplikat jika berada di tingkat yang sama
    const name = srcFolder.parentId === parentId ? `${srcFolder.name} - Copy` : srcFolder.name;
    const copiedFolder = await this.folderRepo.create({ name, parentId });

    // Rekursi untuk menyalin semua subfolder di dalamnya
    const subfolders = await this.folderRepo.findSubfolders(id);
    for (const sub of subfolders) {
      await this.copyFolderInternal(sub.id, copiedFolder.id);
    }

    // Salin semua berkas di dalamnya
    const files = await this.fileRepo.findFilesByFolderId(id);
    for (const file of files) {
      await this.fileRepo.create({
        name: file.name,
        size: file.size,
        folderId: copiedFolder.id
      });
    }

    return {
      id: copiedFolder.id,
      name: copiedFolder.name,
      parentId: copiedFolder.parentId,
      hasChildren: subfolders.length > 0
    };
  }

  private async copyFolderInternal(id: string, parentId: string | null): Promise<void> {
    const srcFolder = await this.folderRepo.findById(id);
    if (!srcFolder) return;

    const copiedFolder = await this.folderRepo.create({ name: srcFolder.name, parentId });

    const subfolders = await this.folderRepo.findSubfolders(id);
    for (const sub of subfolders) {
      await this.copyFolderInternal(sub.id, copiedFolder.id);
    }

    const files = await this.fileRepo.findFilesByFolderId(id);
    for (const file of files) {
      await this.fileRepo.create({
        name: file.name,
        size: file.size,
        folderId: copiedFolder.id
      });
    }
  }

  // Menyalin Berkas (Copy & Paste)
  async copyFile(id: string, folderId: string): Promise<FileDTO> {
    const srcFile = await this.fileRepo.findById(id);
    if (!srcFile) throw new Error("Berkas sumber tidak ditemukan");

    const name = srcFile.folderId === folderId
      ? `${srcFile.name.split(".").shift()} - Copy.${srcFile.name.split(".").pop()}`
      : srcFile.name;

    const copiedFile = await this.fileRepo.create({
      name,
      size: srcFile.size,
      folderId
    });

    return {
      id: copiedFile.id,
      name: copiedFile.name,
      size: copiedFile.size,
      folderId: copiedFile.folderId
    };
  }
}
