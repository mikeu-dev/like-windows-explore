import { Elysia, t } from "elysia";
import { ExplorerService } from "../../services/explorer.service";
import { DrizzleFolderRepository } from "../../repositories/drizzle-folder.repository";
import { DrizzleFileRepository } from "../../repositories/drizzle-file.repository";

// Menggunakan manual dependency injection untuk menjaga arsitektur tetap bersih & testable
const folderRepo = new DrizzleFolderRepository();
const fileRepo = new DrizzleFileRepository();
const explorerService = new ExplorerService(folderRepo, fileRepo);

export const explorerController = new Elysia({ prefix: "/v1" })
  // Query
  .get(
    "/folders",
    async ({ query }) => {
      const parentId = query.parentId || null;
      return await explorerService.getSubfolders(parentId);
    },
    {
      query: t.Object({
        parentId: t.Optional(t.String())
      })
    }
  )
  .get(
    "/folders/:id/contents",
    async ({ params: { id } }) => {
      return await explorerService.getFolderContents(id);
    },
    {
      params: t.Object({
        id: t.String()
      })
    }
  )
  .get(
    "/folders/:id/path",
    async ({ params: { id } }) => {
      return await explorerService.getFolderPath(id);
    },
    {
      params: t.Object({
        id: t.String()
      })
    }
  )
  .get(
    "/search",
    async ({ query }) => {
      return await explorerService.search(query.q);
    },
    {
      query: t.Object({
        q: t.String()
      })
    }
  )
  // Mutasi: Create
  .post(
    "/folders",
    async ({ body: { name, parentId } }) => {
      return await explorerService.createFolder(name, parentId);
    },
    {
      body: t.Object({
        name: t.String(),
        parentId: t.Nullable(t.String())
      })
    }
  )
  .post(
    "/files",
    async ({ body: { name, folderId, size } }) => {
      return await explorerService.createFile(name, folderId, size ?? 0);
    },
    {
      body: t.Object({
        name: t.String(),
        folderId: t.String(),
        size: t.Optional(t.Number())
      })
    }
  )
  // Mutasi: Update (Rename / Move)
  .patch(
    "/folders/:id",
    async ({ params: { id }, body: { name, parentId } }) => {
      if (name !== undefined) {
        return await explorerService.renameFolder(id, name);
      }
      if (parentId !== undefined) {
        return await explorerService.moveFolder(id, parentId);
      }
      throw new Error("Invalid request body");
    },
    {
      params: t.Object({
        id: t.String()
      }),
      body: t.Object({
        name: t.Optional(t.String()),
        parentId: t.Optional(t.Nullable(t.String()))
      })
    }
  )
  .patch(
    "/files/:id",
    async ({ params: { id }, body: { name, folderId } }) => {
      if (name !== undefined) {
        return await explorerService.renameFile(id, name);
      }
      if (folderId !== undefined) {
        return await explorerService.moveFile(id, folderId);
      }
      throw new Error("Invalid request body");
    },
    {
      params: t.Object({
        id: t.String()
      }),
      body: t.Object({
        name: t.Optional(t.String()),
        folderId: t.Optional(t.String())
      })
    }
  )
  // Mutasi: Copy
  .post(
    "/folders/:id/copy",
    async ({ params: { id }, body: { parentId } }) => {
      return await explorerService.copyFolder(id, parentId);
    },
    {
      params: t.Object({
        id: t.String()
      }),
      body: t.Object({
        parentId: t.Nullable(t.String())
      })
    }
  )
  .post(
    "/files/:id/copy",
    async ({ params: { id }, body: { folderId } }) => {
      return await explorerService.copyFile(id, folderId);
    },
    {
      params: t.Object({
        id: t.String()
      }),
      body: t.Object({
        folderId: t.String()
      })
    }
  )
  // Mutasi: Delete
  .delete(
    "/folders/:id",
    async ({ params: { id } }) => {
      await explorerService.deleteFolder(id);
      return { success: true };
    },
    {
      params: t.Object({
        id: t.String()
      })
    }
  )
  .delete(
    "/files/:id",
    async ({ params: { id } }) => {
      await explorerService.deleteFile(id);
      return { success: true };
    },
    {
      params: t.Object({
        id: t.String()
      })
    }
  );

export type ExplorerController = typeof explorerController;
