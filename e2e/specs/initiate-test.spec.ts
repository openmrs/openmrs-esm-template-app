import test from "@playwright/test";
import { HomePage } from "../pages";
import { expect } from "@playwright/test";

test("initiate test", async ({ page}) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    await expect(homePage.page.getByRole('link', { name: 'Home' })).toBeVisible();
}); 