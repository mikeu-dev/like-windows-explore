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
    const uniqueName = await this.getUniqueFolderName(name, parentId);
    const folder = await this.folderRepo.create({ name: uniqueName, parentId });
    return {
      id: folder.id,
      name: folder.name,
      parentId: folder.parentId,
      hasChildren: false
    };
  }

  // Create New File
  async createFile(name: string, folderId: string, size: number = 0): Promise<FileDTO> {
    const uniqueName = await this.getUniqueFileName(name, folderId);
    const file = await this.fileRepo.create({ name: uniqueName, folderId, size });
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
    const folderObj = await this.folderRepo.findById(id);
    if (!folderObj) throw new Error("Folder tidak ditemukan");
    const uniqueName = await this.getUniqueFolderName(name, folderObj.parentId, id);
    const folder = await this.folderRepo.update(id, { name: uniqueName });
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
    const fileObj = await this.fileRepo.findById(id);
    if (!fileObj) throw new Error("Berkas tidak ditemukan");
    const uniqueName = await this.getUniqueFileName(name, fileObj.folderId, id);
    const file = await this.fileRepo.update(id, { name: uniqueName });
    return {
      id: file.id,
      name: file.name,
      size: file.size,
      folderId: file.folderId
    };
  }

  // Move Folder (Cut & Paste)
  async moveFolder(id: string, parentId: string | null): Promise<FolderDTO> {
    const folderObj = await this.folderRepo.findById(id);
    if (!folderObj) throw new Error("Folder tidak ditemukan");
    const uniqueName = await this.getUniqueFolderName(folderObj.name, parentId, id);
    const folder = await this.folderRepo.update(id, { parentId, name: uniqueName });
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
    const fileObj = await this.fileRepo.findById(id);
    if (!fileObj) throw new Error("Berkas tidak ditemukan");
    const uniqueName = await this.getUniqueFileName(fileObj.name, folderId, id);
    const file = await this.fileRepo.update(id, { folderId, name: uniqueName });
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
    const baseCopyName =
      srcFolder.parentId === parentId ? `${srcFolder.name} - Copy` : srcFolder.name;
    const uniqueName = await this.getUniqueFolderName(baseCopyName, parentId);
    const copiedFolder = await this.folderRepo.create({ name: uniqueName, parentId });

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

    const dotIndex = srcFile.name.lastIndexOf(".");
    const baseName = dotIndex !== -1 ? srcFile.name.slice(0, dotIndex) : srcFile.name;
    const ext = dotIndex !== -1 ? srcFile.name.slice(dotIndex) : "";

    const baseCopyName = srcFile.folderId === folderId ? `${baseName} - Copy${ext}` : srcFile.name;
    const uniqueName = await this.getUniqueFileName(baseCopyName, folderId);

    const copiedFile = await this.fileRepo.create({
      name: uniqueName,
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

  // Helper to generate a unique folder name in the target directory (case-insensitive)
  private async getUniqueFolderName(
    name: string,
    parentId: string | null,
    excludeId?: string
  ): Promise<string> {
    const existingFolders = await this.folderRepo.findSubfolders(parentId);
    const existingNames = new Set(
      existingFolders
        .filter((f) => !excludeId || f.id !== excludeId)
        .map((f) => f.name.toLowerCase())
    );

    let targetName = name;
    if (!existingNames.has(targetName.toLowerCase())) {
      return targetName;
    }

    const match = name.match(/(.+)\s\((\d+)\)$/);
    let baseName = name;
    let counter = 2;

    if (match) {
      baseName = match[1];
      counter = parseInt(match[2], 10);
    }

    while (existingNames.has(targetName.toLowerCase())) {
      targetName = `${baseName} (${counter})`;
      counter++;
    }

    return targetName;
  }

  // Helper to generate a unique file name in the target directory (case-insensitive)
  private async getUniqueFileName(
    name: string,
    folderId: string,
    excludeId?: string
  ): Promise<string> {
    const existingFiles = await this.fileRepo.findFilesByFolderId(folderId);
    const existingNames = new Set(
      existingFiles.filter((f) => !excludeId || f.id !== excludeId).map((f) => f.name.toLowerCase())
    );

    let targetName = name;
    if (!existingNames.has(targetName.toLowerCase())) {
      return targetName;
    }

    const dotIndex = name.lastIndexOf(".");
    const baseName = dotIndex !== -1 ? name.slice(0, dotIndex) : name;
    const ext = dotIndex !== -1 ? name.slice(dotIndex) : "";

    const match = baseName.match(/(.+)\s\((\d+)\)$/);
    let realBase = baseName;
    let counter = 2;

    if (match) {
      realBase = match[1];
      counter = parseInt(match[2], 10);
    }

    while (existingNames.has(targetName.toLowerCase())) {
      targetName = `${realBase} (${counter})${ext}`;
      counter++;
    }

    return targetName;
  }
}
