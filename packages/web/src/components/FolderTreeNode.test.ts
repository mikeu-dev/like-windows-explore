import { describe, expect, it } from "bun:test";
import FolderTreeNode from "./FolderTreeNode.vue";
import { readFileSync } from "fs";

describe("FolderTreeNode Component SFC Verification", () => {
  // Since Bun imports .vue files as asset string paths, we read the file contents manually using fs
  const fileContent = readFileSync(FolderTreeNode, "utf-8");

  it("should resolve the SFC component path", () => {
    expect(FolderTreeNode).toBeDefined();
    expect(FolderTreeNode).toContain("FolderTreeNode.vue");
  });

  it("should contain the Vue SFC template structure", () => {
    // Verify Vue SFC elements
    expect(fileContent).toContain("<template>");
    expect(fileContent).toContain("</template>");
    expect(fileContent).toContain('<script setup lang="ts">');
    expect(fileContent).toContain("</script>");
  });

  it("should define props for folder and selectedId in script", () => {
    // Verify supported property data types
    expect(fileContent).toContain("defineProps<{");
    expect(fileContent).toContain("folder: ClientFolderNode");
    expect(fileContent).toContain("selectedId: string | null");
  });

  it("should define custom recursive rendering tag", () => {
    // Verify recursive component syntax
    expect(fileContent).toContain("<FolderTreeNode");
  });
});
