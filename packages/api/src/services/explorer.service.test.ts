import { describe, expect, it, mock } from "bun:test";
import { ExplorerService } from "./explorer.service";
import { IFolderRepository } from "../repositories/folder-repository.interface";
import { IFileRepository } from "../repositories/file-repository.interface";
import { Folder } from "../domain/entities/folder";
import { File } from "../domain/entities/file";

describe("ExplorerService Unit Tests", () => {
  // Mock Data
  const mockFolders: (Folder & { hasChildren: boolean })[] = [
    {
      id: "1",
      name: "Documents",
      parentId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      hasChildren: true
    },
    {
      id: "2",
      name: "Pictures",
      parentId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      hasChildren: false
    }
  ];

  const mockSubfolders: (Folder & { hasChildren: boolean })[] = [
    {
      id: "3",
      name: "Work",
      parentId: "1",
      createdAt: new Date(),
      updatedAt: new Date(),
      hasChildren: false
    }
  ];

  const mockFiles: File[] = [
    {
      id: "101",
      name: "resume.pdf",
      size: 500,
      folderId: "1",
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  // Mock Repositories
  const mockFolderRepo: IFolderRepository = {
    findSubfolders: mock((parentId: string | null) => {
      if (parentId === null) return Promise.resolve(mockFolders);
      if (parentId === "1") return Promise.resolve(mockSubfolders);
      return Promise.resolve([]);
    }),
    findById: mock((id: string) => {
      if (id === "1") return Promise.resolve(mockFolders[0]);
      if (id === "3") return Promise.resolve(mockSubfolders[0]);
      return Promise.resolve(null);
    }),
    searchFolders: mock((_query: string) => Promise.resolve([])),
    create: mock((_folder: any) => Promise.resolve({} as any)),
    delete: mock((_id: string) => Promise.resolve()),
    update: mock((_id: string, _folder: any) => Promise.resolve({} as any))
  };

  const mockFileRepo: IFileRepository = {
    findFilesByFolderId: mock((folderId: string) => {
      if (folderId === "1") return Promise.resolve(mockFiles);
      return Promise.resolve([]);
    }),
    findById: mock((id: string) => {
      if (id === "101") return Promise.resolve(mockFiles[0]);
      return Promise.resolve(null);
    }),
    searchFiles: mock((_query: string) => Promise.resolve([])),
    create: mock((_file: any) => Promise.resolve({} as any)),
    delete: mock((_id: string) => Promise.resolve()),
    update: mock((_id: string, _file: any) => Promise.resolve({} as any))
  };

  const service = new ExplorerService(mockFolderRepo, mockFileRepo);

  it("should get root folders correctly", async () => {
    const root = await service.getSubfolders(null);
    expect(root).toHaveLength(2);
    expect(root[0].name).toBe("Documents");
    expect(root[0].hasChildren).toBe(true);
    expect(root[1].name).toBe("Pictures");
    expect(root[1].hasChildren).toBe(false);
  });

  it("should get folder contents correctly", async () => {
    const contents = await service.getFolderContents("1");
    expect(contents.subfolders).toHaveLength(1);
    expect(contents.subfolders[0].name).toBe("Work");
    expect(contents.files).toHaveLength(1);
    expect(contents.files[0].name).toBe("resume.pdf");
  });

  it("should construct folder breadcrumb path recursively upwards", async () => {
    // Path for folder ID "3" (Work, child of Documents)
    const path = await service.getFolderPath("3");
    expect(path).toHaveLength(2);
    expect(path[0].name).toBe("Documents"); // Root folder first
    expect(path[1].name).toBe("Work"); // Subfolder
  });

  describe("Auto-Rename Duplicates Tests", () => {
    it("should auto-rename folder when creating a duplicate", async () => {
      mockFolderRepo.findSubfolders = mock((parentId: string | null) => {
        if (parentId === "1") {
          return Promise.resolve([
            {
              id: "3",
              name: "Work",
              parentId: "1",
              createdAt: new Date(),
              updatedAt: new Date(),
              hasChildren: false
            }
          ]);
        }
        return Promise.resolve([]);
      });

      const createSpy = mock((folder: any) =>
        Promise.resolve({
          id: "99",
          name: folder.name,
          parentId: folder.parentId,
          createdAt: new Date(),
          updatedAt: new Date()
        })
      );
      mockFolderRepo.create = createSpy;

      await service.createFolder("Work", "1");
      expect(createSpy).toHaveBeenCalledWith({ name: "Work (2)", parentId: "1" });
    });

    it("should auto-rename file when creating a duplicate", async () => {
      mockFileRepo.findFilesByFolderId = mock((folderId: string) => {
        if (folderId === "1") {
          return Promise.resolve([
            {
              id: "101",
              name: "resume.pdf",
              size: 500,
              folderId: "1",
              createdAt: new Date(),
              updatedAt: new Date()
            }
          ]);
        }
        return Promise.resolve([]);
      });

      const createSpy = mock((file: any) =>
        Promise.resolve({
          id: "102",
          name: file.name,
          size: file.size,
          folderId: file.folderId,
          createdAt: new Date(),
          updatedAt: new Date()
        })
      );
      mockFileRepo.create = createSpy;

      await service.createFile("resume.pdf", "1", 500);
      expect(createSpy).toHaveBeenCalledWith({ name: "resume (2).pdf", folderId: "1", size: 500 });
    });

    it("should auto-rename file during copy if it conflicts", async () => {
      mockFileRepo.findById = mock((id: string) => {
        if (id === "101") {
          return Promise.resolve({
            id: "101",
            name: "resume.pdf",
            size: 500,
            folderId: "1",
            createdAt: new Date(),
            updatedAt: new Date()
          });
        }
        return Promise.resolve(null);
      });

      mockFileRepo.findFilesByFolderId = mock((folderId: string) => {
        if (folderId === "2") {
          return Promise.resolve([
            {
              id: "201",
              name: "resume.pdf",
              size: 500,
              folderId: "2",
              createdAt: new Date(),
              updatedAt: new Date()
            }
          ]);
        }
        return Promise.resolve([]);
      });

      const createSpy = mock((file: any) =>
        Promise.resolve({
          id: "202",
          name: file.name,
          size: file.size,
          folderId: file.folderId,
          createdAt: new Date(),
          updatedAt: new Date()
        })
      );
      mockFileRepo.create = createSpy;

      await service.copyFile("101", "2");
      expect(createSpy).toHaveBeenCalledWith({ name: "resume (2).pdf", size: 500, folderId: "2" });
    });
  });
});
