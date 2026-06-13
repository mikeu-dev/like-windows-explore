# Explorer API Backend - @explorer/api

This backend API service is built with Elysia.js, Bun, and Drizzle ORM to manage folder and file data structures in a PostgreSQL database.

## Features
- Extremely fast HTTP endpoints using Elysia.js running on top of Bun runtime.
- Type-safe database queries via Drizzle ORM to PostgreSQL.
- Optimized database query structures supporting global case-insensitive search.
- Recursive self-referential parent-child folder relationship.

## Source Code Structure

The backend project is designed using clean architecture patterns to separate HTTP transport, business logic, data models, and database access:
- src/db/: Database configuration, schema definitions (folders, files), and structured seed scripts.
- src/domain/entities/: Plain domain entity models (Folder, File).
- src/repositories/: Data access layer (DAL) containing concrete repository adapters querying PostgreSQL via Drizzle ORM.
- src/services/: Application service layer (ExplorerService) implementing core business rules.
- src/controllers/: HTTP controller mappings (Elysia.js) defining the router group.
- src/index.ts: Application entry point launching the HTTP listener.

## Environment Variables

The API service requires a `.env` file inside `packages/api/` folder to resolve database credentials:
```env
DATABASE_URL="postgres://username:password@127.0.0.1:5432/database_name"
PORT=3001
```

## Database Operations (Drizzle Commands)

- bun db:generate: Generate migration files based on schema changes.
- bun db:push: Sync schema changes immediately to PostgreSQL database (ideal for development).
- bun db:seed: Clean database tables and insert initial structured mock directory trees.

## API Endpoint References

All HTTP endpoints are mapped under the `/api/v1` router prefix:

### 1. Get Subfolders
- Route: GET `/api/v1/folders`
- Query Parameters: `parentId` (string, optional) - The UUID parent folder to fetch children of. If omitted or null, returns root-level folders.
- Description: Returns a list of direct subfolders belonging to the parent folder.

### 2. Get Folder Contents
- Route: GET `/api/v1/folders/:id/contents`
- Path Parameters: `id` (string, required) - The UUID target folder.
- Description: Returns an object containing both `subfolders` and `files` directly under the folder ID.

### 3. Get Folder Path (Breadcrumbs)
- Route: GET `/api/v1/folders/:id/path`
- Path Parameters: `id` (string, required) - The UUID target folder.
- Description: Traverses parent hierarchy recursively up to root level to build the folder breadcrumb path list.

### 4. Global Search
- Route: GET `/api/v1/search`
- Query Parameters: `q` (string, required) - The case-insensitive search string (minimum 2 characters).
- Description: Performs global search matching folder or file names against the query.
