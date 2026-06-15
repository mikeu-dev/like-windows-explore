import "../test-env.d.ts";
import { describe, expect, it } from "bun:test";
import FolderTree from "./FolderTree.vue";
import { readFileSync } from "fs";

describe("FolderTree Component SFC Verification", () => {
  const fileContent = readFileSync(FolderTree, "utf-8");

  it("should resolve the SFC component path", () => {
    expect(FolderTree).toBeDefined();
    expect(FolderTree).toContain("FolderTree.vue");
  });

  it("should contain the Vue SFC template structure", () => {
    expect(fileContent).toContain("<template>");
    expect(fileContent).toContain("</template>");
    expect(fileContent).toContain('<script setup lang="ts">');
    expect(fileContent).toContain("</script>");
  });

  it("should define props for folders and selectedId in script", () => {
    expect(fileContent).toContain("defineProps<{");
    expect(fileContent).toContain("folders: ClientFolderNode[];");
    expect(fileContent).toContain("selectedId: string | null;");
  });

  it("should define emits for select and expand in script", () => {
    expect(fileContent).toContain("defineEmits<{");
    expect(fileContent).toContain('(e: "select", id: string): void;');
    expect(fileContent).toContain('(e: "expand", folder: ClientFolderNode): void;');
  });

  it("should handle empty folders state", () => {
    expect(fileContent).toContain('v-if="folders.length === 0"');
    expect(fileContent).toContain("Tidak ada folder root.");
  });

  it("should render list of FolderTreeNode components when folders exist", () => {
    expect(fileContent).toContain("<FolderTreeNode");
    expect(fileContent).toContain('v-for="folder in folders"');
    expect(fileContent).toContain(':folder="folder"');
    expect(fileContent).toContain(':selected-id="selectedId"');
    expect(fileContent).toContain("@select=\"emit('select', $event)\"");
    expect(fileContent).toContain("@expand=\"emit('expand', $event)\"");
  });
});
