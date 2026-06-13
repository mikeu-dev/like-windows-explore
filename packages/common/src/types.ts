export interface FolderDTO {
  id: string;
  name: string;
  parentId: string | null;
  hasChildren?: boolean;
}

export interface FileDTO {
  id: string;
  name: string;
  size: number;
  folderId: string;
}

export interface FolderContentsDTO {
  subfolders: FolderDTO[];
  files: FileDTO[];
}

export interface SearchResultsDTO {
  folders: FolderDTO[];
  files: FileDTO[];
}
