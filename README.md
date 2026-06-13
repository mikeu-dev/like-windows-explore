# Like Windows Explorer - Monorepo Workspace

This repository contains the implementation of a hierarchical web-based file management application resembling Windows Explorer. The project is developed using a monorepo architecture with Bun Workspaces for clean and modular separation of concerns.

## Workspace Structure

The project is divided into four main packages within the packages directory:

1. packages/common: A shared library containing typescript type contracts, DTOs (Data Transfer Objects), and domain interface definitions shared between the frontend and backend.
2. packages/api: The backend API service built with Elysia.js, Bun, and Drizzle ORM to manage folder and file data structures in a PostgreSQL database.
3. packages/web: The client frontend dashboard built with Vue 3, Vite, and Tailwind CSS.
4. packages/e2e: End-to-End testing suite built with Playwright to validate the application flow from the frontend to the database.

## Technical Requirements

To run this project locally, you will need:

- Bun (version 1.0.0 or later)
- PostgreSQL (database server running locally)

---

## Installation and Quick Start Guide

### Step 1: Install Dependencies

Run the following command in the root directory to install dependencies across all workspace packages:

```bash
bun install
```

### Step 2: Configure Environment Variables

Create a `.env` file inside the `packages/api/` directory and configure your database connection:

```env
DATABASE_URL="postgres://username:password@127.0.0.1:5432/database_name"
```

### Step 3: Database Migration and Seeding

Synchronize the database schema and insert initial structured mock data by running:

```bash
bun db:setup
```

_Note: This runs Drizzle schema push and database seed scripts sequentially._

### Step 4: Run the Application in Development Mode

To start both backend and frontend servers concurrently, run the following command in the root directory:

```bash
bun dev
```

- Frontend client will be running on: http://localhost:5173
- Backend API server will be running on: http://127.0.0.1:3001

---

## Script Command References

All project management tasks can be run centrally from the root directory:

### Development and Build

- bun dev: Run both backend and frontend servers in development mode.
- bun dev:api: Run the backend API server only.
- bun dev:web: Run the frontend client only.
- bun build: Build production assets for all packages.

### Database Administration

- bun db:setup: Perform database schema synchronization and database seeding sequentially.

### Testing and Quality Assurance

- bun test: Run unit tests.
- bun test:e2e: Run Playwright End-to-End tests.
- bun check: Run TypeScript compiler diagnostics across all packages (api, web, e2e, common).
- bun lint: Audit codebase linting compliance using ESLint.
- bun lint:fix: Attempt to auto-fix eslint layout and styling warnings.
- bun format: Format codebase source files using Prettier.
- bun format:check: Verify formatting compliance using Prettier check.
