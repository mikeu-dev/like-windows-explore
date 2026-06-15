import { ref, computed, reactive } from "vue";
import { FolderDTO, FileDTO, FolderContentsDTO } from "@explorer/common";
import { explorerApi } from "../services/api";

// Define type for expandable folder nodes on the frontend
export interface ClientFolderNode extends FolderDTO {
  children?: ClientFolderNode[];
  isOpen?: boolean;
  isLoading?: boolean;
  isLoaded?: boolean;
  dbFolderId?: string; // Stores original DB ID if needed for reference
}

export function useExplorer() {
  const rootFolders = ref<ClientFolderNode[]>([]);
  const selectedFolderId = ref<string | null>(null);
  const selectedFolderContents = ref<FolderContentsDTO>({ subfolders: [], files: [] });
  const selectedFolderContentsLoading = ref(false);
  const breadcrumbs = ref<FolderDTO[]>([]);
  const searchQuery = ref("");
  const searchResults = ref<{ folders: FolderDTO[]; files: FileDTO[] }>({ folders: [], files: [] });
  const isSearching = ref(false);
  const searchLoading = ref(false);

  // Navigation history stacks
  const historyStack = ref<string[]>([]);
  const forwardStack = ref<string[]>([]);

  // Sorting state
  const sortBy = ref<"name" | "type" | "size">("name");
  const sortOrder = ref<"asc" | "desc">("asc");

  // Selection state
  const activeItem = ref<{ id: string; type: "folder" | "file"; name: string } | null>(null);

  // Clipboard state
  const clipboard = ref<{
    item: any;
    type: "folder" | "file";
    action: "cut" | "copy";
    sourceFolderId: string;
  } | null>(null);

  // Map for fast O(1) access to any node in the tree
  const folderMap = reactive(new Map<string, ClientFolderNode>());

  // List of virtual folders
  const virtualFolders = [
    "this-pc",
    "desktop",
    "videos",
    "home",
    "gallery",
    "onedrive-root",
    "network",
    "linux"
  ];

  // Stores the open/collapsed state of virtual folders
  const openFolderIds = ref<Record<string, boolean>>({
    "this-pc": true, // Open by default
    "network": false,
    "linux": false,
    "onedrive-root": false
  });

  // Mapping of shortcut folder IDs from the database
  const shortcutFolderIds = ref<Record<string, string>>({
    desktop: "",
    downloads: "",
    documents: "",
    pictures: "",
    music: "",
    videos: "",
    onedrive: "",
    localC: "",
    localD: ""
  });

  // Virtual OneDrive Node in Section 1
  const oneDriveNode = computed<ClientFolderNode>(() => {
    const id = shortcutFolderIds.value.onedrive || "onedrive-virtual";
    const mapNode = folderMap.get(id);
    return {
      id,
      name: "OneDrive - Personal",
      parentId: null,
      hasChildren: mapNode ? mapNode.hasChildren : true,
      isOpen: !!openFolderIds.value["onedrive-root"],
      isLoaded: mapNode ? mapNode.isLoaded : false,
      isLoading: mapNode ? mapNode.isLoading : false,
      children: mapNode ? mapNode.children : [],
      dbFolderId: id !== "onedrive-virtual" ? id : undefined
    };
  });

  // Section 1: Home, Gallery, OneDrive - Personal
  const sidebarSection1 = computed<ClientFolderNode[]>(() => {
    return [
      { id: "home", name: "Home", parentId: null, hasChildren: false, children: [] },
      { id: "gallery", name: "Gallery", parentId: null, hasChildren: false, children: [] },
      oneDriveNode.value
    ];
  });

  // Section 2: Pinned Shortcuts (Desktop, Downloads, Documents, Pictures, Music, Videos)
  const sidebarSection2 = computed<ClientFolderNode[]>(() => {
    const getShortcutNode = (key: string, name: string) => {
      const id = shortcutFolderIds.value[key] || `${key}-virtual`;
      return {
        id,
        name,
        parentId: null,
        hasChildren: false,
        children: []
      };
    };

    return [
      getShortcutNode("desktop", "Desktop"),
      getShortcutNode("downloads", "Downloads"),
      getShortcutNode("documents", "Documents"),
      getShortcutNode("pictures", "Pictures"),
      getShortcutNode("music", "Music"),
      getShortcutNode("videos", "Videos")
    ];
  });

  // Section 3: Collapsible Menu (This PC, Network, Linux)
  const thisPCNode = computed<ClientFolderNode>(() => {
    return {
      id: "this-pc",
      name: "This PC",
      parentId: null,
      hasChildren: true,
      isOpen: !!openFolderIds.value["this-pc"],
      isLoaded: true,
      children: rootFolders.value
    };
  });

  const sidebarSection3 = computed<ClientFolderNode[]>(() => {
    return [
      thisPCNode.value,
      {
        id: "network",
        name: "Network",
        parentId: null,
        hasChildren: true,
        isOpen: !!openFolderIds.value["network"],
        isLoaded: true,
        children: []
      },
      {
        id: "linux",
        name: "Linux",
        parentId: null,
        hasChildren: true,
        isOpen: !!openFolderIds.value["linux"],
        isLoaded: true,
        children: []
      }
    ];
  });

  // Get sorted folders/files based on criteria
  const sortedSubfolders = computed(() => {
    const list = isSearching.value
      ? searchResults.value.folders
      : selectedFolderContents.value.subfolders;
    const foldersList = [...list];
    foldersList.sort((a, b) => {
      let comparison = 0;
      if (sortBy.value === "name") {
        comparison = a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
      }
      return sortOrder.value === "asc" ? comparison : -comparison;
    });
    return foldersList;
  });

  const sortedFiles = computed(() => {
    const list = isSearching.value ? searchResults.value.files : selectedFolderContents.value.files;
    const filesList = [...list];
    filesList.sort((a, b) => {
      let comparison = 0;
      if (sortBy.value === "name") {
        comparison = a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
      } else if (sortBy.value === "size") {
        comparison = a.size - b.size;
      } else if (sortBy.value === "type") {
        const extA = a.name.split(".").pop()?.toLowerCase() || "";
        const extB = b.name.split(".").pop()?.toLowerCase() || "";
        comparison = extA.localeCompare(extB);
      }
      return sortOrder.value === "asc" ? comparison : -comparison;
    });
    return filesList;
  });

  // Load top-level root folders
  async function loadRootFolders() {
    try {
      const [shortcuts, data] = await Promise.all([
        explorerApi.getShortcuts(),
        explorerApi.getSubfolders(null)
      ]);
      shortcutFolderIds.value = shortcuts;
      rootFolders.value = data.map((f) => {
        const node: ClientFolderNode = {
          ...f,
          parentId: "this-pc",
          children: [],
          isOpen: false,
          isLoading: false,
          isLoaded: false
        };
        folderMap.set(node.id, node);
        return node;
      });
    } catch (e) {
      console.error("Gagal memuat root folders/shortcuts", e);
    }
  }

  // Expand a folder and load its subfolders progressively (lazy loading)
  async function expandFolder(folder: ClientFolderNode) {
    if (!folder) return;
    // Special handling for OneDrive
    if (
      folder.id === "onedrive-root" ||
      folder.id === "onedrive-virtual" ||
      (shortcutFolderIds.value.onedrive && folder.id === shortcutFolderIds.value.onedrive && folder.parentId === null)
    ) {
      const isNowOpen = !openFolderIds.value["onedrive-root"];
      openFolderIds.value["onedrive-root"] = isNowOpen;
      
      const dbId = shortcutFolderIds.value.onedrive;
      if (isNowOpen && dbId) {
        let targetNode = folderMap.get(dbId);
        if (!targetNode) {
          const rawNode: ClientFolderNode = {
            id: dbId,
            name: "OneDrive - Personal",
            parentId: null,
            children: [],
            isOpen: true,
            isLoading: false,
            isLoaded: false,
            hasChildren: true
          };
          folderMap.set(dbId, rawNode);
          targetNode = folderMap.get(dbId);
        }
        
        if (targetNode && !targetNode.isLoaded && !targetNode.isLoading) {
          targetNode.isLoading = true;
          try {
            const childrenData = await explorerApi.getSubfolders(dbId);
            targetNode.children = childrenData.map((f) => {
              const node: ClientFolderNode = {
                ...f,
                children: [],
                isOpen: false,
                isLoading: false,
                isLoaded: false
              };
              folderMap.set(node.id, node);
              return node;
            });
            targetNode.isLoaded = true;
          } catch (e) {
            console.error("Gagal memuat subfolder OneDrive", e);
          } finally {
            targetNode.isLoading = false;
          }
        }
      }
      return;
    }

    if (folder.id === "this-pc" || folder.id === "network" || folder.id === "linux") {
      openFolderIds.value[folder.id] = !openFolderIds.value[folder.id];
      return;
    }

    // Retrieve target node reference from folderMap so reactive changes are saved on a single object
    let targetNode = folderMap.get(folder.id);
    if (!targetNode) {
      folderMap.set(folder.id, folder);
      targetNode = folderMap.get(folder.id);
    }
    if (!targetNode) return;

    if (targetNode.isLoaded) {
      targetNode.isOpen = !targetNode.isOpen;
      return;
    }

    if (targetNode.isLoading) {
      return;
    }

    if (!targetNode.hasChildren) {
      targetNode.isLoaded = true;
      targetNode.isOpen = !targetNode.isOpen;
      return;
    }

    targetNode.isLoading = true;
    targetNode.isOpen = true; // Open chevron and subfolder area immediately for perceived performance
    try {
      const childrenData = await explorerApi.getSubfolders(targetNode.id);
      targetNode.children = childrenData.map((f) => {
        const node: ClientFolderNode = {
          ...f,
          children: [],
          isOpen: false,
          isLoading: false,
          isLoaded: false
        };
        folderMap.set(node.id, node);
        return node;
      });
      targetNode.isLoaded = true;
    } catch (e) {
      console.error("Gagal memuat subfolder", e);
      targetNode.isOpen = false; // Revert open status if load fails
    } finally {
      targetNode.isLoading = false;
    }
  }

  // Select a folder, load its contents in the right panel, and fetch the breadcrumb path
  async function selectFolder(folderId: string, pushToHistory = true) {
    // Clear item selection when changing folders
    activeItem.value = null;

    if (pushToHistory && selectedFolderId.value && selectedFolderId.value !== folderId) {
      historyStack.value.push(selectedFolderId.value);
      forwardStack.value = []; // Reset forward stack on new navigation action
    }

    selectedFolderId.value = folderId;
    selectedFolderContentsLoading.value = true;
    isSearching.value = false; // Exit search mode when selecting a folder
    searchQuery.value = "";

    // Handle OneDrive Redirection
    if (folderId === "onedrive-root") {
      const id = shortcutFolderIds.value.onedrive;
      if (id) {
        await selectFolder(id, false);
      } else {
        selectedFolderContents.value = { subfolders: [], files: [] };
        breadcrumbs.value = [{ id: "onedrive-root", name: "OneDrive - Personal", parentId: null }];
        selectedFolderContentsLoading.value = false;
      }
      return;
    }

    // Handle Virtual Folders
    if (virtualFolders.includes(folderId) || folderId.endsWith("-virtual")) {
      try {
        if (folderId === "this-pc") {
          selectedFolderContents.value = {
            subfolders: rootFolders.value,
            files: []
          };
          breadcrumbs.value = []; // Root / This PC
        } else {
          selectedFolderContents.value = { subfolders: [], files: [] };
          let name = "";
          const cleanId = folderId.replace("-virtual", "");
          if (cleanId === "desktop") name = "Desktop";
          else if (cleanId === "videos") name = "Videos";
          else if (cleanId === "downloads") name = "Downloads";
          else if (cleanId === "documents") name = "Documents";
          else if (cleanId === "pictures") name = "Pictures";
          else if (cleanId === "music") name = "Music";
          else if (cleanId === "home") name = "Home";
          else if (cleanId === "gallery") name = "Gallery";
          else if (cleanId === "network") name = "Network";
          else if (cleanId === "linux") name = "Linux";

          breadcrumbs.value = [{ id: folderId, name, parentId: "this-pc" }];
        }
      } catch (e) {
        console.error("Gagal memuat folder virtual", e);
      } finally {
        selectedFolderContentsLoading.value = false;
      }
      return;
    }

    // Handle DB Folders
    try {
      // Run queries in parallel for efficiency
      const [contents, path] = await Promise.all([
        explorerApi.getFolderContents(folderId),
        explorerApi.getFolderPath(folderId)
      ]);

      selectedFolderContents.value = contents;
      breadcrumbs.value = path;

      // Ensure the selected node in the tree is expanded and loaded in the left panel
      const node = folderMap.get(folderId);
      if (node) {
        // Expand the parent hierarchy so it is visible in the tree view
        expandParentHierarchy(node);
      }
    } catch (e) {
      console.error("Gagal memilih folder", e);
    } finally {
      selectedFolderContentsLoading.value = false;
    }
  }

  // Go back to the previous folder
  function goBack() {
    if (historyStack.value.length > 0) {
      const prevId = historyStack.value.pop()!;
      if (selectedFolderId.value) {
        forwardStack.value.push(selectedFolderId.value);
      }
      selectFolder(prevId, false);
    }
  }

  // Go forward to the next folder (after Back)
  function goForward() {
    if (forwardStack.value.length > 0) {
      const nextId = forwardStack.value.pop()!;
      if (selectedFolderId.value) {
        historyStack.value.push(selectedFolderId.value);
      }
      selectFolder(nextId, false);
    }
  }

  // Go up one level to the parent folder (Up)
  function goUp() {
    if (selectedFolderId.value) {
      const currentFolder = folderMap.get(selectedFolderId.value);
      if (currentFolder && currentFolder.parentId) {
        selectFolder(currentFolder.parentId);
      } else if (breadcrumbs.value.length > 1) {
        const parentFolder = breadcrumbs.value[breadcrumbs.value.length - 2];
        selectFolder(parentFolder.id);
      } else if (selectedFolderId.value !== "this-pc") {
        // If in DB root folder, Up navigates to This PC
        selectFolder("this-pc");
      }
    }
  }


  // Reload current view
  async function refreshView() {
    if (selectedFolderId.value) {
      await selectFolder(selectedFolderId.value, false);
    }
    await loadRootFolders();
  }

  // Create a New Folder/File
  async function createNewItem(type: "folder" | "file") {
    if (!selectedFolderId.value) return;
    const defaultName = type === "folder" ? "New Folder" : "New File.txt";

    if (type === "folder") {
      await explorerApi.createFolder(defaultName, selectedFolderId.value);
    } else {
      await explorerApi.createFile(defaultName, selectedFolderId.value, 0);
    }
    await refreshView();
  }

  // Delete selected item
  async function deleteItem() {
    if (!activeItem.value || !selectedFolderId.value) return;
    const confirmDelete = confirm(`Apakah Anda yakin ingin menghapus "${activeItem.value.name}"?`);
    if (!confirmDelete) return;

    if (activeItem.value.type === "folder") {
      await explorerApi.deleteFolder(activeItem.value.id);
    } else {
      await explorerApi.deleteFile(activeItem.value.id);
    }
    activeItem.value = null;
    await refreshView();
  }

  // Rename selected item
  async function renameItem() {
    if (!activeItem.value || !selectedFolderId.value) return;
    const newName = prompt(`Rename "${activeItem.value.name}" to:`, activeItem.value.name);
    if (!newName || newName.trim() === "") return;

    if (activeItem.value.type === "folder") {
      await explorerApi.renameFolder(activeItem.value.id, newName);
    } else {
      await explorerApi.renameFile(activeItem.value.id, newName);
    }
    activeItem.value = null;
    await refreshView();
  }

  // Cut & Copy Item
  function cutItem() {
    if (!activeItem.value || !selectedFolderId.value) return;
    const target =
      activeItem.value.type === "folder"
        ? selectedFolderContents.value.subfolders.find((f) => f.id === activeItem.value!.id)
        : selectedFolderContents.value.files.find((f) => f.id === activeItem.value!.id);

    if (target) {
      clipboard.value = {
        item: { ...target },
        type: activeItem.value.type,
        action: "cut",
        sourceFolderId: selectedFolderId.value
      };
    }
  }

  function copyItem() {
    if (!activeItem.value || !selectedFolderId.value) return;
    const target =
      activeItem.value.type === "folder"
        ? selectedFolderContents.value.subfolders.find((f) => f.id === activeItem.value!.id)
        : selectedFolderContents.value.files.find((f) => f.id === activeItem.value!.id);

    if (target) {
      clipboard.value = {
        item: { ...target },
        type: activeItem.value.type,
        action: "copy",
        sourceFolderId: selectedFolderId.value
      };
    }
  }

  // Paste Item
  async function pasteItem() {
    if (!clipboard.value || !selectedFolderId.value) return;

    const { item, type, action, sourceFolderId } = clipboard.value;

    if (action === "cut") {
      if (sourceFolderId === selectedFolderId.value) {
        clipboard.value = null;
        return;
      }

      if (type === "folder") {
        await explorerApi.moveFolder(item.id, selectedFolderId.value);
      } else {
        await explorerApi.moveFile(item.id, selectedFolderId.value);
      }
      clipboard.value = null;
    } else {
      if (type === "folder") {
        await explorerApi.copyFolder(item.id, selectedFolderId.value);
      } else {
        await explorerApi.copyFile(item.id, selectedFolderId.value);
      }
    }
    await refreshView();
  }

  // Recursively expand all parent folders
  function expandParentHierarchy(node: ClientFolderNode) {
    if (node.parentId) {
      if (node.parentId === "this-pc") {
        openFolderIds.value["this-pc"] = true;
        return;
      }
      const parent = folderMap.get(node.parentId);
      if (parent) {
        parent.isOpen = true;
        expandParentHierarchy(parent);
      }
    }
  }

  // Handle search queries
  async function performSearch(query: string) {
    activeItem.value = null; // Clear selection when search is triggered
    searchQuery.value = query;
    if (query.trim().length < 2) {
      isSearching.value = false;
      searchResults.value = { folders: [], files: [] };
      return;
    }

    isSearching.value = true;
    searchLoading.value = true;
    try {
      const results = await explorerApi.search(query);
      searchResults.value = results;
    } catch (e) {
      console.error("Pencarian gagal", e);
    } finally {
      searchLoading.value = false;
    }
  }

  return {
    rootFolders,
    selectedFolderId,
    selectedFolderContents,
    selectedFolderContentsLoading,
    breadcrumbs,
    searchQuery,
    searchResults,
    isSearching,
    searchLoading,
    historyStack,
    forwardStack,
    sortBy,
    sortOrder,
    activeItem,
    clipboard,
    sortedSubfolders,
    sortedFiles,
    sidebarSection1,
    sidebarSection2,
    sidebarSection3,
    loadRootFolders,
    expandFolder,
    selectFolder,
    performSearch,
    goBack,
    goForward,
    goUp,
    refreshView,
    createNewItem,
    deleteItem,
    renameItem,
    cutItem,
    copyItem,
    pasteItem
  };
}
