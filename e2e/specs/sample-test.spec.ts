import test from '@playwright/test';
import { HomePage } from '../pages';
import { expect } from '@playwright/test';

test('Service Queues page loads', async ({ page }) => {
  const homePage = new HomePage(page);
  await homePage.goto();
  
  // Verify page loaded
  await expect(page).toHaveURL(/service-queues/);
  
  // Verify header exists
  const header = page.getByTestId('patient-queue-header');
  await expect(header).toBeVisible();
  
  // Verify text content
  await expect(header).toContainText('Service queues');
});
