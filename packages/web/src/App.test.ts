import "./test-env.d.ts";
import { describe, expect, it } from "bun:test";
import App from "./App.vue";
import { readFileSync } from "fs";

describe("App Component SFC Verification", () => {
  const fileContent = readFileSync(App, "utf-8");

  it("should resolve the SFC component path", () => {
    expect(App).toBeDefined();
    expect(App).toContain("App.vue");
  });

  it("should import useExplorer composable", () => {
    expect(fileContent).toContain('import { useExplorer } from "./composables/useExplorer";');
    expect(fileContent).toContain("const {");
    expect(fileContent).toContain("} = useExplorer();");
  });

  it("should import and use child components", () => {
    expect(fileContent).toContain('import FolderTree from "./components/FolderTree.vue";');
    expect(fileContent).toContain('import FolderContents from "./components/FolderContents.vue";');
    expect(fileContent).toContain('import Breadcrumbs from "./components/Breadcrumbs.vue";');
    expect(fileContent).toContain('import ExplorerSearch from "./components/ExplorerSearch.vue";');
  });

  it("should bind useExplorer variables and methods to template elements", () => {
    // Toolbar Actions
    expect(fileContent).toContain('@click="cutItem"');
    expect(fileContent).toContain('@click="copyItem"');
    expect(fileContent).toContain('@click="pasteItem"');
    expect(fileContent).toContain('@click="renameItem"');
    expect(fileContent).toContain('@click="deleteItem"');

    // History Navigation Controls
    expect(fileContent).toContain('@click="goBack"');
    expect(fileContent).toContain('@click="goForward"');
    expect(fileContent).toContain('@click="goUp"');
    expect(fileContent).toContain('@click="refreshCurrent"');
  });

  it("should pass props and listen to events of FolderContents", () => {
    expect(fileContent).toContain(':subfolders="sortedSubfolders"');
    expect(fileContent).toContain(':files="sortedFiles"');
    expect(fileContent).toContain('@navigate="selectFolder"');
    expect(fileContent).toContain('@select-item="activeItem = $event"');
  });
});
