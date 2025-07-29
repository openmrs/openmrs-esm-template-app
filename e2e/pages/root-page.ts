import type { Page, Locator } from '@playwright/test';

export class RootPage {
  readonly page: Page;
  readonly welcomeHeading: Locator;
  readonly configSection: Locator;
  readonly extensionSection: Locator;
  readonly dataFetchingSection: Locator;
  readonly resourcesSection: Locator;

  constructor(page: Page) {
    this.page = page;
    this.welcomeHeading = page.getByRole('heading', { name: /welcome to the o3 template app/i });
    this.configSection = page.getByRole('heading', { name: /configuration system/i });
    this.extensionSection = page.getByRole('heading', { name: /extension system/i });
    this.dataFetchingSection = page.getByRole('heading', { name: /data fetching/i });
    this.resourcesSection = page.getByRole('heading', { name: /resources/i });
  }

  async goto() {
    await this.page.goto('/openmrs/spa/root');
    await this.welcomeHeading.waitFor();
  }

  async waitForPageLoad() {
    await this.welcomeHeading.waitFor();
    await this.configSection.waitFor();
    await this.extensionSection.waitFor();
    await this.dataFetchingSection.waitFor();
    await this.resourcesSection.waitFor();
  }
}
