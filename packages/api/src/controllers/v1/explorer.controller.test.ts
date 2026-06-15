import { describe, expect, it, mock } from "bun:test";

// Mock the ExplorerService module before importing explorerController
mock.module("../../services/explorer.service", () => {
  return {
    ExplorerService: class {
      getShortcutFolderIds = mock(() => Promise.resolve({ documents: "1", pictures: "2" }));
      getSubfolders = mock((parentId: string | null) =>
        Promise.resolve([{ id: "1", name: "Documents", parentId }])
      );
      getFolderContents = mock((_id: string) => Promise.resolve({ subfolders: [], files: [] }));
      getFolderPath = mock((_id: string) => Promise.resolve([]));
      search = mock((_q: string) => Promise.resolve([]));
      createFolder = mock((name: string, _parentId: string | null) =>
        Promise.resolve({ id: "3", name })
      );
      createFile = mock((name: string, _folderId: string, _size: number) =>
        Promise.resolve({ id: "101", name })
      );
      renameFolder = mock((id: string, name: string) => Promise.resolve({ id, name }));
      moveFolder = mock((id: string, parentId: string | null) => Promise.resolve({ id, parentId }));
      renameFile = mock((id: string, name: string) => Promise.resolve({ id, name }));
      moveFile = mock((id: string, folderId: string) => Promise.resolve({ id, folderId }));
      copyFolder = mock((_id: string, _parentId: string | null) =>
        Promise.resolve({ id: "copy-id" })
      );
      copyFile = mock((_id: string, _folderId: string) => Promise.resolve({ id: "copy-file-id" }));
      deleteFolder = mock((_id: string) => Promise.resolve());
      deleteFile = mock((_id: string) => Promise.resolve());
    }
  };
});

// Import the controller dynamically to ensure mock.module runs first
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { explorerController } = require("./explorer.controller");

explorerController.onError(({ error }: { error: any }) => {
  console.error("ELYSIA_ERROR:", error);
});

describe("ExplorerController Unit Tests", () => {
  it("GET /shortcuts should return shortcut folder IDs", async () => {
    const response = await explorerController.handle(new Request("http://localhost/v1/shortcuts"));
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual({ documents: "1", pictures: "2" });
  });

  it("GET /folders should return list of subfolders", async () => {
    const response = await explorerController.handle(
      new Request("http://localhost/v1/folders?parentId=1")
    );
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual([{ id: "1", name: "Documents", parentId: "1" }]);
  });

  it("POST /folders should create a new folder", async () => {
    const response = await explorerController.handle(
      new Request("http://localhost/v1/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "New Folder", parentId: null })
      })
    );
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual({ id: "3", name: "New Folder" });
  });

  it("DELETE /folders/:id should delete folder and return success", async () => {
    const response = await explorerController.handle(
      new Request("http://localhost/v1/folders/123", {
        method: "DELETE"
      })
    );
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual({ success: true });
  });
});
