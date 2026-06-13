# Explorer E2E Testing - @explorer/e2e

This package contains the End-to-End (E2E) testing module using Playwright to validate the application flows from frontend interaction down to API responses and database state.

## Automatic Orchestration

To run tests reliably in a single command, the `playwright.config.ts` configuration includes a `webServer` block that launches the development servers automatically:
- Backend API Server: Launched on port 3001 (`http://127.0.0.1:3001/api/v1/folders`).
- Frontend Client: Launched on port 5173 (`http://localhost:5173`).

Playwright will wait for both services to become healthy, execute the E2E test suite, and terminate the server child processes automatically upon completion.

## Test Scenarios

The test suite in `tests/explorer.spec.ts` covers the following workflows:

1. Initial Load: Verifies headers, sidebar folders rendering, and the initial placeholder message.
2. Directory Navigation: Simulates clicking folders in the sidebar, traversing directories in the grid using double clicks, and verifies breadcrumbs address bar path updating and navigation.
3. Global Search: Assures search queries filter files and folders correctly, and verifying that search clearing works.
4. Layout Toggle: Verifies switching display mode from Grid (icons) to Detail List (table layout) and back.
5. File Detail Modal: Confirms that double-clicking a file opens the metadata overlay modal, and clicking the close button dismisses it.

## Execution Reference

Make sure you are at the root directory of the monorepo workspace when executing these commands:

### Step 1: Install Playwright Browser Binaries
Playwright runs tests on dedicated browser binaries (Chromium, Firefox, Webkit). Run this command once after installing npm dependencies:
```bash
bun --cwd packages/e2e playwright install --with-deps
```

### Step 2: Run Tests (Headless Mode)
Run the E2E tests automatically in the background:
```bash
bun test:e2e
```

### Step 3: Run Tests in Playwright UI Mode
To run tests with a visual UI inspector to debug test steps interactively:
```bash
bun --cwd packages/e2e playwright test --ui
```

### Step 4: Show Test Reports
Open the generated HTML test report in your browser:
```bash
bun --cwd packages/e2e playwright show-report
```
