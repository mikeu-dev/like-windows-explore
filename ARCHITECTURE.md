# Project Architecture - Like Windows Explorer

This document outlines the design decisions, software architecture, design patterns, and scalability strategies implemented in this hierarchical file explorer web application.

---

## 1. Monorepo Architecture (Bun Workspaces)

The project is structured as a monorepo using Bun Workspaces. The main benefits of this layout are:

- Clean Separation of Concerns: The frontend, backend, test suite, and type definitions are kept in isolated packages.
- Shared Type Contracts: Both the web client and API service import types directly from the common package. This ensures compile-time type safety. Any modification to data models in the backend is instantly flagged as a compilation error in the frontend, preventing runtime errors in production.

The repository structure is as follows:

- packages/common: Shared library containing DTOs (Data Transfer Objects) and domain entities.
- packages/api: Backend API application (Elysia.js, Drizzle ORM).
- packages/web: Frontend client application (Vue 3, Vite, Tailwind CSS).
- packages/e2e: Playwright automated test suite.

---

## 2. Backend Architecture (Clean / Hexagonal Architecture)

The API package is designed using Clean Architecture principles, decoupling core business logic from transport protocols and database technologies:

### Domain Entities

Located in `src/domain/entities/`. Contains plain, dependency-free models (Folder and File). This preserves core business logic from database or framework changes.

### Repository Interfaces (Ports)

Located in `src/repositories/*.interface.ts`. Defines interfaces (IFolderRepository, IFileRepository) for data access. The service layer interacts only with these interfaces, remaining agnostic of the underlying database engine.

### Drizzle Repositories (Adapters)

Located in `src/repositories/drizzle-*.repository.ts`. Implements concrete repository interfaces utilizing Drizzle ORM to interface with PostgreSQL. Swapping out the database (e.g. to MongoDB or Prisma ORM) would only require writing new repository adapters without touching business logic services.

### Service Layer (Application Core)

Located in `src/services/explorer.service.ts`. Implements application workflows and use-cases (e.g. building breadcrumb paths, grouping files and subfolders). The service utilizes dependency injection (DI) to accept repository adapters, making it easily testable via mocking.

### Controller Layer (Transport)

Located in `src/controllers/`. Uses Elysia.js to expose HTTP endpoints, validating payload parameters using Elysia's schema validator (TypeBox) and mapping HTTP status codes.

---

## 3. Scalability and Performance Engineering

A core design goal is the ability to scale to millions of folders and files while maintaining high concurrency:

### Lazy Loading directory trees

Instead of loading the entire folder tree (which would choke the DOM on huge datasets), the frontend client only fetches root-level directories initially. When the user expands a folder (clicks caret), the client sends an API request to load direct children for that folder ID. This minimizes network payloads, browser memory usage, and DOM rendering overhead.

### Efficient Child Checking in O(1) Complexity

To display caret expansion indicators, the client needs to know if a folder contains subfolders.

- Suboptimal Approach: Running `SELECT COUNT(*)` on subfolders. This scales poorly as it scans all records.
- Optimized Approach: The Drizzle repository adapter uses a SQL `EXISTS` subquery:
  ```sql
  EXISTS(SELECT 1 FROM folders WHERE parent_id = parent.id)
  ```
  The database engine halts scanning immediately upon finding the first match. This lowers complexity to O(1).

### Database Indexing Strategy

Indices are created on search targets and parent-child relations in Drizzle schema definitions (`folders.ts` and `files.ts`):

- folders_parent_id_idx: Optimizes directory traversal queries based on parent ID (critical for lazy loading).
- folders_parent_name_idx: Composite index of `parentId` and `name` to speed up alphabetical ordering of subfolders.
- files_folder_id_idx: Speeds up file retrieval within directories.

### Search Debouncing

The search input on the web client uses a 300ms debounce buffer. The client waits for the user to pause typing for at least 300ms before sending search requests to the backend, preventing database search overload.

---

## 4. Testing Strategy

Stability and reliability are validated through three test layers:

### Unit Testing (Services)

Validates backend business logic in `ExplorerService` using mocks to simulate repository databases, testing recursive breadcrumb construction and folder grouping logic in isolation.

### UI Testing (Component Verification)

Validates Vue Single File Components (SFCs) statics to assure props binding, template integrity, and recursive rendering structure.

### End-to-End (E2E) Testing (Playwright)

Validates full system integration by orchestrating local server environments automatically and simulating user behavior (folder navigation, tree traversal, searching, toggling views, and metadata overlays).

---

## 5. State Mutations & Navigation History

To transition the explorer from a static viewer to a dynamic manager, specific design choices were made for data mutations and historical navigation:

### Client-Side History Stacks

The history stack tracks paths traversed by the user in `packages/web/src/composables/useExplorer.ts`.
- **Back & Forward**: Handled via two array stacks (`historyStack` and `forwardStack`). When the user navigates into a folder, the current location is pushed onto the history stack, and the forward stack is cleared. Clicking "Back" pops from the history stack and pushes the current directory onto the forward stack.
- **Up-ward Navigation**: Calculates the immediate parent directory from the active breadcrumbs route to shift the node focus one level higher.

### Recursive Folder Copying & DB Mutations

Directory tree copying presents unique challenges because copying a folder requires duplicating its entire recursive child tree structure (folders and files).
- **Service Layer Recursion**: `ExplorerService.copyFolder` reads the source folder, duplicates it, and recursively calls `copyFolderInternal` on all subdirectories, while copying files using bulk inserts in the repository.
- **Unified Mutating Endpoints**: Elysia REST endpoints (POST, PATCH, DELETE) validate incoming payload params using TypeBox schemas, passing requests down to the Drizzle adapter layer to sync all directory CRUD events straight to PostgreSQL.
