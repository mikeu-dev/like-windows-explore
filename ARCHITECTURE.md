# Architecture — Like Windows Explorer

This document describes the software architecture, design patterns, scalability strategies, and testing methodology implemented in this hierarchical file explorer web application.

---

## 1. Monorepo Architecture (Bun Workspaces)

The project is structured as a monorepo using Bun Workspaces with four isolated packages:

| Package | Purpose | Key Dependencies |
| --- | --- | --- |
| `packages/common` | Shared TypeScript DTO type contracts | None (pure types) |
| `packages/api` | REST API backend (HTTP transport + business logic + data access) | Elysia.js, Drizzle ORM, postgres.js |
| `packages/web` | Frontend client (SPA) | Vue 3, Vite, Tailwind CSS 3 |
| `packages/e2e` | End-to-end integration tests | Playwright |

**Key benefits:**

- **Compile-time type safety**: Both `@explorer/api` and `@explorer/web` import DTOs from `@explorer/common` via `workspace:*` linking. Any schema change is flagged at compile time, preventing runtime contract violations.
- **Clean separation of concerns**: Each package has its own `tsconfig.json`, dependencies, and build lifecycle.
- **Single-command orchestration**: Root-level scripts coordinate all packages (`bun dev`, `bun test`, `bun check`).

```
like-windows-explore/
├── packages/
│   ├── common/
│   │   └── src/
│   │       ├── types.ts          # FolderDTO, FileDTO, FolderContentsDTO, SearchResultsDTO
│   │       └── index.ts          # Barrel export
│   ├── api/
│   │   └── src/
│   │       ├── domain/entities/  # Folder, File (plain interfaces)
│   │       ├── repositories/     # IFolderRepository, IFileRepository (ports)
│   │       │                     # DrizzleFolderRepository, DrizzleFileRepository (adapters)
│   │       ├── services/         # ExplorerService (application core)
│   │       ├── controllers/v1/   # explorerController (HTTP transport)
│   │       ├── db/               # Connection, schema, seeds
│   │       └── index.ts          # Elysia app entry point
│   ├── web/
│   │   └── src/
│   │       ├── components/       # Breadcrumbs, ExplorerSearch, FolderTree,
│   │       │                     # FolderTreeNode, FolderContents
│   │       ├── composables/      # useExplorer (state management + API bindings)
│   │       ├── services/         # explorerApi (HTTP client)
│   │       ├── assets/           # main.css (Tailwind directives + custom styles)
│   │       ├── App.vue           # Root layout component
│   │       └── main.ts           # Vue 3 entry point
│   └── e2e/
│       ├── tests/
│       │   └── explorer.e2e.ts   # Playwright test suite (7 scenarios)
│       └── playwright.config.ts  # Auto-orchestrates API + web dev servers
```

---

## 2. Backend Architecture (Clean / Hexagonal Architecture)

The API package follows Clean Architecture principles, ensuring strict separation between business logic, transport, and data persistence.

### Dependency Flow

```
Controller (HTTP Transport)
    ↓ calls
Service (Application Core / Use Cases)
    ↓ calls via interface
Repository Interface (Port)
    ↓ implemented by
Drizzle Repository (Adapter → PostgreSQL)
```

### Layer Descriptions

#### Domain Entities (`src/domain/entities/`)

Plain TypeScript interfaces (`Folder`, `File`) representing the core data model. These have zero external dependencies, ensuring business logic remains decoupled from any framework or database technology.

```typescript
// Folder entity
interface Folder {
  id: string;
  name: string;
  parentId: string | null;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Repository Interfaces — Ports (`src/repositories/*.interface.ts`)

Abstraction layer defining data access contracts:

- `IFolderRepository`: `findSubfolders()`, `findById()`, `searchFolders()`, `create()`, `update()`, `delete()`
- `IFileRepository`: `findFilesByFolderId()`, `findById()`, `searchFiles()`, `create()`, `update()`, `delete()`

The service layer depends only on these interfaces, not on concrete database implementations.

#### Drizzle Repositories — Adapters (`src/repositories/drizzle-*.ts`)

Concrete implementations of repository interfaces using Drizzle ORM to query PostgreSQL. Swapping to another database engine (e.g., MySQL, MongoDB) requires only writing new adapter classes without modifying the service or controller layers.

#### Service Layer — Application Core (`src/services/explorer.service.ts`)

Contains all business logic and use cases:

| Method | Functionality |
| --- | --- |
| `getSubfolders(parentId)` | Fetch direct child folders (lazy loading) |
| `getFolderContents(folderId)` | Fetch subfolders + files (right panel) |
| `getFolderPath(folderId)` | Build breadcrumb path by traversing parent hierarchy |
| `search(query)` | Global case-insensitive search (min 2 characters) |
| `createFolder(name, parentId)` | Create new folder |
| `createFile(name, folderId, size)` | Create new file |
| `renameFolder(id, name)` | Rename a folder |
| `renameFile(id, name)` | Rename a file |
| `moveFolder(id, parentId)` | Move folder to new parent (Cut & Paste) |
| `moveFile(id, folderId)` | Move file to new folder (Cut & Paste) |
| `copyFolder(id, parentId)` | Recursively deep-copy folder tree + files |
| `copyFile(id, folderId)` | Copy file to target folder |
| `deleteFolder(id)` | Delete folder (cascading) |
| `deleteFile(id)` | Delete file |
| `getShortcutFolderIds()` | Resolve Windows-style shortcut folder IDs |

**Dependency Injection**: The `ExplorerService` constructor accepts `IFolderRepository` and `IFileRepository` via constructor injection, enabling seamless mock substitution during unit testing.

#### Controller Layer — HTTP Transport (`src/controllers/v1/explorer.controller.ts`)

Elysia.js router exposing 14 RESTful endpoints under the `/api/v1` prefix. Request payloads are validated using Elysia's TypeBox schema definitions.

---

## 3. API Endpoint Catalog

All endpoints are prefixed with `/api/v1`.

### Query Endpoints

| Method | Route | Description |
| --- | --- | --- |
| `GET` | `/shortcuts` | Get shortcut folder IDs (Desktop, Downloads, Documents, etc.) |
| `GET` | `/folders?parentId=` | Get direct subfolders (root if `parentId` omitted) |
| `GET` | `/folders/:id/contents` | Get subfolders + files for a folder |
| `GET` | `/folders/:id/path` | Get breadcrumb path from folder to root |
| `GET` | `/search?q=` | Global search (min 2 chars, case-insensitive) |

### Mutation Endpoints

| Method | Route | Body | Description |
| --- | --- | --- | --- |
| `POST` | `/folders` | `{ name, parentId }` | Create new folder |
| `POST` | `/files` | `{ name, folderId, size? }` | Create new file |
| `PATCH` | `/folders/:id` | `{ name? }` or `{ parentId? }` | Rename or move folder |
| `PATCH` | `/files/:id` | `{ name? }` or `{ folderId? }` | Rename or move file |
| `POST` | `/folders/:id/copy` | `{ parentId }` | Recursively copy folder tree |
| `POST` | `/files/:id/copy` | `{ folderId }` | Copy file to target folder |
| `DELETE` | `/folders/:id` | — | Delete folder (cascade) |
| `DELETE` | `/files/:id` | — | Delete file |

---

## 4. Database Schema

PostgreSQL with Drizzle ORM. Schema defined in `packages/api/src/db/schema/`.

### `folders` Table

| Column | Type | Constraints |
| --- | --- | --- |
| `id` | UUID | Primary key, default random |
| `name` | TEXT | NOT NULL |
| `parent_id` | UUID | FK → `folders.id`, ON DELETE CASCADE, nullable |
| `created_at` | TIMESTAMP | NOT NULL, default NOW |
| `updated_at` | TIMESTAMP | NOT NULL, default NOW |

**Indices**: `folders_parent_id_idx`, `folders_parent_name_idx` (composite on `parent_id, name`)

### `files` Table

| Column | Type | Constraints |
| --- | --- | --- |
| `id` | UUID | Primary key, default random |
| `name` | TEXT | NOT NULL |
| `size` | INTEGER | NOT NULL, default 0 |
| `folder_id` | UUID | FK → `folders.id`, ON DELETE CASCADE, NOT NULL |
| `created_at` | TIMESTAMP | NOT NULL, default NOW |
| `updated_at` | TIMESTAMP | NOT NULL, default NOW |

**Indices**: `files_folder_id_idx`, `files_folder_name_idx` (composite on `folder_id, name`)

---

## 5. Scalability and Performance

### Lazy Loading Directory Trees

The frontend only fetches root-level folders on initial load. When a user clicks the chevron to expand a folder, a separate API call fetches direct children for that specific folder ID. This prevents the DOM from choking on large datasets and minimizes network payloads.

### Efficient Child Detection via EXISTS Subquery

To display expansion chevrons, the backend needs to determine if a folder has children. Instead of using `COUNT(*)` (which scans all rows), the Drizzle repository uses:

```sql
EXISTS(SELECT 1 FROM folders sub WHERE sub.parent_id = "folders"."id")
```

PostgreSQL's query planner short-circuits on the first match, yielding O(1) amortized cost when the `folders_parent_id_idx` index is utilized.

### Database Indexing Strategy

- **`folders_parent_id_idx`**: Optimizes parent-child traversal queries (critical for lazy loading).
- **`folders_parent_name_idx`**: Composite index accelerating alphabetically-sorted subfolder retrieval.
- **`files_folder_id_idx`**: Speeds up file listing within directories.
- **`files_folder_name_idx`**: Composite index for sorted file retrieval.

### Client-Side O(1) Node Lookup

The `useExplorer` composable maintains a reactive `folderMap` (`Map<string, ClientFolderNode>`) that stores all loaded tree nodes. This allows instant O(1) lookup for any folder node by ID, avoiding recursive tree traversal when expanding parents, selecting folders, or syncing sidebar state.

### Search Debouncing

The `ExplorerSearch` component employs a 300ms debounce buffer. API search requests are only dispatched after the user pauses typing for 300ms, preventing backend overload.

---

## 6. Frontend Architecture

### Component Hierarchy

```
App.vue (root layout)
├── ExplorerSearch.vue      # Search bar with debounce
├── Breadcrumbs.vue         # Address bar / path navigation
├── FolderTree.vue          # Sidebar directory container
│   └── FolderTreeNode.vue  # Recursive tree item (self-referencing)
└── FolderContents.vue      # Main content panel (grid / detail list)
```

### State Management — `useExplorer` Composable

Centralized state management implemented as a Vue 3 composable (`src/composables/useExplorer.ts`) without external state libraries. Key state objects:

| State | Purpose |
| --- | --- |
| `rootFolders` | Top-level folder nodes (under "This PC") |
| `selectedFolderId` | Currently selected folder ID |
| `selectedFolderContents` | Subfolders + files of the selected folder |
| `breadcrumbs` | Active path segments for address bar |
| `searchQuery` / `searchResults` | Global search state |
| `historyStack` / `forwardStack` | Navigation history (Back / Forward) |
| `sortBy` / `sortOrder` | Client-side sorting criteria |
| `activeItem` | Currently highlighted item (for CRUD actions) |
| `clipboard` | Cut/Copy clipboard state (item, type, action) |
| `folderMap` | O(1) reactive node lookup map |
| `sidebarSection1/2/3` | Computed sidebar sections (Home/Gallery/OneDrive, Shortcuts, This PC/Network/Linux) |

### Sidebar Layout (3 Sections)

1. **Section 1**: Home, Gallery, OneDrive — Personal
2. **Section 2**: Pinned shortcuts — Desktop, Downloads, Documents, Pictures, Music, Videos
3. **Section 3**: Collapsible nodes — This PC (contains disk drives), Network, Linux

### Virtual Folders

Some sidebar items (Home, Gallery, Network, Linux, This PC) are "virtual folders" that exist only in the frontend. They display static or aggregated content rather than querying a specific database folder ID.

### Theming

The UI uses a **light mode** Material Design 3 color palette configured in `tailwind.config.js`. Key design tokens include:

- `primary`: `#005faa`
- `primary-container`: `#0078d4`
- `surface`: `#f9f9f9`
- `on-surface`: `#1a1c1c`
- `outline-variant`: `#c0c7d4`

Custom CSS effects include a Mica-style backdrop blur (`.mica-effect`), slim custom scrollbars, and focus-within address bar highlighting.

---

## 7. Navigation History

### Client-Side Dual Stack Implementation

Located in `useExplorer.ts`, navigation is driven by two array-based stacks:

- **`historyStack`**: When navigating to a new folder, the current folder ID is pushed onto this stack. The forward stack is cleared.
- **`forwardStack`**: When clicking "Back", the current folder is pushed here, and the previous folder is popped from `historyStack`.

| Action | historyStack | forwardStack |
| --- | --- | --- |
| Navigate A → B | push(A) | clear |
| Back (B → A) | pop() → A | push(B) |
| Forward (A → B) | push(A) | pop() → B |
| Up | Navigate to parent | — |
| Refresh | Re-fetch current folder | — |

### Recursive Parent Expansion

When a folder is selected (e.g., via breadcrumb navigation or search result click), `expandParentHierarchy()` walks the `folderMap` upward from the selected node to root, setting `isOpen = true` on each ancestor. This ensures the selected folder is visible in the sidebar tree.

---

## 8. Recursive Folder Copying

Copying a folder is a non-trivial operation because it requires duplicating the entire recursive subtree (all subfolders and files at every level).

**Implementation** (`ExplorerService.copyFolder`):

1. Read the source folder.
2. Determine the copy name (append "- Copy" suffix if pasting in the same directory).
3. Create the new folder in the target parent.
4. Recursively call `copyFolderInternal()` on each subfolder to replicate the tree.
5. Copy all files from the source folder to the newly created folder.

This recursive approach ensures deep-copy fidelity regardless of nesting depth.

---

## 9. Security Measures

### CORS Policy

The Elysia server enforces a strict CORS whitelist allowing only local development origins:

```typescript
origin: [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:3000",
  "http://127.0.0.1:3000"
]
```

### Localhost-Only Binding

Both the API server (`hostname: "127.0.0.1"`) and the Vite dev server (`host: "127.0.0.1"`) are bound to localhost, preventing external network access during development.

### Input Validation

All API endpoints validate request payloads using Elysia's TypeBox schema definitions, rejecting malformed requests before they reach the service layer.

---

## 10. Testing Strategy

The project employs a multi-layered testing strategy covering four distinct levels:

### Unit Tests — Service Layer

**File**: `packages/api/src/services/explorer.service.test.ts`

Tests `ExplorerService` business logic in complete isolation using mock repository implementations. Validates breadcrumb path construction, folder grouping, search filtering, and CRUD operations without requiring a database connection.

### Unit Tests — Controller Layer

**File**: `packages/api/src/controllers/v1/explorer.controller.test.ts`

Tests Elysia HTTP routing, request validation, and response mapping by sending simulated `Request` objects to the controller. Uses `mock.module()` to intercept the `ExplorerService` import, preventing database initialization. Dynamic `require()` is used instead of static `import` to avoid ES module hoisting that would bypass the mock registration.

### Unit Tests — Vue Components

**Files**: `packages/web/src/components/*.test.ts`, `packages/web/src/App.test.ts`, `packages/web/src/composables/useExplorer.test.ts`

Tests Vue Single File Components using `@vue/test-utils` with `happy-dom`. Validates:

- Props binding and template rendering (`Breadcrumbs`, `FolderContents`, `FolderTreeNode`)
- Event emission (`ExplorerSearch`, `FolderTree`)
- Computed properties and reactive state (`useExplorer` composable)
- Recursive component rendering (`FolderTreeNode` self-reference)

### End-to-End Tests — Playwright

**File**: `packages/e2e/tests/explorer.e2e.ts`

Full-system integration tests running across Chromium, Firefox, and WebKit. Playwright automatically orchestrates both API and web dev servers via `playwright.config.ts`. The test suite covers 7 scenarios:

| # | Scenario | Coverage |
| --- | --- | --- |
| 1 | Initial Load | Header, sidebar folders, empty state message |
| 2 | Directory Navigation | Sidebar click, double-click drill-down, breadcrumb navigation |
| 3 | Global Search | Debounced search, result filtering, search clearing |
| 4 | View Mode Toggle | Grid ↔ Detail List switching, table header verification |
| 5 | File Detail Modal | Double-click file, modal content, close button |
| 6 | History Navigation | Back, Forward, Up, Refresh controls |
| 7 | CRUD + Clipboard | Create folder/file, rename, copy, paste, delete |

### CI Integration

All test layers run automatically in the GitHub Actions CI pipeline on every push and pull request to `main`. The pipeline provisions a PostgreSQL 15 service container, seeds the database, and executes both unit and E2E tests sequentially.
