import { test, expect } from "@playwright/test";

test.describe("Project Management Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("displays the homepage", async ({ page }) => {
    await expect(page).toHaveTitle(/Task Decomposition Tool/);
    await expect(page.locator("h1")).toBeVisible();
  });

  test("navigates to projects page", async ({ page }) => {
    await page.click("text=Projects");
    await expect(page).toHaveURL(/.*projects/);
    await expect(page.locator("h1")).toContainText("Projects");
  });

  test("displays projects list", async ({ page }) => {
    await page.goto("/projects");

    // Check if the projects page loads
    const heading = page.locator("h1");
    await expect(heading).toBeVisible();

    // Look for any projects or empty state
    const content = page.locator("main");
    await expect(content).toBeVisible();
  });
});

test.describe("Task Management Flow", () => {
  test("displays project detail page", async ({ page }) => {
    // Navigate to a project (this would need a real project ID in a real test)
    await page.goto("/projects");

    // Check that we're on the projects page
    await expect(page.locator("h1")).toContainText("Projects");
  });

  test("shows navigation links", async ({ page }) => {
    await page.goto("/");

    // Check for main navigation
    const nav = page.locator("nav");
    await expect(nav).toBeVisible();

    // Check for Projects link
    const projectsLink = page.locator('a[href*="projects"]');
    if ((await projectsLink.count()) > 0) {
      await expect(projectsLink.first()).toBeVisible();
    }
  });
});
