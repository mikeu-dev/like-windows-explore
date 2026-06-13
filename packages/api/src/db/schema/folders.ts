import { pgTable, uuid, text, timestamp, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { files } from "./files";

export const folders = pgTable("folders", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  parentId: uuid("parent_id").references(() => folders.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => {
  return {
    parentIdx: index("folders_parent_id_idx").on(table.parentId),
    parentNameIdx: index("folders_parent_name_idx").on(table.parentId, table.name),
  };
});

export const foldersRelations = relations(folders, ({ one, many }) => ({
  parent: one(folders, {
    fields: [folders.parentId],
    references: [folders.id],
    relationName: "folder_hierarchy",
  }),
  subfolders: many(folders, {
    relationName: "folder_hierarchy",
  }),
  files: many(files),
}));

export type FolderInsert = typeof folders.$inferInsert;
export type FolderSelect = typeof folders.$inferSelect;
