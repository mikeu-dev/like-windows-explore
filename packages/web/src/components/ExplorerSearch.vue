<template>
  <div class="w-64 h-8 bg-surface-container border border-outline-variant rounded-sm px-2 flex items-center gap-2 group focus-within:ring-1 focus-within:ring-primary focus-within:bg-surface-container-lowest relative">
    <!-- Search Icon -->
    <span class="material-symbols-outlined text-on-surface-variant scale-90 pointer-events-none">
      search
    </span>

    <!-- Input Box -->
    <input
      id="search-input"
      v-model="localQuery"
      type="text"
      placeholder="Search like-windows-explorer"
      class="bg-transparent border-none focus:ring-0 text-body-sm font-body-sm w-full h-full p-0 pr-6 placeholder:text-on-surface-variant/60 outline-none"
    />

    <!-- Clear Button -->
    <button
      v-if="localQuery"
      id="search-clear-btn"
      class="absolute inset-y-0 right-2 flex items-center text-on-surface-variant hover:text-on-surface text-sm font-bold"
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
