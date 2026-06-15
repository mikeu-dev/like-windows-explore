import "../test-env.d.ts";
import { describe, expect, it } from "bun:test";
import FolderContents from "./FolderContents.vue";
import { readFileSync } from "fs";

describe("FolderContents Component SFC Verification", () => {
  // Membaca file SFC Vue secara langsung
  const fileContent = readFileSync(FolderContents, "utf-8");

  it("should resolve the SFC component path", () => {
    expect(FolderContents).toBeDefined();
    expect(FolderContents).toContain("FolderContents.vue");
  });

  it("should contain the Vue SFC structure", () => {
    expect(fileContent).toContain("<template>");
    expect(fileContent).toContain("</template>");
    expect(fileContent).toContain('<script setup lang="ts">');
    expect(fileContent).toContain("</script>");
  });

  it("should define props correctly for presentational behavior", () => {
    expect(fileContent).toContain("defineProps<{");
    expect(fileContent).toContain("subfolders: FolderDTO[];");
    expect(fileContent).toContain("files: FileDTO[];");
    expect(fileContent).toContain("isLoading: boolean;");
    expect(fileContent).toContain("isSearching: boolean;");
    expect(fileContent).toContain("searchQuery: string;");
    expect(fileContent).toContain(
      'activeItem: { id: string; type: "folder" | "file"; name: string } | null;'
    );
  });

  it("should define emits for events", () => {
    expect(fileContent).toContain("defineEmits<{");
    expect(fileContent).toContain('(e: "navigate", folderId: string): void;');
    expect(fileContent).toContain(
      '(e: "select-item", item: { id: string; type: "folder" | "file"; name: string } | null): void;'
    );
  });

  it("should render Grid View and Detail List View blocks", () => {
    expect(fileContent).toContain("v-else-if=\"viewMode === 'grid'\"");
    expect(fileContent).toContain('v-else class="w-full overflow-x-auto"');
  });

});
