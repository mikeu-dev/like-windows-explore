import "../test-env.d.ts";
import { describe, expect, it } from "bun:test";
import Breadcrumbs from "./Breadcrumbs.vue";
import { readFileSync } from "fs";

describe("Breadcrumbs Component SFC Verification", () => {
  const fileContent = readFileSync(Breadcrumbs, "utf-8");

  it("should resolve the SFC component path", () => {
    expect(Breadcrumbs).toBeDefined();
    expect(Breadcrumbs).toContain("Breadcrumbs.vue");
  });

  it("should contain the Vue SFC template structure", () => {
    expect(fileContent).toContain("<template>");
    expect(fileContent).toContain("</template>");
    expect(fileContent).toContain('<script setup lang="ts">');
    expect(fileContent).toContain("</script>");
  });

  it("should define props for path in script", () => {
    expect(fileContent).toContain("defineProps<{");
    expect(fileContent).toContain("path: FolderDTO[];");
  });

  it("should define emits for navigate in script", () => {
    expect(fileContent).toContain("defineEmits<{");
    expect(fileContent).toContain('(e: "navigate", folderId: string): void;');
  });

  it("should render breadcrumbs nav and This PC root", () => {
    expect(fileContent).toContain('id="breadcrumbs-nav"');
    expect(fileContent).toContain('aria-label="Breadcrumb"');
    expect(fileContent).toContain("This PC");
  });

  it("should iterate through path and render breadcrumb items", () => {
    expect(fileContent).toContain('v-for="(folder, index) in path"');
    expect(fileContent).toContain(':id="\'breadcrumb-item-\' + folder.id"');
    expect(fileContent).toContain("@click=\"emit('navigate', folder.id)\"");
  });
});
