import { ref, computed } from "vue";
import { FolderDTO, FileDTO, FolderContentsDTO } from "@explorer/common";
import { explorerApi } from "../services/api";

// Definisikan tipe untuk node folder yang dapat diekspansi di frontend
export interface ClientFolderNode extends FolderDTO {
  children?: ClientFolderNode[];
  isOpen?: boolean;
  isLoading?: boolean;
  isLoaded?: boolean;
  dbFolderId?: string; // Menyimpan ID DB asli jika dibutuhkan untuk rujukan
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

  // Stack navigasi riwayat
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

  // Map untuk akses cepat O(1) ke node mana pun dalam pohon
  const folderMap = new Map<string, ClientFolderNode>();

  // Daftar folder virtual
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

  // Menyimpan status terbuka/tertutup folder virtual
  const openFolderIds = ref<Record<string, boolean>>({
    "this-pc": true, // Terbuka secara default
    "network": false,
    "linux": false,
    "onedrive-root": false
  });

  // Pemetaan ID folder pintasan (shortcuts) dari database
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

  // Node OneDrive Virtual di Section 1
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
    // Di Windows 11 modern, This PC hanya menampilkan drive lokal.
    const drives = rootFolders.value.map((f) => ({
      ...f,
      parentId: "this-pc"
    }));

    return {
      id: "this-pc",
      name: "This PC",
      parentId: null,
      hasChildren: true,
      isOpen: !!openFolderIds.value["this-pc"],
      isLoaded: true,
      children: drives
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

  // Memperoleh folder yang terurut berdasarkan kriteria
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

  // Memuat folder tingkat teratas (Root)
  async function loadRootFolders() {
    try {
      const shortcuts = await explorerApi.getShortcuts();
      shortcutFolderIds.value = shortcuts;
    } catch (e) {
      console.error("Gagal memuat shortcuts", e);
    }

    const data = await explorerApi.getSubfolders(null);
    rootFolders.value = data.map((f) => {
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
  }

  // Melakukan ekspansi folder dan memuat subfolder di dalamnya secara bertahap (lazy loading)
  async function expandFolder(folder: ClientFolderNode) {
    if (folder.id === "onedrive-root" || folder.id === shortcutFolderIds.value.onedrive) {
      openFolderIds.value["onedrive-root"] = !openFolderIds.value["onedrive-root"];
      const id = shortcutFolderIds.value.onedrive;
      if (id) {
        let mapNode = folderMap.get(id);
        if (!mapNode) {
          mapNode = {
            id,
            name: "OneDrive",
            parentId: null,
            children: [],
            isOpen: false,
            isLoading: false,
            isLoaded: false,
            hasChildren: true
          };
          folderMap.set(id, mapNode);
        }
        if (!mapNode.isLoaded) {
          await expandFolder(mapNode);
        }
      }
      return;
    }

    if (folder.id === "this-pc" || folder.id === "network" || folder.id === "linux") {
      openFolderIds.value[folder.id] = !openFolderIds.value[folder.id];
      return;
    }

    if (folder.isLoaded) {
      folder.isOpen = !folder.isOpen;
      return;
    }

    if (!folder.hasChildren) {
      folder.isLoaded = true;
      folder.isOpen = !folder.isOpen;
      return;
    }

    folder.isLoading = true;
    try {
      const childrenData = await explorerApi.getSubfolders(folder.id);
      folder.children = childrenData.map((f) => {
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
      folder.isLoaded = true;
      folder.isOpen = true;
    } catch (e) {
      console.error("Gagal memuat subfolder", e);
    } finally {
      folder.isLoading = false;
    }
  }

  // Memilih folder, memuat isinya di panel kanan, serta memuat breadcrumb path
  async function selectFolder(folderId: string, pushToHistory = true) {
    // Bersihkan pilihan item saat berpindah folder
    activeItem.value = null;

    if (pushToHistory && selectedFolderId.value && selectedFolderId.value !== folderId) {
      historyStack.value.push(selectedFolderId.value);
      forwardStack.value = []; // Reset forward stack pada aksi navigasi baru
    }

    selectedFolderId.value = folderId;
    selectedFolderContentsLoading.value = true;
    isSearching.value = false; // Keluar dari mode pencarian jika memilih folder
    searchQuery.value = "";

    // Tangani Redirection OneDrive
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

    // Tangani Folder Virtual
    if (virtualFolders.includes(folderId) || folderId.endsWith("-virtual")) {
      try {
        if (folderId === "this-pc") {
          const drives = rootFolders.value.map((f) => ({ ...f, parentId: "this-pc" }));
          selectedFolderContents.value = {
            subfolders: drives,
            files: []
          };
          breadcrumbs.value = []; // Root / Ini PC
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

    // Tangani Folder DB Asli
    try {
      // Jalankan paralel untuk efisiensi
      const [contents, path] = await Promise.all([
        explorerApi.getFolderContents(folderId),
        explorerApi.getFolderPath(folderId)
      ]);

      selectedFolderContents.value = contents;
      breadcrumbs.value = path;

      // Pastikan node yang dipilih dalam pohon terekspansi dan ter-load di panel kiri
      const node = folderMap.get(folderId);
      if (node) {
        // Ekspansi seluruh parent dari node ini agar terlihat di tree view
        expandParentHierarchy(node);
      }
    } catch (e) {
      console.error("Gagal memilih folder", e);
    } finally {
      selectedFolderContentsLoading.value = false;
    }
  }

  // Kembali ke folder sebelumnya
  function goBack() {
    if (historyStack.value.length > 0) {
      const prevId = historyStack.value.pop()!;
      if (selectedFolderId.value) {
        forwardStack.value.push(selectedFolderId.value);
      }
      selectFolder(prevId, false);
    }
  }

  // Maju ke folder selanjutnya (setelah Back)
  function goForward() {
    if (forwardStack.value.length > 0) {
      const nextId = forwardStack.value.pop()!;
      if (selectedFolderId.value) {
        historyStack.value.push(selectedFolderId.value);
      }
      selectFolder(nextId, false);
    }
  }

  // Naik satu level ke folder induk (Up)
  function goUp() {
    if (selectedFolderId.value) {
      const currentFolder = folderMap.get(selectedFolderId.value);
      if (currentFolder && currentFolder.parentId) {
        selectFolder(currentFolder.parentId);
      } else if (breadcrumbs.value.length > 1) {
        const parentFolder = breadcrumbs.value[breadcrumbs.value.length - 2];
        selectFolder(parentFolder.id);
      } else if (selectedFolderId.value !== "this-pc") {
        // Jika berada di root DB folder, Up akan mengarahkan ke This PC
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

  // Membuat Folder/Berkas Baru
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

  // Menghapus Item terpilih
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

  // Mengubah Nama Item terpilih
  async function renameItem() {
    if (!activeItem.value || !selectedFolderId.value) return;
    const newName = prompt(`Ubah nama "${activeItem.value.name}" menjadi:`, activeItem.value.name);
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

  // Melakukan ekspansi semua folder induk secara rekursif
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

  // Menangani pencarian
  async function performSearch(query: string) {
    activeItem.value = null; // Bersihkan selection saat pencarian dipicu
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
