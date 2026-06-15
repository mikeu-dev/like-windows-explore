# @explorer/web — Frontend Client

Web-based file explorer client built with **Vue 3** (Composition API), **Vite**, and **Tailwind CSS 3**. The interface simulates the interactive experience of Windows Explorer with a light-mode Material Design 3 color palette.

## Features

- **Folder Tree Sidebar**: Three-section sidebar with lazy-loading recursive directory expansion, virtual shortcut folders, and collapsible groups (This PC, Network, Linux).
- **Dual-Panel Split Layout**: Left sidebar for navigation, right panel for folder contents.
- **Breadcrumb Address Bar**: Clickable path segments with keyboard focus highlighting.
- **Dual View Modes**: Grid (icon tiles) and Detail List (table with Name, Type, Size columns), switchable via footer buttons.
- **CRUD Toolbar**: Create (folder/file), Rename, Delete, Cut, Copy, Paste actions.
- **File Detail Modal**: Double-click files to view metadata (name, type, size, folder).
- **Global Search**: Debounced 300ms input with live filtering across all folders and files.
- **Client-Side Sorting**: Sort by Name (A-Z / Z-A), File Type, or File Size.
- **History Navigation**: Back, Forward, Up, and Refresh controls with dual-stack history tracking.

---

## Source Code Structure

```
src/
├── main.ts                   # Vue 3 app entry point
├── App.vue                   # Root layout (sidebar + toolbar + content panel)
├── App.test.ts               # App component unit tests
├── test-env.d.ts             # Test environment type declarations
├── assets/
│   └── main.css              # Tailwind directives + custom scrollbar + Mica effect
├── components/
│   ├── Breadcrumbs.vue       # Address bar path navigation
│   ├── Breadcrumbs.test.ts   # Props and event emission tests
│   ├── ExplorerSearch.vue    # Search input with debounce + clear button
│   ├── ExplorerSearch.test.ts
│   ├── FolderTree.vue        # Sidebar container (iterates sections)
│   ├── FolderTree.test.ts
│   ├── FolderTreeNode.vue    # Recursive tree item (self-referencing component)
│   ├── FolderTreeNode.test.ts
│   ├── FolderContents.vue    # Content panel (grid / table / empty state / modal)
│   └── FolderContents.test.ts
├── composables/
│   ├── useExplorer.ts        # Centralized state management + API bindings
│   └── useExplorer.test.ts   # Composable unit tests
└── services/
    └── api.ts                # HTTP client wrapping all backend API calls
```

---

## Theme and Styling

The UI uses a **light-mode** Material Design 3 color palette defined in `tailwind.config.js`:

| Token | Value | Usage |
| --- | --- | --- |
| `primary` | `#005faa` | Active links, selection highlights |
| `primary-container` | `#0078d4` | Folder icons, accent elements |
| `surface` / `background` | `#f9f9f9` | Page background |
| `on-surface` | `#1a1c1c` | Body text |
| `secondary` | `#5d5f5f` | Muted text |
| `outline-variant` | `#c0c7d4` | Borders, dividers |
| `surface-container-low` | `#f3f3f4` | Sidebar background |

Custom CSS utilities:

- **`.mica-effect`**: Backdrop blur + saturation for glassmorphism effect.
- **`.custom-scrollbar`**: Slim 4px scrollbar with rounded thumb.
- **`.address-bar-focus`**: White background + blue ring on focus-within.

Typography uses the **Inter** font family.

---

## State Management

State is centralized in the `useExplorer` composable (`src/composables/useExplorer.ts`) without external state libraries:

### Reactive State

| State | Type | Purpose |
| --- | --- | --- |
| `rootFolders` | `ClientFolderNode[]` | Top-level disk drives (under This PC) |
| `selectedFolderId` | `string \| null` | Currently selected folder |
| `selectedFolderContents` | `FolderContentsDTO` | Contents of the right panel |
| `breadcrumbs` | `FolderDTO[]` | Active breadcrumb path |
| `historyStack` / `forwardStack` | `string[]` | Navigation history stacks |
| `searchQuery` / `searchResults` | — | Search state |
| `sortBy` / `sortOrder` | — | Sorting criteria and direction |
| `activeItem` | — | Selected item (for CRUD operations) |
| `clipboard` | — | Cut/Copy clipboard (item, type, action, source) |
| `folderMap` | `Map<string, ClientFolderNode>` | O(1) reactive node lookup |

### Sidebar Sections (Computed)

1. **Section 1**: Home, Gallery, OneDrive — Personal
2. **Section 2**: Desktop, Downloads, Documents, Pictures, Music, Videos (pinned shortcuts resolved from database)
3. **Section 3**: This PC (collapsible with disk drives), Network, Linux

### Virtual Folders

IDs like `this-pc`, `home`, `gallery`, `network`, `linux` exist only on the client side. They render static or aggregated content without querying a specific database record.

---

## Environment Variables

Create a `.env` file inside `packages/web/`:

```env
VITE_API_URL="http://127.0.0.1:3001/api/v1"
```

A `.env.example` file is provided as reference.

---

## Development Commands

Run from `packages/web/` or from the monorepo root:

| Command | Description |
| --- | --- |
| `bun dev` | Start Vite dev server (http://localhost:5173) |
| `bun build` | TypeScript check + production build to `dist/` |
| `bun preview` | Serve production assets locally |

---

## Testing

Component and composable unit tests use **Bun Test**, **@vue/test-utils**, and **happy-dom**:

| Test File | Coverage |
| --- | --- |
| `App.test.ts` | Root layout rendering, sidebar sections, empty state |
| `Breadcrumbs.test.ts` | Props binding, path rendering, navigate event emission |
| `ExplorerSearch.test.ts` | Input sync, search event, clear button, debounce handling |
| `FolderTree.test.ts` | Section rendering, empty state, select/expand event propagation |
| `FolderTreeNode.test.ts` | Recursive rendering, chevron toggle, folder icon resolution |
| `FolderContents.test.ts` | Grid/List mode rendering, file icons, item click events |
| `useExplorer.test.ts` | State management, API integration, navigation history |

Run all frontend tests:

```bash
bun test packages/web
```
