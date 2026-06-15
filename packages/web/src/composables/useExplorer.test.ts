import "../test-env.d.ts";
import { describe, expect, it, mock, beforeEach, spyOn } from "bun:test";
import { useExplorer } from "./useExplorer";
import { FolderDTO } from "@explorer/common";

// Mock data
const mockRootFolders: FolderDTO[] = [
  { id: "1", name: "Documents", parentId: null, hasChildren: true },
  { id: "2", name: "Pictures", parentId: null, hasChildren: false }
];

const mockContents = {
  subfolders: [
    { id: "3", name: "Work", parentId: "1", hasChildren: false },
    { id: "4", name: "Personal", parentId: "1", hasChildren: false }
  ],
  files: [
    { id: "101", name: "resume.pdf", size: 500000, folderId: "1" },
    { id: "102", name: "budget.xlsx", size: 1200000, folderId: "1" }
  ]
};

const mockPath: FolderDTO[] = [{ id: "1", name: "Documents", parentId: null, hasChildren: true }];

// Mock API module
const getSubfoldersMock = mock((parentId: string | null = null) => {
  if (parentId === null) return Promise.resolve(mockRootFolders);
  if (parentId === "1") return Promise.resolve(mockContents.subfolders);
  if (parentId === "onedrive-id") return Promise.resolve([
    { id: "onedrive-sub-1", name: "OneDrive Subfolder", parentId: "onedrive-id", hasChildren: false }
  ]);
  return Promise.resolve([]);
});

const getFolderContentsMock = mock((folderId: string) => {
  if (folderId === "1") return Promise.resolve(mockContents);
  return Promise.resolve({ subfolders: [], files: [] });
});

const getFolderPathMock = mock((folderId: string) => {
  if (folderId === "1") return Promise.resolve(mockPath);
  return Promise.resolve([]);
});

const getShortcutsMock = mock(() => Promise.resolve({
  desktop: "",
  downloads: "",
  documents: "1",
  pictures: "2",
  music: "",
  videos: "",
  onedrive: "onedrive-id",
  localC: "1",
  localD: "2"
}));

const createFolderMock = mock(() => Promise.resolve({} as any));
const createFileMock = mock(() => Promise.resolve({} as any));
const renameFolderMock = mock(() => Promise.resolve({} as any));
const renameFileMock = mock(() => Promise.resolve({} as any));
const deleteFolderMock = mock(() => Promise.resolve(true));
const deleteFileMock = mock(() => Promise.resolve(true));
const moveFolderMock = mock(() => Promise.resolve({} as any));
const moveFileMock = mock(() => Promise.resolve({} as any));
const copyFolderMock = mock(() => Promise.resolve({} as any));
const copyFileMock = mock(() => Promise.resolve({} as any));
const searchMock = mock(() => Promise.resolve({ folders: [], files: [] }));

mock.module("../services/api", () => {
  return {
    explorerApi: {
      getSubfolders: getSubfoldersMock,
      getFolderContents: getFolderContentsMock,
      getFolderPath: getFolderPathMock,
      getShortcuts: getShortcutsMock,
      createFolder: createFolderMock,
      createFile: createFileMock,
      renameFolder: renameFolderMock,
      renameFile: renameFileMock,
      deleteFolder: deleteFolderMock,
      deleteFile: deleteFileMock,
      moveFolder: moveFolderMock,
      moveFile: moveFileMock,
      copyFolder: copyFolderMock,
      copyFile: copyFileMock,
      search: searchMock
    }
  };
});


describe("useExplorer Composable Tests", () => {
  beforeEach(() => {
    // Reset global mocks if necessary
    getSubfoldersMock.mockClear();
    getFolderContentsMock.mockClear();
    getFolderPathMock.mockClear();
    getShortcutsMock.mockClear();
    createFolderMock.mockClear();
    createFileMock.mockClear();
    renameFolderMock.mockClear();
    renameFileMock.mockClear();
    deleteFolderMock.mockClear();
    deleteFileMock.mockClear();
  });

  it("should initialize with default state", () => {
    const explorer = useExplorer();
    expect(explorer.rootFolders.value).toEqual([]);
    expect(explorer.selectedFolderId.value).toBeNull();
    expect(explorer.selectedFolderContents.value).toEqual({ subfolders: [], files: [] });
    expect(explorer.breadcrumbs.value).toEqual([]);
    expect(explorer.searchQuery.value).toBe("");
    expect(explorer.sortBy.value).toBe("name");
    expect(explorer.sortOrder.value).toBe("asc");
    expect(explorer.activeItem.value).toBeNull();
    expect(explorer.clipboard.value).toBeNull();
  });

  it("should load root folders", async () => {
    const explorer = useExplorer();
    await explorer.loadRootFolders();

    expect(getSubfoldersMock).toHaveBeenCalledWith(null);
    expect(explorer.rootFolders.value).toHaveLength(2);
    expect(explorer.rootFolders.value[0].name).toBe("Documents");
    expect(explorer.rootFolders.value[1].name).toBe("Pictures");
  });

  it("should select folder and fetch its contents and path", async () => {
    const explorer = useExplorer();
    await explorer.selectFolder("1");

    expect(getFolderContentsMock).toHaveBeenCalledWith("1");
    expect(getFolderPathMock).toHaveBeenCalledWith("1");
    expect(explorer.selectedFolderId.value).toBe("1");
    expect(explorer.selectedFolderContents.value.subfolders).toHaveLength(2);
    expect(explorer.breadcrumbs.value[0].name).toBe("Documents");
  });

  it("should handle history stack navigation (goBack, goForward, goUp)", async () => {
    const explorer = useExplorer();

    // Initialize root folder map
    await explorer.loadRootFolders();

    // Navigation: root -> folder "1" -> folder "2"
    await explorer.selectFolder("1");
    await explorer.selectFolder("2");

    expect(explorer.selectedFolderId.value).toBe("2");
    expect(explorer.historyStack.value).toEqual(["1"]);

    // Go Back
    explorer.goBack();
    await new Promise((r) => setTimeout(r, 0)); // wait async
    expect(explorer.selectedFolderId.value).toBe("1");
    expect(explorer.forwardStack.value).toEqual(["2"]);

    // Go Forward
    explorer.goForward();
    await new Promise((r) => setTimeout(r, 0));
    expect(explorer.selectedFolderId.value).toBe("2");
    expect(explorer.historyStack.value).toEqual(["1"]);
  });

  it("should sort folders and files based on sortBy and sortOrder", async () => {
    const explorer = useExplorer();
    await explorer.selectFolder("1");

    // Default: Sort by Name (A-Z)
    expect(explorer.sortBy.value).toBe("name");
    expect(explorer.sortOrder.value).toBe("asc");
    expect(explorer.sortedSubfolders.value[0].name).toBe("Personal"); // P < W
    expect(explorer.sortedSubfolders.value[1].name).toBe("Work");
    expect(explorer.sortedFiles.value[0].name).toBe("budget.xlsx"); // b < r
    expect(explorer.sortedFiles.value[1].name).toBe("resume.pdf");

    // Sort by Name (Z-A)
    explorer.sortBy.value = "name";
    explorer.sortOrder.value = "desc";
    expect(explorer.sortedSubfolders.value[0].name).toBe("Work");
    expect(explorer.sortedSubfolders.value[1].name).toBe("Personal");
    expect(explorer.sortedFiles.value[0].name).toBe("resume.pdf");
    expect(explorer.sortedFiles.value[1].name).toBe("budget.xlsx");

    // Sort by Size (asc)
    explorer.sortBy.value = "size";
    explorer.sortOrder.value = "asc";
    // budget.xlsx (1200000) > resume.pdf (500000)
    expect(explorer.sortedFiles.value[0].name).toBe("resume.pdf");
    expect(explorer.sortedFiles.value[1].name).toBe("budget.xlsx");
  });

  it("should support clipboard cut and copy actions", async () => {
    const explorer = useExplorer();
    await explorer.selectFolder("1");

    // Select item
    explorer.activeItem.value = { id: "101", type: "file", name: "resume.pdf" };

    // Copy
    explorer.copyItem();
    expect(explorer.clipboard.value).not.toBeNull();
    expect(explorer.clipboard.value?.action).toBe("copy");
    expect(explorer.clipboard.value?.item.name).toBe("resume.pdf");

    // Cut
    explorer.cutItem();
    expect(explorer.clipboard.value?.action).toBe("cut");
  });

  it("should perform paste operation based on clipboard action", async () => {
    const explorer = useExplorer();
    await explorer.selectFolder("1");

    explorer.activeItem.value = { id: "101", type: "file", name: "resume.pdf" };
    explorer.copyItem();

    // Change destination folder
    explorer.selectedFolderId.value = "2";

    await explorer.pasteItem();
    expect(copyFileMock).toHaveBeenCalledWith("101", "2");
  });

  it("should perform createNewItem CRUD operation", async () => {
    const explorer = useExplorer();
    explorer.selectedFolderId.value = "1";

    await explorer.createNewItem("folder");
    expect(createFolderMock).toHaveBeenCalledWith("New Folder", "1");

    await explorer.createNewItem("file");
    expect(createFileMock).toHaveBeenCalledWith("New File.txt", "1", 0);
  });

  it("should perform deleteItem CRUD operation", async () => {
    const explorer = useExplorer();
    explorer.selectedFolderId.value = "1";
    explorer.activeItem.value = { id: "3", type: "folder", name: "Work" };

    // Mock confirm
    const confirmSpy = spyOn(globalThis, "confirm").mockImplementation(() => true);

    await explorer.deleteItem();
    expect(confirmSpy).toHaveBeenCalled();
    expect(deleteFolderMock).toHaveBeenCalledWith("3");

    confirmSpy.mockRestore();
  });

  it("should perform renameItem CRUD operation", async () => {
    const explorer = useExplorer();
    explorer.selectedFolderId.value = "1";
    explorer.activeItem.value = { id: "101", type: "file", name: "resume.pdf" };

    // Mock prompt
    const promptSpy = spyOn(globalThis, "prompt").mockImplementation(() => "cv.pdf");

    await explorer.renameItem();
    expect(promptSpy).toHaveBeenCalled();
    expect(renameFileMock).toHaveBeenCalledWith("101", "cv.pdf");

    promptSpy.mockRestore();
  });

  it("should benchmark collapsible duration at different levels", async () => {
    const explorer = useExplorer();

    // 1. Level 1: Virtual Folder / "This PC"
    const startL1 = performance.now();
    await explorer.expandFolder({ id: "this-pc", name: "This PC", parentId: null, hasChildren: true });
    const endL1 = performance.now();
    const durationL1 = endL1 - startL1;

    // 2. Level 2: Local Disk C (Root DB Folder)
    // We load root folders first to populate folderMap and rootFolders
    await explorer.loadRootFolders();
    const localC = explorer.rootFolders.value.find(f => f.name.includes("Documents")) || explorer.rootFolders.value[0];
    
    const startL2 = performance.now();
    await explorer.expandFolder(localC);
    const endL2 = performance.now();
    const durationL2 = endL2 - startL2;

    // 3. Level 3: Subfolder (Child DB Folder)
    // Since localC is loaded, we can find its children in folderMap
    const subfolder = localC.children?.[0];
    let durationL3 = 0;
    if (subfolder) {
      const startL3 = performance.now();
      await explorer.expandFolder(subfolder);
      const endL3 = performance.now();
      durationL3 = endL3 - startL3;
    }

    console.log("\n==========================================");
    console.log("   BENCHMARK DURASI COLLAPSIBLE TIAP LEVEL");
    console.log("==========================================");
    console.log(`Level 1 (This PC - Virtual) : ${durationL1.toFixed(4)} ms`);
    console.log(`Level 2 (Documents - DB Root): ${durationL2.toFixed(4)} ms`);
    if (subfolder) {
      console.log(`Level 3 (Work - DB Child)    : ${durationL3.toFixed(4)} ms`);
    } else {
      console.log("Level 3 (Work - DB Child)    : N/A");
    }
    console.log("==========================================\n");

    expect(durationL1).toBeLessThan(50); // Level 1 virtual is sync & very fast
  });

  it("should expand and lazy load OneDrive contents", async () => {
    const explorer = useExplorer();

    // Load root folders first to populate shortcutFolderIds
    await explorer.loadRootFolders();
    expect(explorer.sidebarSection1.value[2].id).toBe("onedrive-id");

    // Expand OneDrive root
    await explorer.expandFolder(explorer.sidebarSection1.value[2]);

    // Check that open status is toggled and children are lazy loaded
    expect(explorer.sidebarSection1.value[2].isOpen).toBe(true);
    expect(explorer.sidebarSection1.value[2].isLoaded).toBe(true);
    expect(explorer.sidebarSection1.value[2].children).toHaveLength(1);
    expect(explorer.sidebarSection1.value[2].children?.[0].name).toBe("OneDrive Subfolder");

    // Collapse OneDrive root
    await explorer.expandFolder(explorer.sidebarSection1.value[2]);
    expect(explorer.sidebarSection1.value[2].isOpen).toBe(false);
  });
});
