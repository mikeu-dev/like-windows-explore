<template>
  <div class="select-none">
    <!-- Row Folder -->
    <div
      :id="'folder-node-' + folder.id"
      class="relative flex items-center py-1 px-2 rounded cursor-pointer transition-colors duration-150 text-body-sm group"
      :class="[
        selectedId === folder.id
          ? 'bg-primary/10 text-primary font-medium sidebar-item-active'
          : 'text-on-surface hover:bg-black/5'
      ]"
      @click="emit('select', folder.id)"
    >
      <!-- Indikator Ekspansi / Buka-Tutup (Chevron) -->
      <span
        :id="'caret-' + folder.id"
        class="w-5 h-5 flex items-center justify-center mr-1 text-on-surface-variant transition-transform duration-200"
        :class="[
          folder.isOpen ? 'rotate-90' : '',
          !folder.hasChildren ? 'opacity-20 cursor-default' : 'hover:bg-black/5 rounded'
        ]"
        @click.stop="toggleExpand"
      >
        <span v-if="folder.isLoading" class="animate-spin text-[10px]">⌛</span>
        <span v-else-if="folder.hasChildren" class="material-symbols-outlined scale-75"
          >chevron_right</span
        >
        <span v-else class="text-[8px]">•</span>
      </span>

      <!-- Folder Icon -->
      <span
        class="material-symbols-outlined mr-2 scale-90 transition-colors"
        :class="[selectedId === folder.id ? 'text-primary' : 'text-[#ffc107]']"
        :style="{ fontVariationSettings: '\'FILL\' 1' }"
      >
        folder
      </span>

      <!-- Folder Name -->
      <span class="truncate flex-1">{{ folder.name }}</span>
    </div>

    <!-- Subfolders (Rekursif) -->
    <div
      v-if="folder.isOpen && folder.children && folder.children.length > 0"
      class="pl-4 border-l border-outline-variant/30 mt-0.5 space-y-0.5 ml-4"
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

<style scoped>
.sidebar-item-active::before {
  content: "";
  position: absolute;
  left: 0;
  top: 6px;
  bottom: 6px;
  width: 3px;
  background-color: #004f96;
  border-radius: 0 4px 4px 0;
}
</style>
