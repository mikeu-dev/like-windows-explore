# @explorer/e2e — End-to-End Testing

End-to-End test suite using **Playwright** to validate the full application stack — from frontend user interactions through API calls to database state — across three browser engines.

## Automatic Server Orchestration

The `playwright.config.ts` includes a `webServer` configuration that automatically starts both development servers before running tests:

| Server       | Command                | Health Check URL                       |
| ------------ | ---------------------- | -------------------------------------- |
| Backend API  | `bun --cwd ../api dev` | `http://127.0.0.1:3001/api/v1/folders` |
| Frontend Web | `bun --cwd ../web dev` | `http://localhost:5173`                |

Playwright waits for both services to become healthy, executes the test suite, and terminates server processes upon completion.

On CI, servers are always started fresh (`reuseExistingServer: false`). During local development, existing running servers are reused to speed up test iterations.

---

## Browser Targets

Tests run sequentially across three browser engines:

- **Chromium** (Desktop Chrome)
- **Firefox** (Desktop Firefox)
- **WebKit** (Desktop Safari)

Configuration: `workers: 1`, `fullyParallel: false` for deterministic execution order.

---

## Test File Structure

```
tests/
├── explorer.e2e.ts    # Main Playwright test suite (7 scenarios)
└── explorer.spec.ts   # Intentionally blank (prevents bun test from scanning Playwright files)
```

> **Note**: The `explorer.spec.ts` file exists as a safeguard. Bun's test runner would otherwise attempt to import Playwright test files (which use `@playwright/test` instead of `bun:test`), causing import failures. The actual test logic resides in `explorer.e2e.ts`, matched by the `testMatch: "**/*.e2e.ts"` pattern in `playwright.config.ts`.

---

## Test Scenarios

The test suite in `explorer.e2e.ts` covers 7 comprehensive scenarios:

### 1. Initial Load State

Verifies the application renders correctly on first load:

- Title ("File Explorer") and subtitle are present.
- Sidebar shows main folders (Documents, Pictures, Music, Downloads).
- Right panel displays "No folder selected" placeholder message.

### 2. Directory Navigation

Validates multi-level navigation through the folder hierarchy:

- Click a sidebar folder → breadcrumbs and contents panel update.
- Double-click a subfolder in the content panel → drill down and breadcrumbs extend.
- Click a breadcrumb segment → navigate back to that folder level.

### 3. Global Search

Tests the debounced search functionality:

- Type a query ("budget") → matching results appear (`monthly_budget.xlsx`).
- Non-matching items are hidden.
- Click the clear button → search resets to empty state.

### 4. View Mode Toggle

Verifies switching between display modes:

- Grid mode active by default (grid button highlighted).
- Click list button → table headers (Name, Type, Size) appear, grid button deactivated.
- Click grid button → table disappears, grid mode restored.

### 5. File Detail Modal

Tests file metadata overlay:

- Navigate to `Documents > Work`.
- Double-click `curriculum_vitae.pdf` → modal appears with filename, type ("PDF Document"), and file size.
- Click "Close" → modal dismissed.

### 6. History Navigation Controls

Validates Back, Forward, Up, and Refresh buttons:

- Navigate `Documents → Work`.
- **Back** → returns to Documents (breadcrumbs confirmed).
- **Forward** → returns to Work.
- **Up** → returns to Documents (parent folder).
- **Refresh** → content reloads without navigation change.

### 7. CRUD Operations + Clipboard

Full lifecycle test covering create, rename, copy, paste, and delete:

1. Navigate to Documents.
2. **Create** new folder → "New Folder" appears.
3. **Rename** to "TestCrudFolder" via prompt dialog.
4. Enter TestCrudFolder.
5. **Create** new file → "New File.txt" appears.
6. **Copy** the file.
7. Navigate **Up** to Documents.
8. **Paste** → "New File.txt" appears in Documents.
9. Navigate back into TestCrudFolder → original file still exists (copy verification).
10. **Delete** file, navigate up, delete copied file, delete TestCrudFolder.
11. Verify all created items are removed (cleanup verification).

---

## Execution Reference

### Prerequisites

Install Playwright browser binaries (one-time setup):

```bash
bun --cwd packages/e2e playwright install --with-deps
```

### Run Tests (Headless)

```bash
bun test:e2e
```

### Run Tests with UI Inspector

```bash
bun --cwd packages/e2e playwright test --ui
```

### View HTML Test Report

```bash
bun --cwd packages/e2e playwright show-report
```

---

## CI Integration

In the GitHub Actions pipeline, Playwright:

1. Installs browser binaries via `playwright install --with-deps`.
2. Starts fresh API + web servers (database is pre-seeded).
3. Runs the full test suite.
4. On failure, uploads the HTML report as a CI artifact (retained for 30 days).
