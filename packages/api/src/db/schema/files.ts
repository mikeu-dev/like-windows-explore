import { pgTable, uuid, text, timestamp, integer, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { folders } from "./folders";

export const files = pgTable(
  "files",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    size: integer("size").notNull().default(0),
    folderId: uuid("folder_id")
      .references(() => folders.id, { onDelete: "cascade" })
      .notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull()
  },
  (table) => {
    return {
      folderIdx: index("files_folder_id_idx").on(table.folderId),
      folderNameIdx: index("files_folder_name_idx").on(table.folderId, table.name)
    };
  }
);

export const filesRelations = relations(files, ({ one }) => ({
  folder: one(folders, {
    fields: [files.folderId],
    references: [folders.id]
  })
}));

export type FileInsert = typeof files.$inferInsert;
export type FileSelect = typeof files.$inferSelect;
