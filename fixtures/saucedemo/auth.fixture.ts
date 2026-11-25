import { expect } from "@playwright/test";
import { STANDARD_USER, type SauceCredentials } from "../../data/saucedemo/sauceUsers";
import type { SauceInventoryPage } from "../../pages/saucedemo/SauceInventoryPage";
import { test as pagesTest } from "./pages.fixture";

/**
 * Custom fixture de login para SauceDemo.
 *
 * - `credentials`: usuario con el que se inicia sesión. Por defecto es standard_user,
 *   y una suite puede cambiarlo con test.use({ credentials: OTRO_USUARIO }).
 * - `loggedInPage`: hace el login antes del test y entrega el inventario listo.
 *   Basta con pedirlo en el test para que el login ocurra; reemplaza al beforeEach.
 */
export type SauceAuthFixtures = {
  credentials: SauceCredentials;
  loggedInPage: SauceInventoryPage;
};

export const test = pagesTest.extend<SauceAuthFixtures>({
  credentials: [STANDARD_USER, { option: true }],

  loggedInPage: async ({ loginPage, inventoryPage, credentials }, use) => {
    await loginPage.goto();
    await loginPage.login(credentials.username, credentials.password);
    expect(await loginPage.getInventoryPageVisible()).toBeTruthy();

    await use(inventoryPage);
  },
});
