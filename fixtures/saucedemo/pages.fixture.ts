import { test as base } from "@playwright/test";
import { SauceCartPage } from "../../pages/saucedemo/SauceCartPage";
import { SauceCheckoutCompletePage } from "../../pages/saucedemo/SauceCheckoutComplete";
import { SauceCheckoutInformationPage } from "../../pages/saucedemo/SauceCheckoutInformationPage";
import { SauceCheckoutOverviewPage } from "../../pages/saucedemo/SauceCheckoutOverviewPage";
import { SauceInventoryPage } from "../../pages/saucedemo/SauceInventoryPage";
import { SauceLoginPage } from "../../pages/saucedemo/SauceLoginPage";
import { SauceProductDetailPage } from "../../pages/saucedemo/SauceProductDetailPage";

/**
 * Page Objects de SauceDemo disponibles como fixtures.
 * Cada test pide solo los que usa, por ejemplo: async ({ loginPage, cartPage }) => {...}
 * Playwright los crea con la misma `page` del test, así que todos comparten la pestaña.
 */
export type SaucePageFixtures = {
  loginPage: SauceLoginPage;
  inventoryPage: SauceInventoryPage;
  productDetailPage: SauceProductDetailPage;
  cartPage: SauceCartPage;
  checkoutInformationPage: SauceCheckoutInformationPage;
  checkoutOverviewPage: SauceCheckoutOverviewPage;
  checkoutCompletePage: SauceCheckoutCompletePage;
};

export const test = base.extend<SaucePageFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new SauceLoginPage(page));
  },
  inventoryPage: async ({ page }, use) => {
    await use(new SauceInventoryPage(page));
  },
  productDetailPage: async ({ page }, use) => {
    await use(new SauceProductDetailPage(page));
  },
  cartPage: async ({ page }, use) => {
    await use(new SauceCartPage(page));
  },
  checkoutInformationPage: async ({ page }, use) => {
    await use(new SauceCheckoutInformationPage(page));
  },
  checkoutOverviewPage: async ({ page }, use) => {
    await use(new SauceCheckoutOverviewPage(page));
  },
  checkoutCompletePage: async ({ page }, use) => {
    await use(new SauceCheckoutCompletePage(page));
  },
});
