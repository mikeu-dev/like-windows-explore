import { Elysia, t } from "elysia";
import { ExplorerService } from "../../services/explorer.service";
import { DrizzleFolderRepository } from "../../repositories/drizzle-folder.repository";
import { DrizzleFileRepository } from "../../repositories/drizzle-file.repository";

// Menggunakan manual dependency injection untuk menjaga arsitektur tetap bersih & testable
const folderRepo = new DrizzleFolderRepository();
const fileRepo = new DrizzleFileRepository();
const explorerService = new ExplorerService(folderRepo, fileRepo);

export const explorerController = new Elysia({ prefix: "/v1" })
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
  );
export type ExplorerController = typeof explorerController;
