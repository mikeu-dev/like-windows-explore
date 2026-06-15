<template>
  <nav
    id="breadcrumbs-nav"
    aria-label="Breadcrumb"
    class="flex items-center text-body-sm font-body-sm text-on-surface overflow-hidden whitespace-nowrap gap-1 w-full select-none"
  >
    <span class="flex items-center text-primary">
      <span class="material-symbols-outlined scale-90 mr-1.5">computer</span>
      <span class="hover:bg-secondary-container/50 px-1 rounded cursor-default font-medium"
        >This PC</span
      >
    </span>

    <!-- Separator -->
    <span class="material-symbols-outlined text-on-surface-variant scale-75">chevron_right</span>

    <!-- Folder Path Chain Iteration -->
    <template v-for="(folder, index) in path" :key="folder.id">
      <button
        :id="'breadcrumb-item-' + folder.id"
        class="hover:bg-secondary-container/50 px-1 rounded transition-colors focus:outline-none whitespace-nowrap"
        :class="[
          index === path.length - 1
            ? 'text-on-surface font-semibold cursor-default'
            : 'text-on-surface-variant font-medium'
        ]"
        :disabled="index === path.length - 1"
        @click="emit('navigate', folder.id)"
      >
        {{ folder.name }}
      </button>

      <!-- Separator between items -->
      <span
        v-if="index < path.length - 1"
        class="material-symbols-outlined text-on-surface-variant scale-75"
        >chevron_right</span
      >
    </template>
  </nav>
</template>

<script setup lang="ts">
import { FolderDTO } from "@explorer/common";

defineProps<{
  path: FolderDTO[];
}>();

const emit = defineEmits<{
  (e: "navigate", folderId: string): void;
}>();
</script>
