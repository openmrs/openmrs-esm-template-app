import test from '@playwright/test';
import { HomePage } from '../pages';
import { expect } from '@playwright/test';

// This test is a sample E2E test. You can delete it.

test('Sample test', async ({ page }) => {
  const homePage = new HomePage(page);
  await homePage.goto();
  await expect(homePage.page.getByRole('link', { name: 'Home' })).toBeVisible();
});
