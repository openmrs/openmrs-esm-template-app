import { test, expect } from '@playwright/test';
import { RootPage } from '../pages';

test('Template app loads and displays all core components', async ({ page }) => {
  const rootPage = new RootPage(page);
  await rootPage.goto();

  await expect(page).toHaveURL(/\/openmrs\/spa\/root/);

  await expect(rootPage.welcomeHeading).toBeVisible();
  await expect(
    page.getByText('The following examples demonstrate some key features of the O3 framework'),
  ).toBeVisible();

  await expect(rootPage.configSection).toBeVisible();
  await expect(rootPage.extensionSection).toBeVisible();
  await expect(rootPage.dataFetchingSection).toBeVisible();
  await expect(rootPage.resourcesSection).toBeVisible();

  await expect(page.getByText('hello World!')).toBeVisible(); // Configuration greeting tile content
  await expect(page.locator('[class*="boxes"]')).toBeVisible(); // Extension boxes
  await expect(page.getByRole('button', { name: /get a patient named 'test'/i })).toBeVisible();
});
