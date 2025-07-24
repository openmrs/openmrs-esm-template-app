import test from '@playwright/test';
import { HomePage } from '../pages';
import { expect } from '@playwright/test';

test('Service Queues page loads', async ({ page }) => {
  const homePage = new HomePage(page);
  await homePage.goto(); // navigates to /openmrs/spa/home/service-queues

  // Scope to a specific section to avoid multiple matches
  await expect(
    homePage.page.getByTestId('patient-queue-header').getByText('Service queues')
  ).toBeVisible();
});
