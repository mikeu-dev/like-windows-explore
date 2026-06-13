<template>
  <nav id="breadcrumbs-nav" aria-label="Breadcrumb" class="flex items-center space-x-1.5 text-xs select-none overflow-x-auto py-1">
    <!-- Home / Root Node -->
    <span class="flex items-center">
      <span class="mr-1">💻</span>
      <span class="text-explorer-muted font-medium">Ini PC</span>
    </span>

    <!-- Separator -->
    <span class="text-explorer-muted/50">/</span>

    <!-- Iterasi Rantai Path Folder -->
    <template v-for="(folder, index) in path" :key="folder.id">
      <button
        :id="'breadcrumb-item-' + folder.id"
        class="hover:text-explorer-active hover:underline transition-colors focus:outline-none font-medium whitespace-nowrap"
        :class="[index === path.length - 1 ? 'text-explorer-text cursor-default font-semibold' : 'text-explorer-muted']"
        :disabled="index === path.length - 1"
        @click="emit('navigate', folder.id)"
      >
        {{ folder.name }}
      </button>

      <!-- Separator di antara items -->
      <span v-if="index < path.length - 1" class="text-explorer-muted/50">/</span>
    </template>
  </nav>
</template>

<script setup lang="ts">
import { FolderDTO } from '@explorer/common';

defineProps<{
  path: FolderDTO[];
}>();

const emit = defineEmits<{
  (e: 'navigate', folderId: string): void;
}>();
</script>
