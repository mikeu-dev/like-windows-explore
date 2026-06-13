import { FolderDTO, FileDTO, FolderContentsDTO, SearchResultsDTO } from "@explorer/common";

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
  },

  // Membuat Folder Baru
  async createFolder(name: string, parentId: string | null): Promise<FolderDTO | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/folders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, parentId })
      });
      if (!response.ok) throw new Error("Gagal membuat folder");
      return await response.json();
    } catch (error) {
      console.error("API Error (createFolder):", error);
      return null;
    }
  },

  // Membuat Berkas Baru
  async createFile(name: string, folderId: string, size = 0): Promise<FileDTO | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/files`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, folderId, size })
      });
      if (!response.ok) throw new Error("Gagal membuat berkas");
      return await response.json();
    } catch (error) {
      console.error("API Error (createFile):", error);
      return null;
    }
  },

  // Mengubah Nama Folder
  async renameFolder(id: string, name: string): Promise<FolderDTO | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/folders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name })
      });
      if (!response.ok) throw new Error("Gagal mengubah nama folder");
      return await response.json();
    } catch (error) {
      console.error("API Error (renameFolder):", error);
      return null;
    }
  },

  // Mengubah Nama Berkas
  async renameFile(id: string, name: string): Promise<FileDTO | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/files/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name })
      });
      if (!response.ok) throw new Error("Gagal mengubah nama berkas");
      return await response.json();
    } catch (error) {
      console.error("API Error (renameFile):", error);
      return null;
    }
  },

  // Memindahkan Folder (Cut & Paste)
  async moveFolder(id: string, parentId: string | null): Promise<FolderDTO | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/folders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ parentId })
      });
      if (!response.ok) throw new Error("Gagal memindahkan folder");
      return await response.json();
    } catch (error) {
      console.error("API Error (moveFolder):", error);
      return null;
    }
  },

  // Memindahkan Berkas (Cut & Paste)
  async moveFile(id: string, folderId: string): Promise<FileDTO | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/files/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folderId })
      });
      if (!response.ok) throw new Error("Gagal memindahkan berkas");
      return await response.json();
    } catch (error) {
      console.error("API Error (moveFile):", error);
      return null;
    }
  },

  // Menyalin Folder (Copy & Paste)
  async copyFolder(id: string, parentId: string | null): Promise<FolderDTO | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/folders/${id}/copy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ parentId })
      });
      if (!response.ok) throw new Error("Gagal menyalin folder");
      return await response.json();
    } catch (error) {
      console.error("API Error (copyFolder):", error);
      return null;
    }
  },

  // Menyalin Berkas (Copy & Paste)
  async copyFile(id: string, folderId: string): Promise<FileDTO | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/files/${id}/copy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folderId })
      });
      if (!response.ok) throw new Error("Gagal menyalin berkas");
      return await response.json();
    } catch (error) {
      console.error("API Error (copyFile):", error);
      return null;
    }
  },

  // Menghapus Folder
  async deleteFolder(id: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/folders/${id}`, {
        method: "DELETE"
      });
      if (!response.ok) throw new Error("Gagal menghapus folder");
      return true;
    } catch (error) {
      console.error("API Error (deleteFolder):", error);
      return false;
    }
  },

  // Menghapus Berkas
  async deleteFile(id: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/files/${id}`, {
        method: "DELETE"
      });
      if (!response.ok) throw new Error("Gagal menghapus berkas");
      return true;
    } catch (error) {
      console.error("API Error (deleteFile):", error);
      return false;
    }
  }
};
