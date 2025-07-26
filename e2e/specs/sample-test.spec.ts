import test from '@playwright/test';
import { HomePage } from '../pages';
import { expect } from '@playwright/test';




test('Service Queues page loads', async ({ page }) => {
  const homePage = new HomePage(page);
  await homePage.goto();

  // Wait for the service-queues route
  await expect(page).toHaveURL(/service-queues/);

  // Explicitly wait for header to appear
  const header = page.getByTestId('patient-queue-header');
  await expect(header).toBeVisible({ timeout: 60000 }); // extended timeout

  // Verify text content
  await expect(header).toContainText('Service queues');
});
