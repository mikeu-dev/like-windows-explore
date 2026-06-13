import { ref } from "vue";
import { FolderDTO, FileDTO, FolderContentsDTO } from "@explorer/common";
import { explorerApi } from "../services/api";

// Definisikan tipe untuk node folder yang dapat diekspansi di frontend
export interface ClientFolderNode extends FolderDTO {
  children?: ClientFolderNode[];
  isOpen?: boolean;
  isLoading?: boolean;
  isLoaded?: boolean;
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

  // Map untuk akses cepat O(1) ke node mana pun dalam pohon
  const folderMap = new Map<string, ClientFolderNode>();

  // Memuat folder tingkat teratas (Root)
  async function loadRootFolders() {
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
  async function selectFolder(folderId: string) {
    selectedFolderId.value = folderId;
    selectedFolderContentsLoading.value = true;
    isSearching.value = false; // Keluar dari mode pencarian jika memilih folder
    searchQuery.value = "";

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

  // Melakukan ekspansi semua folder induk secara rekursif
  function expandParentHierarchy(node: ClientFolderNode) {
    if (node.parentId) {
      const parent = folderMap.get(node.parentId);
      if (parent) {
        parent.isOpen = true;
        expandParentHierarchy(parent);
      }
    }
  }

  // Menangani pencarian
  async function performSearch(query: string) {
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
    loadRootFolders,
    expandFolder,
    selectFolder,
    performSearch
  };
}
