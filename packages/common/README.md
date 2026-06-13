# Shared Common Library - @explorer/common

This package is a shared library that defines typescript types, DTOs (Data Transfer Objects), and domain interfaces used consistently by both the API service (backend) and the Web client (frontend).

## Industry Pattern and Design Choice

In standard industry monorepo architectures, this common/shared package serves as the Single Source of Truth for communications contract between client and server. Keeping this package strictly limited to type definitions (without business logic or heavy external dependencies) ensures:

- Extremely fast compiler resolution times.
- Prevention of circular dependencies between workspace packages.
- Ease of maintenance when backend schemas or API contracts change.

## File Structure

The package is simple and modular:

- src/types.ts: Defines DTO types like FolderDTO, FileDTO, FolderContentsDTO, and SearchResultsDTO.
- src/index.ts: Main entry point that exports the types to be consumed by other packages.

## Monorepo Integration

This package is imported by other workspace packages using Bun's local workspace linking inside their respective `package.json` files:

```json
"dependencies": {
  "@explorer/common": "workspace:*"
}
```

This enables real-time propagation of type changes in this package to both frontend and backend without requiring npm registry publishing.
