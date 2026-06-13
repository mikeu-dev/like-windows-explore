import { describe, expect, it } from "bun:test";
import FolderTreeNode from "./FolderTreeNode.vue";
import { readFileSync } from "fs";

describe("FolderTreeNode Component SFC Verification", () => {
  // Karena Bun mengimpor berkas .vue sebagai path aset string, kita baca isi file-nya secara manual menggunakan fs
  const fileContent = readFileSync(FolderTreeNode, "utf-8");

  it("should resolve the SFC component path", () => {
    expect(FolderTreeNode).toBeDefined();
    expect(FolderTreeNode).toContain("FolderTreeNode.vue");
  });

  it("should contain the Vue SFC template structure", () => {
    // Memverifikasi elemen-elemen SFC Vue
    expect(fileContent).toContain("<template>");
    expect(fileContent).toContain("</template>");
    expect(fileContent).toContain('<script setup lang="ts">');
    expect(fileContent).toContain("</script>");
  });

  it("should define props for folder and selectedId in script", () => {
    // Memverifikasi tipe data properti yang didukung
    expect(fileContent).toContain("defineProps<{");
    expect(fileContent).toContain("folder: ClientFolderNode");
    expect(fileContent).toContain("selectedId: string | null");
  });

  it("should define custom recursive rendering tag", () => {
    // Memverifikasi penulisan komponen rekursif
    expect(fileContent).toContain("<FolderTreeNode");
  });
});
