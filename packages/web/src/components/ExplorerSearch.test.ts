import "../test-env.d.ts";
import { describe, expect, it } from "bun:test";
import ExplorerSearch from "./ExplorerSearch.vue";
import { readFileSync } from "fs";

describe("ExplorerSearch Component SFC Verification", () => {
  const fileContent = readFileSync(ExplorerSearch, "utf-8");

  it("should resolve the SFC component path", () => {
    expect(ExplorerSearch).toBeDefined();
    expect(ExplorerSearch).toContain("ExplorerSearch.vue");
  });

  it("should contain the Vue SFC template structure", () => {
    expect(fileContent).toContain("<template>");
    expect(fileContent).toContain("</template>");
    expect(fileContent).toContain('<script setup lang="ts">');
    expect(fileContent).toContain("</script>");
  });

  it("should define props for modelValue in script", () => {
    expect(fileContent).toContain("defineProps<{");
    expect(fileContent).toContain("modelValue: string;");
  });

  it("should define emits for update:modelValue and search in script", () => {
    expect(fileContent).toContain("defineEmits<{");
    expect(fileContent).toContain('(e: "update:modelValue", val: string): void;');
    expect(fileContent).toContain('(e: "search", val: string): void;');
  });

  it("should render search input field", () => {
    expect(fileContent).toContain('id="search-input"');
    expect(fileContent).toContain('type="text"');
    expect(fileContent).toContain('placeholder="Search like-windows-explorer"');
  });

  it("should render clear button conditionally", () => {
    expect(fileContent).toContain('v-if="localQuery"');
    expect(fileContent).toContain('id="search-clear-btn"');
    expect(fileContent).toContain('@click="clearSearch"');
  });
});
