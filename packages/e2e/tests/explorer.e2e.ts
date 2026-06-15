import { test, expect } from "@playwright/test";

test.describe("File Explorer App", () => {
  test.beforeEach(async ({ page }) => {
    // Open the main page of the frontend application
    await page.goto("/");
  });

  test("should display initial load state with root folders in sidebar", async ({ page }) => {
    // Verify main title
    await expect(page.locator("h1")).toHaveText("File Explorer");
    await expect(page.locator("p.text-explorer-muted")).toHaveText(
      "Hierarchical Folder Management System"
    );

    // Verify sidebar is loaded and contains main folders
    const sidebar = page.locator("aside");
    await expect(sidebar).toBeVisible();
    await expect(sidebar.locator("text=Documents")).toBeVisible();
    await expect(sidebar.locator("text=Pictures")).toBeVisible();
    await expect(sidebar.locator("text=Music")).toBeVisible();
    await expect(sidebar.locator("text=Downloads")).toBeVisible();

    // Verify "No folder selected" message in the right panel on initial load
    await expect(page.locator("text=No folder selected")).toBeVisible();
    await expect(
      page.locator("text=Please click a folder in the left navigation panel to view its contents.")
    ).toBeVisible();
  });

  test("should navigate to folders and update breadcrumbs & contents", async ({ page }) => {
    // 1. Click "Documents" folder in the sidebar
    await page.locator("aside >> text=Documents").click();

    // Verify breadcrumbs contain "This PC" and "Documents"
    await expect(page.locator("#breadcrumbs-nav")).toContainText("This PC");
    await expect(page.locator("#breadcrumbs-nav")).toContainText("Documents");

    // Verify "Documents" folder contents (Work, Personal, Archive) appear in the main panel
    const contentPanel = page.locator("main");
    await expect(contentPanel.locator("text=Work")).toBeVisible();
    await expect(contentPanel.locator("text=Personal")).toBeVisible();
    await expect(contentPanel.locator("text=Archive")).toBeVisible();

    // 2. Double-click "Work" subfolder in the main content panel
    const workFolder = contentPanel.locator('[id^="content-folder-"]:has-text("Work")');
    await workFolder.dblclick();

    // Verify breadcrumbs are updated with "Work"
    await expect(page.locator("#breadcrumbs-nav")).toContainText("Work");

    // Verify "Work" folder contents (pdf, docx, xlsx files) appear
    await expect(contentPanel.locator("text=curriculum_vitae.pdf")).toBeVisible();
    await expect(contentPanel.locator("text=project_requirements.docx")).toBeVisible();
    await expect(contentPanel.locator("text=monthly_budget.xlsx")).toBeVisible();

    // 3. Click "Documents" on breadcrumb to go back
    await page.locator("#breadcrumbs-nav >> text=Documents").click();

    // Verify content displays Work, Personal, Archive again
    await expect(contentPanel.locator("text=Work")).toBeVisible();
    await expect(contentPanel.locator("text=Personal")).toBeVisible();
    await expect(contentPanel.locator("text=Archive")).toBeVisible();
  });

  test("should perform global search and clear search correctly", async ({ page }) => {
    const searchInput = page.locator("#search-input");
    await expect(searchInput).toBeVisible();

    // Type "budget" into the search box
    await searchInput.fill("budget");

    // Ensure "monthly_budget.xlsx" file appears in the search results
    await expect(page.locator("text=monthly_budget.xlsx")).toBeVisible();

    // Ensure other non-matching items do not appear
    await expect(page.locator("text=fitness_plan.txt")).not.toBeVisible();

    // Click the search clear button
    const clearBtn = page.locator("#search-clear-btn");
    await expect(clearBtn).toBeVisible();
    await clearBtn.click();

    // Ensure search input is cleared
    await expect(searchInput).toHaveValue("");
    await expect(page.locator("text=No folder selected")).toBeVisible();
  });

  test("should toggle view modes between grid and list", async ({ page }) => {
    // Enter Documents folder
    await page.locator("aside >> text=Documents").click();

    // By default, view mode is Grid. Ensure view-grid-btn is active
    const gridBtn = page.locator("#view-grid-btn");
    const listBtn = page.locator("#view-list-btn");
    await expect(gridBtn).toHaveClass(/text-primary/);

    // Switch to Detail List view
    await listBtn.click();
    await expect(listBtn).toHaveClass(/text-primary/);
    await expect(gridBtn).not.toHaveClass(/text-primary/);

    // Verify table headers appear (Name, Type, Size)
    await expect(page.locator('table th:has-text("Name")')).toBeVisible();
    await expect(page.locator('table th:has-text("Type")')).toBeVisible();
    await expect(page.locator('table th:has-text("Size")')).toBeVisible();

    // Switch back to Grid view
    await gridBtn.click();
    await expect(gridBtn).toHaveClass(/text-primary/);
    await expect(page.locator('table th:has-text("Name")')).not.toBeVisible();
  });

  test("should open and close file detail modal", async ({ page }) => {
    // Enter Documents >> Work
    await page.locator("aside >> text=Documents").click();
    await page.locator('[id^="content-folder-"]:has-text("Work")').dblclick();

    // Double click "curriculum_vitae.pdf" file
    const fileItem = page.locator('[id^="content-file-"]:has-text("curriculum_vitae.pdf")');
    await fileItem.dblclick();

    // Verify file detail modal appears
    const modal = page.locator(".fixed.inset-0");
    await expect(modal).toBeVisible();
    await expect(modal.locator("h2")).toHaveText("curriculum_vitae.pdf");
    await expect(modal.locator("text=PDF Document")).toBeVisible();
    await expect(modal.locator("text=File Size:")).toBeVisible();

    // Click Close button to close the modal
    await modal.locator('button:has-text("Close")').click();

    // Verify modal is closed
    await expect(modal).not.toBeVisible();
  });

  test("should navigate using history controls (Back, Forward, Up, Refresh)", async ({ page }) => {
    // 1. Go into Documents
    await page.locator("aside >> text=Documents").click();
    await expect(page.locator("#breadcrumbs-nav")).toContainText("Documents");

    // 2. Go into Work
    await page.locator('[id^="content-folder-"]:has-text("Work")').dblclick();
    await expect(page.locator("#breadcrumbs-nav")).toContainText("Work");

    // 3. Test Back Button
    const backBtn = page.locator('button:has-text("arrow_back")');
    await backBtn.click();
    await expect(page.locator("#breadcrumbs-nav")).toContainText("Documents");
    await expect(page.locator("#breadcrumbs-nav")).not.toContainText("Work");

    // 4. Test Forward Button
    const forwardBtn = page.locator('button:has-text("arrow_forward")');
    await forwardBtn.click();
    await expect(page.locator("#breadcrumbs-nav")).toContainText("Work");

    // 5. Test Up Button
    const upBtn = page.locator('button:has-text("arrow_upward")');
    await upBtn.click();
    await expect(page.locator("#breadcrumbs-nav")).toContainText("Documents");

    // 6. Test Refresh Button
    const refreshBtn = page.locator('button:has-text("refresh")');
    await refreshBtn.click();
    // Ensure Documents contents (Work, Personal, Archive) remain after refresh
    await expect(page.locator("main >> text=Work")).toBeVisible();
  });

  test("should sort items by name correctly", async ({ page }) => {
    // Go into Documents
    await page.locator("aside >> text=Documents").click();

    // Ensure view mode is set to Grid so items are visible
    const gridBtn = page.locator("#view-grid-btn");
    await gridBtn.click();

    // Ensure items are loaded
    await expect(page.locator("main >> text=Work")).toBeVisible();

    // Click Sort button
    const sortBtn = page.locator('button:has-text("Sort")');
    await sortBtn.click();

    // Select Name (Z-A)
    await page.locator('button:has-text("Name (Z-A)")').click();

    // Verify item order (Z-A) dynamically
    const folderTextsZA = await page.locator('[id^="content-folder-"]').allTextContents();
    const folderNamesZA = folderTextsZA.map((t) => t.trim());
    const sortedZA = [...folderNamesZA].sort((a, b) =>
      b.localeCompare(a, undefined, { sensitivity: "base" })
    );
    expect(folderNamesZA).toEqual(sortedZA);

    // Click Sort again
    await sortBtn.click();

    // Select Name (A-Z)
    await page.locator('button:has-text("Name (A-Z)")').click();

    // Verify order returns to A-Z dynamically
    const folderTextsAZ = await page.locator('[id^="content-folder-"]').allTextContents();
    const folderNamesAZ = folderTextsAZ.map((t) => t.trim());
    const sortedAZ = [...folderNamesAZ].sort((a, b) =>
      a.localeCompare(b, undefined, { sensitivity: "base" })
    );
    expect(folderNamesAZ).toEqual(sortedAZ);
  });

  test("should perform complete CRUD operations and clipboard actions", async ({ page }) => {
    // Go into Documents
    await page.locator("aside >> text=Documents").click();

    // 1. Create a new folder
    const newBtn = page.locator('button:has-text("New")');
    await newBtn.click();
    await page.locator('button:has-text("New Folder")').click();

    // Ensure default folder is created
    await expect(page.locator("main >> text=New Folder")).toBeVisible();

    // 2. Rename folder to TestCrudFolder
    await page.locator('[id^="content-folder-"]:has-text("New Folder")').click();
    await page.locator('button[title="Rename"]').click();

    // Fill the inline rename input and submit by pressing Enter
    const renameInput = page.locator("main input.rename-input");
    await expect(renameInput).toBeVisible();
    await renameInput.fill("TestCrudFolder");
    await renameInput.press("Enter");

    // Ensure folder name is changed
    await expect(page.locator("main >> text=TestCrudFolder")).toBeVisible();
    await expect(page.locator("main >> text=New Folder")).not.toBeVisible();

    // 3. Go into TestCrudFolder
    await page.locator('[id^="content-folder-"]:has-text("TestCrudFolder")').dblclick();
    await expect(page.locator("#breadcrumbs-nav")).toContainText("TestCrudFolder");

    // 4. Create a new file
    await newBtn.click();
    await page.locator('button:has-text("New File")').click();
    await expect(page.locator("main >> text=New File.txt")).toBeVisible();

    // 5. Copy file
    await page.locator('[id^="content-file-"]:has-text("New File.txt")').click();
    await page.locator('button[title="Copy"]').click();

    // 6. Navigate Up back to Documents
    await page.locator('button:has-text("arrow_upward")').click();
    await expect(page.locator("#breadcrumbs-nav")).toContainText("Documents");

    // 7. Paste file
    await page.locator('button[title="Paste"]').click();
    await expect(page.locator("main >> text=New File.txt")).toBeVisible();

    // 8. Go back into TestCrudFolder to verify original file still exists (due to Copy)
    await page.locator('[id^="content-folder-"]:has-text("TestCrudFolder")').dblclick();
    await expect(page.locator("main >> text=New File.txt")).toBeVisible();

    // 9. Delete file inside TestCrudFolder
    await page.locator('[id^="content-file-"]:has-text("New File.txt")').click();
    await page.locator('button[title="Delete"]').click();
    await expect(page.locator("main >> text=New File.txt")).not.toBeVisible();

    // 10. Return to Documents
    await page.locator('button:has-text("arrow_upward")').click();

    // 11. Delete the copied New File.txt file in Documents
    await page.locator('[id^="content-file-"]:has-text("New File.txt")').click();
    await page.locator('button[title="Delete"]').click();
    await expect(page.locator("main >> text=New File.txt")).not.toBeVisible();

    // 12. Delete TestCrudFolder in Documents
    await page.locator('[id^="content-folder-"]:has-text("TestCrudFolder")').click();
    await page.locator('button[title="Delete"]').click();
    await expect(page.locator("main >> text=TestCrudFolder")).not.toBeVisible();
  });
});
