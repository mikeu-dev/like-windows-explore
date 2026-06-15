/// <reference types="vite/client" />
import { FolderDTO, FileDTO, FolderContentsDTO, SearchResultsDTO } from "@explorer/common";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:3001/api/v1";

export const explorerApi = {
  // Fetch subfolders directly (for tree view)
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

  // Fetch full folder contents (subfolders + files) for the right panel
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

  // Fetch breadcrumb path from node to root
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

  // Search files and folders globally
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

  // Create New Folder
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

  // Create New File
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

  // Rename Folder
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

  // Rename File
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

  // Move Folder (Cut & Paste)
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

  // Move File (Cut & Paste)
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

  // Copy Folder (Copy & Paste)
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

  // Copy File (Copy & Paste)
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

  // Delete Folder
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

  // Delete File
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
  },

  // Get shortcut folder IDs from the database
  async getShortcuts(): Promise<Record<string, string>> {
    try {
      const response = await fetch(`${API_BASE_URL}/shortcuts`);
      if (!response.ok) throw new Error("Gagal mengambil folder pintasan");
      return await response.json();
    } catch (error) {
      console.error("API Error (getShortcuts):", error);
      return {
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
    }
  }
};

