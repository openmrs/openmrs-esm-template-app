import { test, expect } from '@playwright/test';
import { RootPage } from '../pages';

test('Template app loads and displays all core components', async ({ page }) => {
  const rootPage = new RootPage(page);
  await rootPage.goto();

  // Verify navigation to correct route
  await expect(page).toHaveURL(/\/openmrs\/spa\/root/);

  // Verify main heading and content using page object locators
  await expect(rootPage.welcomeHeading).toBeVisible();
  await expect(
    page.getByText('The following examples demonstrate some key features of the O3 framework'),
  ).toBeVisible();

  // Verify all core sections are present using page object
  await expect(rootPage.configSection).toBeVisible();
  await expect(rootPage.extensionSection).toBeVisible();
  await expect(rootPage.dataFetchingSection).toBeVisible();
  await expect(rootPage.resourcesSection).toBeVisible();

  // Verify specific template functionality
  await expect(page.locator('.cds--tile')).toBeVisible(); // Configuration greeting tile
  await expect(page.locator('[class*="boxes"]')).toBeVisible(); // Extension boxes
  await expect(page.getByRole('button', { name: /get a patient named 'test'/i })).toBeVisible();
});
