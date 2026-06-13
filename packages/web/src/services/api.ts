import { FolderDTO, FolderContentsDTO, SearchResultsDTO } from "@explorer/common";

const API_BASE_URL = "http://127.0.0.1:3001/api/v1";

export const explorerApi = {
  // Ambil subfolder langsung (untuk tree view)
  async getSubfolders(parentId: string | null = null): Promise<FolderDTO[]> {
    try {
      const url = parentId
        ? `${API_BASE_URL}/folders?parentId=${parentId}`
        : `${API_BASE_URL}/folders`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Gagal mengambil subfolder");
      return await response.json();
    } catch (error) {
      console.error("API Error (getSubfolders):", error);
      return [];
    }
  },

  // Ambil isi folder lengkap (subfolder + berkas) untuk panel kanan
  async getFolderContents(folderId: string): Promise<FolderContentsDTO> {
    try {
      const response = await fetch(`${API_BASE_URL}/folders/${folderId}/contents`);
      if (!response.ok) throw new Error("Gagal mengambil isi folder");
      return await response.json();
    } catch (error) {
      console.error("API Error (getFolderContents):", error);
      return { subfolders: [], files: [] };
    }
  },

  // Ambil urutan breadcrumb path folder dari node ke root
  async getFolderPath(folderId: string): Promise<FolderDTO[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/folders/${folderId}/path`);
      if (!response.ok) throw new Error("Gagal mengambil path folder");
      return await response.json();
    } catch (error) {
      console.error("API Error (getFolderPath):", error);
      return [];
    }
  },

  // Cari berkas dan folder secara global
  async search(query: string): Promise<SearchResultsDTO> {
    try {
      if (!query || query.trim().length < 2) {
        return { folders: [], files: [] };
      }
      const response = await fetch(`${API_BASE_URL}/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error("Gagal melakukan pencarian");
      return await response.json();
    } catch (error) {
      console.error("API Error (search):", error);
      return { folders: [], files: [] };
    }
  }
};
