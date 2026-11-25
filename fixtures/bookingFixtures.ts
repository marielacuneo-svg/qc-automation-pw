import { test as base } from "@playwright/test";
import { BookingSearchPage } from "../pages/booking/BookingSearchPage";
import { BookingResultsPage } from "../pages/booking/BookingResultsPage";
import { BookingCheckoutPage } from "../pages/booking/BookingCheckoutPage";

/**
 * Page Objects de Booking disponibles como fixtures.
 * Cada test pide solo los que usa: async ({ searchPage, searchResultsPage }) => {...}
 * Playwright los crea con la misma `page` del test, así que comparten la pestaña.
 */
type BookingFixtures = {
  searchPage: BookingSearchPage;
  searchResultsPage: BookingResultsPage;
  checkoutPage: BookingCheckoutPage;
  bookingTimeout: void;
};

export const test = base.extend<BookingFixtures>({
  // Fixture automática (auto: true): corre en todos los tests de Booking sin pedirla.
  // El flujo real de Booking (popups, variantes A/B, AJAX) supera el timeout default de 30 s.
  bookingTimeout: [
    async ({}, use, testInfo) => {
      testInfo.setTimeout(90_000);
      await use();
    },
    { auto: true },
  ],

  searchPage: async ({ page }, use) => {
    await use(new BookingSearchPage(page));
  },
  searchResultsPage: async ({ page }, use) => {
    await use(new BookingResultsPage(page));
  },
  checkoutPage: async ({ page }, use) => {
    await use(new BookingCheckoutPage(page));
  },
});

export { expect } from "@playwright/test";
