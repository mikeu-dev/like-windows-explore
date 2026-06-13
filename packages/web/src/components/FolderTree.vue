<template>
  <div class="h-full overflow-y-auto pr-2">
    <div v-if="folders.length === 0" class="text-explorer-muted text-sm p-4 text-center">
      Tidak ada folder root.
    </div>
    <div v-else class="space-y-1">
      <FolderTreeNode
        v-for="folder in folders"
        :key="folder.id"
        :folder="folder"
        :selectedId="selectedId"
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
