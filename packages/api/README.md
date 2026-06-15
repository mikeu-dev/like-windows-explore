# @explorer/api — Backend API Service

REST API backend service built with **Elysia.js**, **Bun**, and **Drizzle ORM** for managing hierarchical folder and file data structures in a **PostgreSQL** database.

## Architecture

The backend follows **Clean / Hexagonal Architecture** patterns to separate concerns across four layers:

```
src/
├── controllers/v1/       # HTTP transport (Elysia router + TypeBox validation)
│   ├── explorer.controller.ts
│   └── explorer.controller.test.ts
├── services/             # Application core (business logic + use cases)
│   ├── explorer.service.ts
│   └── explorer.service.test.ts
├── repositories/         # Data access layer (ports + adapters)
│   ├── folder-repository.interface.ts    # Port
│   ├── file-repository.interface.ts      # Port
│   ├── drizzle-folder.repository.ts      # Adapter (PostgreSQL)
│   └── drizzle-file.repository.ts        # Adapter (PostgreSQL)
├── domain/entities/      # Plain domain models (zero dependencies)
│   ├── folder.ts
│   └── file.ts
├── db/
│   ├── connection.ts     # Drizzle + postgres.js connection
│   ├── schema.ts         # Barrel export
│   ├── schema/
│   │   ├── folders.ts    # Drizzle schema + relations + indices
│   │   └── files.ts      # Drizzle schema + relations + indices
│   ├── seed.ts           # Seed orchestrator
│   └── seeds/
│       ├── folders.seed.ts
│       └── files.seed.ts
└── index.ts              # Elysia app entry point (CORS, router, listener)
```

### Dependency Injection

`ExplorerService` accepts `IFolderRepository` and `IFileRepository` via constructor injection, enabling mock substitution during unit testing without requiring a database connection.

---

## Environment Variables

Create a `.env` file inside `packages/api/`:

```env
PORT=3001
DATABASE_URL="postgres://username:password@127.0.0.1:5432/database_name"
```

A `.env.example` file is provided as reference.

---

## Database Commands

Run from the `packages/api/` directory (or via root scripts):

| Command | Description |
| --- | --- |
| `bun db:generate` | Generate Drizzle migration files from schema changes |
| `bun db:push` | Push schema changes directly to PostgreSQL (development) |
| `bun db:seed` | Clear all tables and insert structured mock directory trees |

---

## Database Schema

### `folders` Table

| Column | Type | Constraints |
| --- | --- | --- |
| `id` | UUID | PK, default random |
| `name` | TEXT | NOT NULL |
| `parent_id` | UUID | FK → `folders.id`, ON DELETE CASCADE, nullable |
| `created_at` | TIMESTAMP | NOT NULL, default NOW |
| `updated_at` | TIMESTAMP | NOT NULL, default NOW |

**Indices**: `folders_parent_id_idx` (parent_id), `folders_parent_name_idx` (parent_id, name)

**Self-referential relation**: `parent_id` references `folders.id` with cascade deletion, enabling unlimited directory nesting depth.

### `files` Table

| Column | Type | Constraints |
| --- | --- | --- |
| `id` | UUID | PK, default random |
| `name` | TEXT | NOT NULL |
| `size` | INTEGER | NOT NULL, default 0 |
| `folder_id` | UUID | FK → `folders.id`, ON DELETE CASCADE, NOT NULL |
| `created_at` | TIMESTAMP | NOT NULL, default NOW |
| `updated_at` | TIMESTAMP | NOT NULL, default NOW |

**Indices**: `files_folder_id_idx` (folder_id), `files_folder_name_idx` (folder_id, name)

---

## API Endpoint Reference

All endpoints are prefixed with `/api/v1`.

### Query Endpoints

#### GET `/shortcuts`

Returns a map of special shortcut folder IDs (Desktop, Downloads, Documents, Pictures, Music, Videos, OneDrive, Local Disk C:, Local Disk D:).

**Response**: `Record<string, string>`

#### GET `/folders`

Returns direct subfolders of a parent folder. If `parentId` is omitted, returns root-level folders.

**Query Parameters**: `parentId` (string, optional)

**Response**: `FolderDTO[]` (includes `hasChildren` boolean for chevron rendering)

#### GET `/folders/:id/contents`

Returns both subfolders and files inside a folder.

**Path Parameters**: `id` (string, required)

**Response**: `{ subfolders: FolderDTO[], files: FileDTO[] }`

#### GET `/folders/:id/path`

Traverses the parent hierarchy recursively to build a breadcrumb path from root to the target folder.

**Path Parameters**: `id` (string, required)

**Response**: `FolderDTO[]`

#### GET `/search`

Performs global case-insensitive search across folder and file names. Minimum query length: 2 characters. Results limited to 50 matches per entity type.

**Query Parameters**: `q` (string, required)

**Response**: `{ folders: FolderDTO[], files: FileDTO[] }`

---

### Mutation Endpoints

#### POST `/folders`

Creates a new folder.

**Body**: `{ name: string, parentId: string | null }`

**Response**: `FolderDTO`

#### POST `/files`

Creates a new file.

**Body**: `{ name: string, folderId: string, size?: number }`

**Response**: `FileDTO`

#### PATCH `/folders/:id`

Renames or moves a folder. Send `name` to rename, or `parentId` to move.

**Body**: `{ name?: string, parentId?: string | null }`

**Response**: `FolderDTO`

#### PATCH `/files/:id`

Renames or moves a file. Send `name` to rename, or `folderId` to move.

**Body**: `{ name?: string, folderId?: string }`

**Response**: `FileDTO`

#### POST `/folders/:id/copy`

Recursively deep-copies an entire folder tree (all subfolders and files at every level). Automatically appends "- Copy" suffix when pasting in the same directory.

**Body**: `{ parentId: string | null }`

**Response**: `FolderDTO`

#### POST `/files/:id/copy`

Copies a file to a target folder. Automatically generates a "- Copy" filename when pasting in the same folder.

**Body**: `{ folderId: string }`

**Response**: `FileDTO`

#### DELETE `/folders/:id`

Deletes a folder and all of its contents recursively (via database CASCADE).

**Response**: `{ success: true }`

#### DELETE `/files/:id`

Deletes a file.

**Response**: `{ success: true }`

---

## Security

- **CORS**: Strict whitelist limited to local development origins (`localhost:5173`, `127.0.0.1:5173`, `localhost:3000`, `127.0.0.1:3000`).
- **Localhost binding**: The server listens on `127.0.0.1` only (configurable via `PORT` env var).
- **Input validation**: All request bodies and query parameters are validated by Elysia's TypeBox schema definitions.

---

## Testing

### Unit Tests — Service Layer

**File**: `src/services/explorer.service.test.ts`

Tests all `ExplorerService` use cases with mock repository implementations (no database required).

### Unit Tests — Controller Layer

**File**: `src/controllers/v1/explorer.controller.test.ts`

Tests Elysia HTTP routing and response mapping using simulated `Request` objects. Uses `mock.module()` to intercept `ExplorerService` and prevent database initialization.

Run all tests:

```bash
bun test packages/api
```
