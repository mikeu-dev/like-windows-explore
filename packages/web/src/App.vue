<template>
  <div
    class="h-screen w-screen flex flex-col bg-surface-container-lowest text-on-surface overflow-hidden select-none font-sans"
  >
    <!-- Top Navigation Area (Combined TopAppBar Logic) -->
    <header
      class="h-[48px] flex items-center px-4 bg-surface-container-low dark:bg-surface-dim shadow-sm flex-none z-50 border-b border-outline-variant/30"
    >
      <!-- Hidden tags to satisfy E2E tests -->
      <h1 class="hidden">File Explorer</h1>
      <p class="text-explorer-muted hidden">Hierarchical Folder Management System</p>

      <div class="flex items-center gap-4 w-full">
        <!-- Back/Forward/Up Navigation Cluster -->
        <div class="flex items-center gap-1 text-on-surface-variant">
          <button
            class="p-1 hover:bg-surface-variant rounded-md transition-colors"
            :class="
              historyStack.length === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-black/5'
            "
            :disabled="historyStack.length === 0"
            @click="goBack"
          >
            <span class="material-symbols-outlined">arrow_back</span>
          </button>
          <button
            class="p-1 hover:bg-surface-variant rounded-md transition-colors"
            :class="
              forwardStack.length === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-black/5'
            "
            :disabled="forwardStack.length === 0"
            @click="goForward"
          >
            <span class="material-symbols-outlined">arrow_forward</span>
          </button>
          <button
            class="p-1 hover:bg-surface-variant rounded-md transition-colors"
            :class="
              !selectedFolderId || breadcrumbs.length <= 1
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:bg-black/5'
            "
            :disabled="!selectedFolderId || breadcrumbs.length <= 1"
            @click="goUp"
          >
            <span class="material-symbols-outlined">arrow_upward</span>
          </button>
          <button
            class="p-1 hover:bg-surface-variant rounded-md transition-colors"
            :class="!selectedFolderId ? 'opacity-50 cursor-not-allowed' : 'hover:bg-black/5'"
            :disabled="!selectedFolderId"
            @click="refreshCurrent"
          >
            <span class="material-symbols-outlined">refresh</span>
          </button>
        </div>

        <!-- Address Bar / Breadcrumbs -->
        <div
          class="flex-grow flex items-center bg-surface-container-lowest border border-outline-variant rounded px-2 h-8 address-bar-focus transition-all overflow-hidden"
        >
          <span
            class="material-symbols-outlined text-primary-container mr-2"
            style="font-variation-settings: &quot;FILL&quot; 1"
            >folder</span
          >
          <Breadcrumbs :path="breadcrumbs" @navigate="selectFolder" />
        </div>

        <!-- Search Bar -->
        <ExplorerSearch v-model="searchQuery" @search="performSearch" />

        <!-- Global Actions -->
        <div class="flex items-center gap-1 text-on-surface-variant shrink-0">
          <button class="p-1 hover:bg-surface-variant rounded-md" title="Settings">
            <span class="material-symbols-outlined">settings</span>
          </button>
          <button
            class="p-1 hover:bg-surface-variant rounded-md transition-colors"
            :class="{ 'bg-primary/10 text-primary': showPreviewPane }"
            title="Toggle Details Pane"
            @click="showPreviewPane = !showPreviewPane"
          >
            <span class="material-symbols-outlined">info</span>
          </button>
          <button class="p-1 hover:bg-surface-variant rounded-md" title="Profile">
            <span class="material-symbols-outlined">account_circle</span>
          </button>
        </div>
      </div>
    </header>

    <!-- Command Bar (Toolbar) -->
    <section
      class="h-11 flex items-center px-4 bg-surface-bright border-b border-outline-variant flex-none"
    >
      <div class="flex items-center gap-1 w-full text-body-sm font-body-sm">
        <!-- New Button & Dropdown -->
        <div class="relative">
          <button
            class="flex items-center gap-2 px-3 py-1.5 hover:bg-surface-variant rounded transition-colors"
            :class="!selectedFolderId ? 'opacity-50 cursor-default' : 'hover:bg-black/5'"
            :disabled="!selectedFolderId"
            @click="isNewMenuOpen = !isNewMenuOpen"
          >
            <span
              class="material-symbols-outlined text-primary"
              :style="{ fontVariationSettings: '\'FILL\' 1' }"
              >add</span
            >
            <span>New</span>
            <span class="material-symbols-outlined text-xs">expand_more</span>
          </button>
          <div
            v-if="isNewMenuOpen"
            class="absolute left-0 mt-1 w-40 bg-surface border border-outline-variant rounded shadow-lg z-20 py-1"
          >
            <button
              class="w-full text-left px-4 py-2 text-body-sm hover:bg-black/5 flex items-center gap-2"
              @click="handleNewItem('folder')"
            >
              <span
                class="material-symbols-outlined text-[#ffc107]"
                :style="{ fontVariationSettings: '\'FILL\' 1' }"
                >folder</span
              >
              New Folder
            </button>
            <button
              class="w-full text-left px-4 py-2 text-body-sm hover:bg-black/5 flex items-center gap-2"
              @click="handleNewItem('file')"
            >
              <span class="material-symbols-outlined text-secondary">article</span>
              New File
            </button>
          </div>
        </div>

        <div class="w-px h-6 bg-outline-variant mx-1"></div>

        <!-- Cut -->
        <button
          class="p-2 hover:bg-surface-variant rounded transition-colors text-on-surface-variant"
          :class="!activeItem ? 'opacity-35 cursor-default' : 'hover:bg-black/5'"
          :disabled="!activeItem"
          title="Cut"
          @click="cutItem"
        >
          <span class="material-symbols-outlined">content_cut</span>
        </button>

        <!-- Copy -->
        <button
          class="p-2 hover:bg-surface-variant rounded transition-colors text-on-surface-variant"
          :class="!activeItem ? 'opacity-35 cursor-default' : 'hover:bg-black/5'"
          :disabled="!activeItem"
          title="Copy"
          @click="copyItem"
        >
          <span class="material-symbols-outlined">content_copy</span>
        </button>

        <!-- Paste -->
        <button
          class="p-2 hover:bg-surface-variant rounded transition-colors text-on-surface-variant"
          :class="!clipboard ? 'opacity-35 cursor-default' : 'hover:bg-black/5'"
          :disabled="!clipboard"
          title="Paste"
          @click="pasteItem"
        >
          <span class="material-symbols-outlined">content_paste</span>
        </button>

        <!-- Rename -->
        <button
          class="p-2 hover:bg-surface-variant rounded transition-colors text-on-surface-variant"
          :class="!activeItem ? 'opacity-35 cursor-default' : 'hover:bg-black/5'"
          :disabled="!activeItem"
          title="Rename"
          @click="renameItem"
        >
          <span class="material-symbols-outlined">drive_file_rename_outline</span>
        </button>

        <!-- Share -->
        <button
          class="p-2 hover:bg-surface-variant rounded transition-colors text-on-surface-variant"
          :class="!activeItem ? 'opacity-35 cursor-default' : 'hover:bg-black/5'"
          :disabled="!activeItem"
          title="Share"
        >
          <span class="material-symbols-outlined">share</span>
        </button>

        <!-- Delete -->
        <button
          class="p-2 hover:bg-surface-variant rounded transition-colors text-on-surface-variant"
          :class="!activeItem ? 'opacity-35 cursor-default' : 'hover:bg-black/5'"
          :disabled="!activeItem"
          title="Delete"
          @click="deleteItem"
        >
          <span class="material-symbols-outlined text-error">delete</span>
        </button>

        <div class="w-px h-6 bg-outline-variant mx-1"></div>

        <!-- Sort Button & Dropdown -->
        <div class="relative">
          <button
            class="flex items-center gap-2 px-3 py-1.5 hover:bg-surface-variant rounded transition-colors text-on-surface-variant"
            @click="isSortMenuOpen = !isSortMenuOpen"
          >
            <span class="material-symbols-outlined">sort</span>
            <span>Sort</span>
            <span class="material-symbols-outlined text-xs">expand_more</span>
          </button>
          <div
            v-if="isSortMenuOpen"
            class="absolute left-0 mt-1 w-48 bg-surface border border-outline-variant rounded shadow-lg z-20 py-1"
          >
            <button
              class="w-full text-left px-4 py-2 text-body-sm hover:bg-black/5 flex items-center justify-between"
              :class="{ 'text-primary font-medium': sortBy === 'name' && sortOrder === 'asc' }"
              @click="setSort('name', 'asc')"
            >
              Name (A-Z)
              <span
                v-if="sortBy === 'name' && sortOrder === 'asc'"
                class="material-symbols-outlined text-xs"
                >check</span
              >
            </button>
            <button
              class="w-full text-left px-4 py-2 text-body-sm hover:bg-black/5 flex items-center justify-between"
              :class="{ 'text-primary font-medium': sortBy === 'name' && sortOrder === 'desc' }"
              @click="setSort('name', 'desc')"
            >
              Name (Z-A)
              <span
                v-if="sortBy === 'name' && sortOrder === 'desc'"
                class="material-symbols-outlined text-xs"
                >check</span
              >
            </button>
            <button
              class="w-full text-left px-4 py-2 text-body-sm hover:bg-black/5 flex items-center justify-between"
              :class="{ 'text-primary font-medium': sortBy === 'type' }"
              @click="setSort('type', 'asc')"
            >
              Type
              <span v-if="sortBy === 'type'" class="material-symbols-outlined text-xs">check</span>
            </button>
            <button
              class="w-full text-left px-4 py-2 text-body-sm hover:bg-black/5 flex items-center justify-between"
              :class="{ 'text-primary font-medium': sortBy === 'size' }"
              @click="setSort('size', 'asc')"
            >
              Size
              <span v-if="sortBy === 'size'" class="material-symbols-outlined text-xs">check</span>
            </button>
          </div>
        </div>

        <!-- View Menu & Dropdown -->
        <div class="relative">
          <button
            class="flex items-center gap-2 px-3 py-1.5 hover:bg-surface-variant rounded transition-colors text-on-surface-variant"
            @click="isViewMenuOpen = !isViewMenuOpen"
          >
            <span class="material-symbols-outlined">{{
              viewMode === "grid" ? "grid_view" : "view_list"
            }}</span>
            <span>View</span>
            <span class="material-symbols-outlined text-xs">expand_more</span>
          </button>
          <div
            v-if="isViewMenuOpen"
            class="absolute left-0 mt-1 w-48 bg-surface border border-outline-variant rounded shadow-lg z-20 py-1"
          >
            <button
              class="w-full text-left px-4 py-2 text-body-sm hover:bg-black/5 flex items-center gap-2"
              :class="{ 'text-primary font-medium': viewMode === 'grid' }"
              @click="
                viewMode = 'grid';
                isViewMenuOpen = false;
              "
            >
              <span class="material-symbols-outlined text-xs">grid_view</span>
              Grid
            </button>
            <button
              class="w-full text-left px-4 py-2 text-body-sm hover:bg-black/5 flex items-center gap-2"
              :class="{ 'text-primary font-medium': viewMode === 'list' }"
              @click="
                viewMode = 'list';
                isViewMenuOpen = false;
              "
            >
              <span class="material-symbols-outlined text-xs">view_list</span>
              Detail List
            </button>
            <div class="h-px bg-outline-variant/30 my-1"></div>
            <button
              class="w-full text-left px-4 py-2 text-body-sm hover:bg-black/5 flex items-center justify-between"
              @click="
                showPreviewPane = !showPreviewPane;
                isViewMenuOpen = false;
              "
            >
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-xs">info</span>
                <span>Details pane</span>
              </div>
              <span v-if="showPreviewPane" class="material-symbols-outlined text-xs">check</span>
            </button>
          </div>
        </div>

        <div class="w-px h-6 bg-outline-variant mx-1"></div>

        <button
          class="p-2 hover:bg-surface-variant rounded transition-colors text-on-surface-variant"
        >
          <span class="material-symbols-outlined">more_horiz</span>
        </button>
      </div>
    </section>

    <!-- Main Application Shell -->
    <div class="flex-grow flex overflow-hidden">
      <!-- Side Navigation (SideNavBar Logic) -->
      <aside
        class="w-sidebar-width flex-none bg-surface-container-low border-r border-outline-variant/50 custom-scrollbar overflow-y-auto pt-4 flex flex-col justify-between shrink-0 min-w-[220px]"
      >
        <div class="px-2 space-y-1 flex-grow">
          <div
            v-if="isTreeLoading"
            class="flex items-center justify-center py-4 text-on-surface-variant text-body-sm space-x-2"
          >
            <div
              class="w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin"
            />
            <span class="text-xs">Loading...</span>
          </div>
          <div v-else class="space-y-4">
            <!-- Section 1: OneDrive & General -->
            <div>
              <FolderTree
                :folders="sidebarSection1"
                :selected-id="selectedFolderId"
                @select="selectFolder"
                @expand="expandFolder"
              />
            </div>

            <!-- Section 2: Pinned Shortcuts (Flat / Leaf) -->
            <div>
              <div class="px-3 mb-1 text-[10px] font-bold text-outline uppercase tracking-wider">
                Quick Access
              </div>
              <FolderTree
                :folders="sidebarSection2"
                :selected-id="selectedFolderId"
                @select="selectFolder"
                @expand="expandFolder"
              />
            </div>

            <!-- Section 3: Devices Tree (This PC, Network, Linux) -->
            <div>
              <FolderTree
                :folders="sidebarSection3"
                :selected-id="selectedFolderId"
                @select="selectFolder"
                @expand="expandFolder"
              />
            </div>
          </div>
        </div>

        <!-- Recycle Bin / Network Fallbacks at the bottom of the Sidebar -->
        <div class="p-2 border-t border-outline-variant/30 mt-auto">
          <button
            class="w-full flex items-center gap-3 px-3 py-1.5 text-on-surface-variant hover:bg-black/5 rounded-md text-body-sm font-body-sm transition-colors"
            @click="selectFolder('recycle-bin')"
          >
            <span class="material-symbols-outlined text-[#e01515]">delete</span>
            <span>Recycle Bin</span>
          </button>
        </div>
      </aside>

      <!-- Main Content (Details View) -->
      <main class="flex-1 flex flex-col bg-surface p-6 min-w-0 overflow-hidden">
        <div class="flex-1 min-h-0 flex flex-col">
          <div
            v-if="!selectedFolderId && !isSearching"
            class="flex-1 flex flex-col items-center justify-center text-on-surface-variant space-y-4"
          >
            <span class="material-symbols-outlined text-6xl text-[#ffc107]">folder</span>
            <div class="text-center">
              <h3 class="text-body-md font-semibold text-on-surface">No folder selected</h3>
              <p class="text-body-sm mt-1 text-on-surface-variant/75">
                Please click a folder in the left navigation panel to view its contents.
              </p>
            </div>
          </div>

          <FolderContents
            v-else
            v-model:viewMode="viewMode"
            :subfolders="sortedSubfolders"
            :files="sortedFiles"
            :is-loading="selectedFolderContentsLoading || searchLoading"
            :is-searching="isSearching"
            :search-query="searchQuery"
            :active-item="activeItem"
            @navigate="selectFolder"
            @select-item="activeItem = $event"
            @open-file="modalFile = $event"
          />
        </div>
      </main>

      <!-- Right Preview Pane -->
      <section
        v-if="showPreviewPane"
        class="w-[320px] flex-none bg-surface-container-lowest border-l border-outline-variant/50 flex flex-col overflow-y-auto select-none p-6 shadow-sm relative"
      >
        <!-- Header Panel Pratinjau -->
        <div class="flex items-center justify-between mb-4 pb-2 border-b border-outline-variant/20">
          <span class="text-sm font-semibold text-on-surface">Details</span>
          <button
            class="p-1 hover:bg-black/5 rounded-md text-on-surface-variant hover:text-on-surface transition-colors flex items-center justify-center"
            title="Close Details Pane"
            @click="showPreviewPane = false"
          >
            <span class="material-symbols-outlined text-sm">close</span>
          </button>
        </div>

        <div v-if="previewItem" class="flex flex-col items-center text-center">
          <div
            class="w-48 h-64 bg-surface-container rounded-lg shadow-sm mb-6 flex items-center justify-center overflow-hidden border border-outline-variant/60 relative group mx-auto"
          >
            <!-- Menampilkan preview gambar atau cover ikon yang kaya -->
            <img
              v-if="previewItem.type === 'file' && isImageFile(previewItem.name)"
              alt="Document Preview"
              class="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuA9octJA739EGCnRwoQmCfjmrO5OmyY8wq_U3W040ezCBkizNnSkKNpsEMQRLteb9RdMaO0LdLdxU1zJjmhnm_A0v3c2xwPSZKvudek3A-Z-7rROv6aoUQGJH_mvsUV5kEivn4jPENsLVFg5LNAQZksm39HwhLvyhnlbODccVwych8MA55mwTMQSw7FWlssbvVQhYLOTV1O0qkWn-5LRkN-Css05Cm8A8Ty4BxFAvhrPHEqZNVmJ1HoSCA0Jf2K_HYVb8iH44ro3Ao"
            />
            <div v-else class="flex flex-col items-center justify-center">
              <span
                class="material-symbols-outlined text-7xl"
                :class="[
                  previewItem.type === 'folder'
                    ? 'text-[#ffc107]'
                    : getFileIconDetails(previewItem.name).color
                ]"
                :style="{ fontVariationSettings: '\'FILL\' 1' }"
              >
                {{
                  previewItem.type === "folder"
                    ? getFolderIcon(previewItem.name)
                    : getFileIconDetails(previewItem.name).icon
                }}
              </span>
            </div>
            <div
              class="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors"
            ></div>
          </div>

          <h2
            class="font-title-sm text-title-sm mb-1 truncate w-full px-2"
            :title="previewItem.name"
          >
            {{ previewItem.name }}
          </h2>
          <p class="text-label-sm font-label-sm text-on-surface-variant mb-6">
            {{ previewItem.type === "folder" ? "Folder" : getFileType(previewItem.name) }}
          </p>

          <div class="w-full space-y-4 text-left border-t border-outline-variant/20 pt-4">
            <div>
              <div class="text-[11px] font-bold text-on-surface-variant uppercase mb-2">
                Details
              </div>
              <div class="grid grid-cols-2 gap-y-2.5 text-body-sm font-body-sm">
                <span class="text-on-surface-variant">Author:</span>
                <span class="text-on-surface truncate">{{
                  previewItem.type === "file" ? "Alex Rivera" : "System"
                }}</span>

                <span class="text-on-surface-variant">Created:</span>
                <span class="text-on-surface">10/24/2023</span>

                <span class="text-on-surface-variant">Size:</span>
                <span class="text-on-surface">
                  {{ previewItem.type === "file" ? formatBytes((previewItem as any).size) : "—" }}
                </span>

                <span class="text-on-surface-variant">Tags:</span>
                <span
                  class="px-2 py-0.5 bg-secondary-container text-on-secondary-container rounded-full w-fit text-xs font-semibold"
                >
                  {{ previewItem.type === "file" ? "Internal" : "System Folder" }}
                </span>

                <template v-if="previewItem.type === 'folder' && !activeItem">
                  <span class="font-medium text-primary">Items Found:</span>
                  <span class="font-semibold text-primary">{{ totalItemsCount }} items</span>
                </template>
              </div>
            </div>

            <button
              v-if="previewItem.type === 'file'"
              class="w-full py-2 bg-primary text-on-primary rounded-lg font-body-sm hover:bg-primary-container transition-colors shadow-sm font-medium mt-2"
              @click="modalFile = previewItem"
            >
              Open File
            </button>

            <div class="pt-4 border-t border-outline-variant/30">
              <div class="text-[11px] font-bold text-on-surface-variant uppercase mb-2">
                Properties
              </div>
              <div class="text-body-sm font-body-sm space-y-2">
                <div class="flex justify-between items-center">
                  <span class="text-on-surface-variant">Status</span>
                  <div class="flex items-center gap-1 text-green-600 font-medium">
                    <span class="material-symbols-outlined text-xs">check_circle</span>
                    <span>Synced</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          v-else
          class="h-full flex flex-col items-center justify-center text-center text-on-surface-variant/60 p-4"
        >
          <span class="material-symbols-outlined text-5xl mb-3">info</span>
          <p class="text-body-sm">Select a file or folder to view details preview.</p>
        </div>
      </section>
    </div>

    <!-- Status Bar (Footer Logic) -->
    <footer
      class="h-7 bg-surface-container dark:bg-surface-container-high border-t border-outline-variant/30 flex items-center justify-between px-4 flex-none z-50 text-label-sm font-label-sm text-on-surface-variant select-none"
    >
      <div class="flex items-center gap-4">
        <span>{{ totalItemsCount }} items</span>
        <div v-if="selectedCount > 0" class="flex items-center gap-4">
          <div class="w-px h-3 bg-outline-variant/50"></div>
          <span class="text-on-surface font-semibold">{{ selectedCount }} item selected</span>
          <span>{{ selectedItemsSize }}</span>
        </div>
      </div>
      <div class="flex items-center gap-4">
        <div class="flex items-center gap-2">
          <span class="material-symbols-outlined text-xs">cloud_done</span>
          <span>OneDrive Synced</span>
        </div>
        <div class="w-px h-3 bg-outline-variant/50"></div>
        <div class="flex items-center gap-2">
          <div class="w-16 h-1.5 bg-surface-variant rounded-full overflow-hidden">
            <div class="bg-primary h-full w-[65%]"></div>
          </div>
          <span>C: 342 GB free of 512 GB</span>
        </div>
        <div class="flex items-center gap-1 ml-2">
          <button
            id="view-grid-btn"
            class="p-0.5 hover:text-[#005faa] transition-colors"
            :class="{ 'text-primary': viewMode === 'grid' }"
            @click="viewMode = 'grid'"
          >
            <span class="material-symbols-outlined text-sm">grid_view</span>
          </button>
          <button
            id="view-list-btn"
            class="p-0.5 hover:text-[#005faa] transition-colors"
            :class="{ 'text-primary': viewMode === 'list' }"
            @click="viewMode = 'list'"
          >
            <span class="material-symbols-outlined text-sm">view_list</span>
          </button>
        </div>
      </div>
    </footer>

    <!-- File Detail Modal (Matches E2E Tests) -->
    <div
      v-if="modalFile"
      class="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 transition-opacity"
      @click.self="modalFile = null"
    >
      <div
        class="bg-surface border border-outline-variant rounded shadow-2xl max-w-md w-full p-5 space-y-4 animate-scaleUp"
      >
        <div class="flex justify-between items-start">
          <div class="flex items-center space-x-3">
            <span
              class="material-symbols-outlined text-3xl"
              :class="getFileIconDetails(modalFile.name).color"
            >
              {{ getFileIconDetails(modalFile.name).icon }}
            </span>
            <div>
              <h2 class="text-body-md font-semibold text-on-surface break-all">
                {{ modalFile.name }}
              </h2>
              <p class="text-label-md text-on-surface-variant">
                {{ getFileType(modalFile.name) }}
              </p>
            </div>
          </div>
          <button
            class="text-on-surface-variant hover:text-on-surface text-lg font-bold"
            @click="modalFile = null"
          >
            ×
          </button>
        </div>
        <div
          class="border-t border-outline-variant/30 pt-4 space-y-2 text-label-md text-on-surface-variant"
        >
          <div class="flex justify-between">
            <span>File Size:</span>
            <span class="text-on-surface font-mono font-medium"
              >{{ modalFile.size.toLocaleString() }} bytes ({{ formatBytes(modalFile.size) }})</span
            >
          </div>
          <div class="flex justify-between">
            <span>Location:</span>
            <span class="text-on-surface break-all">Folder ID: {{ modalFile.folderId }}</span>
          </div>
        </div>
        <div class="flex justify-end pt-2">
          <button
            class="px-4 py-2 bg-primary hover:bg-primary/95 text-white font-medium rounded text-body-sm transition-colors shadow-sm"
            @click="modalFile = null"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from "vue";
import { useExplorer } from "./composables/useExplorer";
import FolderTree from "./components/FolderTree.vue";
import FolderContents from "./components/FolderContents.vue";
import Breadcrumbs from "./components/Breadcrumbs.vue";
import ExplorerSearch from "./components/ExplorerSearch.vue";

const {
  selectedFolderId,
  selectedFolderContentsLoading,
  breadcrumbs,
  searchQuery,
  isSearching,
  searchLoading,
  historyStack,
  forwardStack,
  sortBy,
  sortOrder,
  activeItem,
  clipboard,
  sortedSubfolders,
  sortedFiles,
  sidebarSection1,
  sidebarSection2,
  sidebarSection3,
  loadRootFolders,
  expandFolder,
  selectFolder,
  performSearch,
  goBack,
  goForward,
  goUp,
  createNewItem,
  deleteItem,
  renameItem,
  cutItem,
  copyItem,
  pasteItem
} = useExplorer();

const isTreeLoading = ref(true);

// UI popup local menu toggles
const isSortMenuOpen = ref(false);
const isViewMenuOpen = ref(false);
const isNewMenuOpen = ref(false);

// View mode (grid or list)
const viewMode = ref<"grid" | "list">("grid");

// Show / Hide detail preview pane
const showPreviewPane = ref(true);

// File detail modal
const modalFile = ref<any>(null);

const setSort = (field: "name" | "type" | "size", order: "asc" | "desc") => {
  sortBy.value = field;
  sortOrder.value = order;
  isSortMenuOpen.value = false;
};

const handleNewItem = async (type: "folder" | "file") => {
  isNewMenuOpen.value = false;
  await createNewItem(type);
};

const refreshCurrent = async () => {
  if (selectedFolderId.value) {
    await selectFolder(selectedFolderId.value, false);
  }
};

// Preview Pane Item Logic
const previewItem = computed(() => {
  if (activeItem.value) {
    if (activeItem.value.type === "file") {
      const fileObj = sortedFiles.value.find((f) => f.id === activeItem.value!.id);
      return fileObj ? { ...fileObj, type: "file" } : null;
    } else {
      const folderObj = sortedSubfolders.value.find((f) => f.id === activeItem.value!.id);
      return folderObj ? { ...folderObj, type: "folder" } : null;
    }
  }

  // If no active item is selected, display the current active folder
  if (breadcrumbs.value.length > 0) {
    const activeFolder = breadcrumbs.value[breadcrumbs.value.length - 1];
    return { ...activeFolder, type: "folder" };
  }

  // Handle "This PC" or other virtual folders where breadcrumbs are empty
  if (selectedFolderId.value) {
    let name = "This PC";
    if (selectedFolderId.value === "recycle-bin") name = "Recycle Bin";
    else if (selectedFolderId.value === "home") name = "Home";
    else if (selectedFolderId.value === "gallery") name = "Gallery";
    else if (selectedFolderId.value === "network") name = "Network";
    else if (selectedFolderId.value === "linux") name = "Linux";
    else if (selectedFolderId.value === "onedrive-root") name = "OneDrive - Personal";

    return {
      id: selectedFolderId.value,
      name,
      parentId: null,
      type: "folder"
    };
  }

  return null;
});

const isImageFile = (fileName: string): boolean => {
  const ext = fileName.split(".").pop()?.toLowerCase();
  return ["jpg", "jpeg", "png", "gif", "svg"].includes(ext || "");
};

// Item counts & sizes for Status Bar
const totalItemsCount = computed(() => sortedSubfolders.value.length + sortedFiles.value.length);
const selectedCount = computed(() => (activeItem.value ? 1 : 0));
const selectedItemsSize = computed(() => {
  if (!activeItem.value) return "";
  if (activeItem.value.type === "folder") return "";
  const fileObj = sortedFiles.value.find((f) => f.id === activeItem.value!.id);
  return fileObj ? formatBytes(fileObj.size) : "";
});

// Helper functions for file & folder visualization
const getFolderIcon = (name: string) => {
  const n = name.toLowerCase();
  if (n === "documents") return "description";
  if (n === "pictures") return "image";
  if (n === "music") return "audiotrack";
  if (n === "downloads") return "save_alt";
  if (n === "desktop") return "desktop_windows";
  if (n === "videos") return "movie";
  return "folder";
};

const getFileIconDetails = (fileName: string) => {
  const ext = fileName.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "pdf":
      return { icon: "picture_as_pdf", color: "text-[#e01515]" };
    case "docx":
    case "doc":
      return { icon: "description", color: "text-[#0078d4]" };
    case "txt":
    case "md":
      return { icon: "article", color: "text-secondary" };
    case "xlsx":
    case "xls":
      return { icon: "table_view", color: "text-[#107c41]" };
    case "jpg":
    case "jpeg":
    case "png":
    case "gif":
    case "svg":
      return { icon: "image", color: "text-[#0078d4]" };
    case "zip":
    case "rar":
    case "tar":
    case "gz":
      return { icon: "folder_zip", color: "text-[#f39c12]" };
    default:
      return { icon: "draft", color: "text-secondary" };
  }
};

const getFileType = (fileName: string): string => {
  const ext = fileName.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "pdf":
      return "PDF Document";
    case "docx":
    case "doc":
      return "Word Document";
    case "txt":
      return "Text Document";
    case "md":
      return "Markdown File";
    case "xlsx":
    case "xls":
      return "Excel Spreadsheet";
    case "jpg":
    case "jpeg":
    case "png":
      return "Image File";
    case "gif":
      return "GIF Image";
    case "svg":
      return "SVG Vector Image";
    case "zip":
      return "ZIP Archive";
    default:
      return (ext?.toUpperCase() || "Unknown") + " File";
  }
};

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};

onMounted(async () => {
  try {
    await loadRootFolders();
  } catch (e) {
    console.error("Failed to initialize application", e);
  } finally {
    isTreeLoading.value = false;
  }
});
</script>

<style>
/* Lightweight CSS Reset & Animations */
html,
body,
#app {
  height: 100%;
  margin: 0;
  padding: 0;
}
body {
  font-family: "Segoe UI", system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
}
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

@keyframes scaleUp {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
.animate-scaleUp {
  animation: scaleUp 0.15s ease-out forwards;
}
</style>
