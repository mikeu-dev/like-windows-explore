import { IFolderRepository } from "../repositories/folder-repository.interface";
import { IFileRepository } from "../repositories/file-repository.interface";
import { FolderDTO, FileDTO, FolderContentsDTO, SearchResultsDTO } from "@explorer/common";

export class ExplorerService {
  constructor(
    private folderRepo: IFolderRepository,
    private fileRepo: IFileRepository
  ) {}

  // Fetch subfolders progressively (lazy loading)
  async getSubfolders(parentId: string | null): Promise<FolderDTO[]> {
    const folders = await this.folderRepo.findSubfolders(parentId);
    return folders.map((f) => ({
      id: f.id,
      name: f.name,
      parentId: f.parentId,
      hasChildren: f.hasChildren
    }));
  }

  // Fetch subfolders and files of a specific folder (right panel)
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

  // Get full path for breadcrumbs (e.g., Root > Documents > Work)
  async getFolderPath(folderId: string): Promise<FolderDTO[]> {
    const path: FolderDTO[] = [];
    let currentId: string | null = folderId;

    // Traverse upwards to root (parentId = null)
    // Generally directory depth is less than 10-20 levels; iterative queries are safe
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

  // Global search for folders and files
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

  // Create New Folder
  async createFolder(name: string, parentId: string | null): Promise<FolderDTO> {
    const folder = await this.folderRepo.create({ name, parentId });
    return {
      id: folder.id,
      name: folder.name,
      parentId: folder.parentId,
      hasChildren: false
    };
  }

  // Create New File
  async createFile(name: string, folderId: string, size: number = 0): Promise<FileDTO> {
    const file = await this.fileRepo.create({ name, folderId, size });
    return {
      id: file.id,
      name: file.name,
      size: file.size,
      folderId: file.folderId
    };
  }

  // Delete Folder
  async deleteFolder(id: string): Promise<void> {
    await this.folderRepo.delete(id);
  }

  // Delete File
  async deleteFile(id: string): Promise<void> {
    await this.fileRepo.delete(id);
  }

  // Rename Folder
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

  // Rename File
  async renameFile(id: string, name: string): Promise<FileDTO> {
    const file = await this.fileRepo.update(id, { name });
    return {
      id: file.id,
      name: file.name,
      size: file.size,
      folderId: file.folderId
    };
  }

  // Move Folder (Cut & Paste)
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

  // Move File (Cut & Paste)
  async moveFile(id: string, folderId: string): Promise<FileDTO> {
    const file = await this.fileRepo.update(id, { folderId });
    return {
      id: file.id,
      name: file.name,
      size: file.size,
      folderId: file.folderId
    };
  }

  // Copy Folder Recursively (Copy & Paste)
  async copyFolder(id: string, parentId: string | null): Promise<FolderDTO> {
    const srcFolder = await this.folderRepo.findById(id);
    if (!srcFolder) throw new Error("Folder sumber tidak ditemukan");

    // Determine duplicate folder name if inside the same directory
    const name = srcFolder.parentId === parentId ? `${srcFolder.name} - Copy` : srcFolder.name;
    const copiedFolder = await this.folderRepo.create({ name, parentId });

    // Recursion to copy all subfolders inside
    const subfolders = await this.folderRepo.findSubfolders(id);
    for (const sub of subfolders) {
      await this.copyFolderInternal(sub.id, copiedFolder.id);
    }

    // Copy all files inside
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

  // Copy File (Copy & Paste)
  async copyFile(id: string, folderId: string): Promise<FileDTO> {
    const srcFile = await this.fileRepo.findById(id);
    if (!srcFile) throw new Error("Berkas sumber tidak ditemukan");

    const name =
      srcFile.folderId === folderId
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

  // Get special shortcut folder IDs
  async getShortcutFolderIds(): Promise<Record<string, string>> {
    const shortcuts: Record<string, string> = {
      desktop: "",
      downloads: "",
      documents: "",
      pictures: "",
      music: "",
      videos: "",
      onedrive: "",
      localC: "",
      localD: ""
    };

    // 1. Get root drives (C: and D:)
    const roots = await this.folderRepo.findSubfolders(null);
    const localC = roots.find((r) => r.name.toLowerCase().includes("(c:)"));
    const localD = roots.find((r) => r.name.toLowerCase().includes("(d:)"));
    if (localC) shortcuts.localC = localC.id;
    if (localD) shortcuts.localD = localD.id;

    // 2. Find mikeudev user folder
    const matchingFolders = await this.folderRepo.searchFolders("mikeudev");
    const mikeudevFolder = matchingFolders.find((f) => f.name.toLowerCase() === "mikeudev");
    if (mikeudevFolder) {
      const subfolders = await this.folderRepo.findSubfolders(mikeudevFolder.id);
      const map: Record<string, string> = {
        desktop: "Desktop",
        downloads: "Downloads",
        documents: "Documents",
        pictures: "Pictures",
        music: "Music",
        videos: "Videos",
        onedrive: "OneDrive"
      };

      for (const [key, name] of Object.entries(map)) {
        const found = subfolders.find((sf) => sf.name.toLowerCase() === name.toLowerCase());
        if (found) {
          shortcuts[key] = found.id;
        }
      }
    }

    return shortcuts;
  }
}

