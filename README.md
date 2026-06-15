# Like Windows Explorer

A full-stack, web-based hierarchical file management application inspired by Windows Explorer. Built as a monorepo with Bun Workspaces, featuring a Vue 3 frontend, Elysia.js REST API backend, PostgreSQL database, and comprehensive test coverage spanning unit, component, and E2E layers.

![Like Windows Explorer Screenshot](./screenshot.png)

## Tech Stack

| Layer        | Technology                                    |
| ------------ | --------------------------------------------- |
| Runtime      | Bun                                           |
| Frontend     | Vue 3 (Composition API), Vite, Tailwind CSS 3 |
| Backend      | Elysia.js                                     |
| Database     | PostgreSQL 15                                 |
| ORM          | Drizzle ORM                                   |
| Shared Types | `@explorer/common` workspace package          |
| Unit Testing | Bun Test, `@vue/test-utils`, `happy-dom`      |
| E2E Testing  | Playwright (Chromium, Firefox, WebKit)        |
| Linting      | ESLint (flat config), Prettier                |
| CI/CD        | GitHub Actions                                |

## Key Features

- **Windows-Inspired Light Mode UI**: Clean visual layout featuring a resizable sidebar, dual-panel split view, breadcrumb address bar, and Material Design 3 color tokens.
- **Lazy-Loading Directory Tree**: Only root-level folders are fetched on initial load. Subfolders are loaded on-demand when a user expands a tree node, enabling support for millions of records.
- **Dual View Modes**: Toggle between Grid (icon tiles) and Detail List (table with Name, Type, Size columns).
- **Full CRUD Operations**: Create, rename, delete, copy, cut, and paste folders and files. Recursive folder copying is fully supported.
- **History Navigation**: Back, Forward, Up, and Refresh controls driven by dual history stacks.
- **Global Search**: Debounced (300ms) case-insensitive search across all folders and files.
- **File Detail Modal**: Double-click any file to view metadata (name, type, size, location).
- **Sorting**: Interactive client-side sorting by Name (A-Z / Z-A), File Type, and File Size.

## Workspace Structure

```
like-windows-explore/
├── packages/
│   ├── common/      # Shared TypeScript DTO type contracts
│   ├── api/         # Elysia.js REST API + Drizzle ORM (PostgreSQL)
│   ├── web/         # Vue 3 + Vite + Tailwind CSS frontend client
│   └── e2e/         # Playwright E2E test suite
├── .github/
│   └── workflows/
│       └── ci.yml   # GitHub Actions CI pipeline
├── docker-compose.yml
├── eslint.config.js
├── bunfig.toml
└── package.json     # Bun Workspaces root
```

## Prerequisites

- [Bun](https://bun.sh/) v1.0.0 or later
- [PostgreSQL](https://www.postgresql.org/) 15+ (either running natively or via Docker)
- [Docker](https://www.docker.com/) (optional, for database container)

---

## Quick Start

### 1. Clone and Install Dependencies

```bash
git clone https://github.com/mikeu-dev/like-windows-explore.git
cd like-windows-explore
bun install
```

### 2. Start PostgreSQL Database

**Option A — Using Docker Compose (recommended):**

```bash
docker compose up -d
```

This starts a PostgreSQL 15 container on port `5432` with credentials `postgres:password` and database `db-like-windows-explore`.

**Option B — Using an existing PostgreSQL instance (Non-Docker):**

1. **Verify that PostgreSQL is running:**
   Ensure your PostgreSQL service is active. You can check its status using:
   ```bash
   # Check if Postgres is responding on port 5432
   pg_isready -h localhost -p 5432

   # Or check service status (Linux)
   sudo systemctl status postgresql

   # Or check service status (macOS Homebrew)
   brew services list
   ```

2. **Create the database manually:**
   Connect to your PostgreSQL server and create the database.
   
   *Note: Since the database name contains dashes, it must be enclosed in double quotes in SQL.*
   
   ```bash
   # Connect using psql (replace 'postgres' with your superuser username if needed)
   psql -U postgres
   ```
   Inside the SQL prompt, run:
   ```sql
   CREATE DATABASE "db-like-windows-explore";
   ```
   
   Alternatively, you can run this command directly from your terminal:
   ```bash
   createdb -U postgres db-like-windows-explore
   ```

3. **Configure Environment Variables:**
   Create a `.env` file inside `packages/api/` (you can copy from `.env.example` if available) and update the `DATABASE_URL` with your credentials and database name:

```env
PORT=3001
DATABASE_URL="postgres://postgres:password@127.0.0.1:5432/db-like-windows-explore"
```
Ensure that the PostgreSQL user has sufficient privileges to create tables and execute migrations on this database.

### 3. Configure Frontend Environment

Create a `.env` file inside `packages/web/`:

```env
VITE_API_URL="http://127.0.0.1:3001/api/v1"
```

### 4. Migrate Database Schema and Seed Data

```bash
bun db:setup
```

This runs Drizzle schema push followed by the seed script to populate a structured Windows-style directory tree with folders and files.

### 5. Start Development Servers

```bash
bun dev
```

| Service     | URL                   |
| ----------- | --------------------- |
| Frontend    | http://localhost:5173 |
| Backend API | http://127.0.0.1:3001 |

---

## Script Reference

All commands are run from the monorepo root directory.

### Development

| Command       | Description                                 |
| ------------- | ------------------------------------------- |
| `bun dev`     | Start both API and web servers concurrently |
| `bun dev:api` | Start the backend API server only           |
| `bun dev:web` | Start the frontend client only              |
| `bun build`   | Build production assets for all packages    |

### Database

| Command        | Description                                                 |
| -------------- | ----------------------------------------------------------- |
| `bun db:setup` | Sync schema + seed database (runs `db:push` then `db:seed`) |

### Testing

| Command        | Description                                          |
| -------------- | ---------------------------------------------------- |
| `bun test`     | Run unit tests (API + Web)                           |
| `bun test:e2e` | Run Playwright E2E tests (Chromium, Firefox, WebKit) |

### Code Quality

| Command            | Description                                      |
| ------------------ | ------------------------------------------------ |
| `bun lint`         | Lint all TypeScript and Vue files with ESLint    |
| `bun lint:fix`     | Auto-fix linting issues                          |
| `bun format`       | Format source files with Prettier                |
| `bun format:check` | Check formatting compliance                      |
| `bun check`        | Run TypeScript type-checking across all packages |

---

## CI/CD Pipeline

The project uses GitHub Actions (`.github/workflows/ci.yml`) to run on every push and pull request to `main`:

1. **Install** — `bun install`
2. **Format Check** — `bun format:check`
3. **Lint** — `bun lint`
4. **Type Check** — `bun check`
5. **Database Setup** — Drizzle push + seed against a PostgreSQL 15 service container
6. **Unit Tests** — `bun test`
7. **E2E Tests** — Playwright test with auto-uploaded HTML report on failure

---

## Architecture Overview

See [ARCHITECTURE.md](ARCHITECTURE.md) for detailed design documentation covering:

- Monorepo structure and shared type contracts
- Clean / Hexagonal Architecture in the backend
- Scalability strategies (lazy loading, EXISTS subquery, database indexing)
- State management patterns in the frontend
- Testing strategy (unit, component, controller, E2E)

---

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
