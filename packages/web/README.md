# Explorer Client Web - @explorer/web

This frontend client is a web-based file explorer dashboard built using Vue 3, Vite, and Tailwind CSS. It simulates the interactive experience of Windows Explorer.

## Features

- Folder Tree Sidebar: Responsive nested directory sidebar at the left panel, supporting lazy loading and unlimited recursive tree expansion.
- Split Pane Layout: Dual-panel layout dividing the navigation sidebar (left) and folder contents panel (right) cleanly.
- Breadcrumbs Nav: Address path navigation bar rendering active paths and supporting backward navigation clicks.
- Dual View Mode: Instantly toggle folder content render between "Grid" mode (large file icons) and "Detail List" mode (a structured data table showing name, type, and size).
- File Detail Modal: Double-clicking any file opens a modal overlay displaying size, type, and parent folder path.
- Global Search: Search bar with debounced input (300ms) to search files and folders globally without overloading backend.

## Source Code Structure

- src/main.ts: Application entry point booting Vue 3 context.
- src/App.vue: Parent component structuring the layout grid.
- src/assets/main.css: Tailwind directives and global CSS theme variables.
- src/services/api.ts: HTTP integration layer making API calls to backend.
- src/composables/useExplorer.ts: State management composable containing client logic, active state, and API bindings.
- src/components/: Modular Vue component directory:
  - Breadcrumbs.vue: Path navigation links.
  - ExplorerSearch.vue: Bilah pencarian global (global search input).
  - FolderTree.vue: Sidebar directory container.
  - FolderTreeNode.vue: Recursive tree item handling expansion and clicks.
  - FolderContents.vue: Main content grid showing files and subdirectories.

## Theme and Styling

The project features a sleek dark mode theme using custom variables for active state highlighting and hover transitions:

```css
:root {
  --hover-color: rgba(51, 65, 85, 0.4);
  --active-color: #38bdf8;
  --active-text-color: #0f172a;
  --border-color: rgba(51, 65, 85, 0.5);
}
```

## Environment Variables

The frontend application uses a `.env` file inside `packages/web/` folder to target the backend API:

```env
VITE_API_URL="http://127.0.0.1:3001/api/v1"
```

## Development Reference

Run these commands inside the `packages/web/` directory:

- bun dev: Spin up Vite local server (http://localhost:5173).
- bun build: Run TypeScript check and compile production-ready assets to `dist/`.
- bun preview: Serve production-build assets locally.
