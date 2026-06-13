<template>
  <div class="h-full overflow-y-auto no-scrollbar">
    <div v-if="folders.length === 0" class="text-on-surface-variant/70 text-body-sm p-4 text-center">
      Tidak ada folder root.
    </div>
    <div v-else class="space-y-0.5">
      <FolderTreeNode
        v-for="folder in folders"
        :key="folder.id"
        :folder="folder"
        :selected-id="selectedId"
        @select="emit('select', $event)"
        @expand="emit('expand', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ClientFolderNode } from "../composables/useExplorer";
import FolderTreeNode from "./FolderTreeNode.vue";

defineProps<{
  folders: ClientFolderNode[];
  selectedId: string | null;
}>();

const emit = defineEmits<{
  (e: "select", id: string): void;
  (e: "expand", folder: ClientFolderNode): void;
}>();
</script>
