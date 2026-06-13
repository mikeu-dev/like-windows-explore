<template>
  <div class="relative w-full max-w-sm">
    <!-- Search Icon -->
    <span
      class="absolute inset-y-0 left-0 flex items-center pl-3 text-explorer-muted pointer-events-none"
    >
      🔍
    </span>

    <!-- Input Box -->
    <input
      id="search-input"
      v-model="localQuery"
      type="text"
      placeholder="Cari file atau folder..."
      class="w-full pl-9 pr-8 py-2 text-xs bg-explorer-sidebar text-explorer-text placeholder-explorer-muted border border-explorer-border rounded-lg focus:outline-none focus:border-explorer-active focus:ring-1 focus:ring-explorer-active transition-all"
    >

    <!-- Clear Button -->
    <button
      v-if="localQuery"
      id="search-clear-btn"
      class="absolute inset-y-0 right-0 flex items-center pr-3 text-explorer-muted hover:text-explorer-text text-sm"
      @click="clearSearch"
    >
      ×
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";

const props = defineProps<{
  modelValue: string;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", val: string): void;
  (e: "search", val: string): void;
}>();

const localQuery = ref(props.modelValue);
let debounceTimeout: any = null;

// Sync input lokal jika modelValue dari parent berubah (misalnya di-clear dari luar)
watch(
  () => props.modelValue,
  (newVal) => {
    localQuery.value = newVal;
  }
);

// Menangani perubahan input dengan teknik Debounce (300ms)
watch(localQuery, (newVal) => {
  if (debounceTimeout) clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(() => {
    emit("update:modelValue", newVal);
    emit("search", newVal);
  }, 300);
});

const clearSearch = () => {
  localQuery.value = "";
  emit("update:modelValue", "");
  emit("search", "");
};
</script>
