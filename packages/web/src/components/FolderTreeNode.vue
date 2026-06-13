<template>
  <div class="select-none">
    <!-- Row Folder -->
    <div
      :id="'folder-node-' + folder.id"
      class="flex items-center py-1.5 px-2 rounded-md cursor-pointer transition-colors duration-150 hover:bg-explorer-border/50 text-sm group"
      :class="[
        selectedId === folder.id
          ? 'bg-explorer-active text-explorer-bg font-medium'
          : 'text-explorer-text'
      ]"
      @click="emit('select', folder.id)"
    >
      <!-- Indikator Ekspansi / Buka-Tutup (Caret) -->
      <span
        :id="'caret-' + folder.id"
        class="w-5 h-5 flex items-center justify-center mr-1 text-xs transition-transform duration-200"
        :class="[
          folder.isOpen ? 'rotate-90' : '',
          !folder.hasChildren ? 'opacity-20 cursor-default' : 'hover:bg-explorer-border/80 rounded'
        ]"
        @click.stop="toggleExpand"
      >
        <span
          v-if="folder.isLoading"
          class="animate-spin text-[10px]"
        >⌛</span>
        <span v-else-if="folder.hasChildren">▶</span>
        <span
          v-else
          class="text-[8px]"
        >●</span>
      </span>

      <!-- Folder Icon -->
      <span class="mr-2 text-base">
        <span v-if="folder.isOpen && folder.hasChildren">📂</span>
        <span v-else>📁</span>
      </span>

      <!-- Folder Name -->
      <span class="truncate flex-1">{{ folder.name }}</span>
    </div>

    <!-- Subfolders (Rekursif) -->
    <div
      v-if="folder.isOpen && folder.children && folder.children.length > 0"
      class="ml-4 pl-2 border-l border-explorer-border/30 mt-0.5 space-y-0.5"
    >
      <FolderTreeNode
        v-for="subfolder in folder.children"
        :key="subfolder.id"
        :folder="subfolder"
        :selected-id="selectedId"
        @select="emit('select', $event)"
        @expand="emit('expand', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ClientFolderNode } from "../composables/useExplorer";

const props = defineProps<{
  folder: ClientFolderNode;
  selectedId: string | null;
}>();

const emit = defineEmits<{
  (e: "select", id: string): void;
  (e: "expand", folder: ClientFolderNode): void;
}>();

const toggleExpand = () => {
  if (props.folder.hasChildren) {
    emit("expand", props.folder);
  }
};
</script>
