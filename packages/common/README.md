# @explorer/common — Shared Type Library

Shared TypeScript library defining **DTO (Data Transfer Object)** type contracts consumed by both the API backend (`@explorer/api`) and the web frontend (`@explorer/web`).

## Design Rationale

In monorepo architectures, a shared type package serves as the **single source of truth** for the API communication contract between client and server. By keeping this package limited to pure type definitions (no business logic, no runtime dependencies), we achieve:

- **Compile-time contract enforcement**: If the backend modifies a DTO shape, the frontend immediately reports a type error — preventing silent runtime failures in production.
- **Zero-cost abstractions**: Since all exports are TypeScript interfaces, they are erased at compile time and contribute zero bytes to the runtime bundle.
- **Fast compiler resolution**: No transitive dependency tree to resolve.
- **No circular dependency risk**: The package has no imports from `@explorer/api` or `@explorer/web`.

---

## File Structure

```
src/
├── types.ts    # DTO type definitions
└── index.ts    # Barrel re-export
```

---

## Exported Types

### `FolderDTO`

Represents a folder entity in API responses.

```typescript
interface FolderDTO {
  id: string;
  name: string;
  parentId: string | null;
  hasChildren?: boolean; // Used by frontend to render expansion chevrons
}
```

### `FileDTO`

Represents a file entity in API responses.

```typescript
interface FileDTO {
  id: string;
  name: string;
  size: number;
  folderId: string;
}
```

### `FolderContentsDTO`

Aggregated response for the right panel content display.

```typescript
interface FolderContentsDTO {
  subfolders: FolderDTO[];
  files: FileDTO[];
}
```

### `SearchResultsDTO`

Aggregated response for global search results.

```typescript
interface SearchResultsDTO {
  folders: FolderDTO[];
  files: FileDTO[];
}
```

---

## Monorepo Integration

Other workspace packages import this library via Bun's local workspace linking:

```json
{
  "dependencies": {
    "@explorer/common": "workspace:*"
  }
}
```

This enables real-time type propagation without npm registry publishing. Changes to DTO definitions are instantly available to all consuming packages after a simple `bun install`.
