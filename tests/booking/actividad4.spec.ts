import { test, expect } from "@playwright/test";
import { BookingSearchPage } from "../../pages/booking/BookingSearchPage";
import { BookingResultsPage } from "../../pages/booking/BookingResultsPage";
import { BookingDetailPage } from "../../pages/booking/BookingDetailPage";
import { BookingCheckoutPage } from "../../pages/booking/BookingCheckoutPage";
import { futureStay } from "../../utils/booking/bookingDates";
import { BOOKING_SIN_RESULTADOS } from "../../utils/booking/bookingLimitations";

test.describe("Booking - Actividad 4: validaciones negativas en el checkout", () => {
  test("@booking Enviar datos del huésped vacíos no avanza y muestra errores", async ({ page }) => {
    const { checkIn, checkOut } = futureStay(30, 3);
    const searchPage = new BookingSearchPage(page);
    const resultsPage = new BookingResultsPage(page);

    await searchPage.goto();
    await searchPage.searchDestination("Bariloche", checkIn, checkOut, 2);
    test.skip(!(await resultsPage.hasResults()), BOOKING_SIN_RESULTADOS);

    const { newPage } = await resultsPage.openProperty(0);
    const detailPage = new BookingDetailPage(newPage);
    await detailPage.handlePopups();
    await detailPage.reserveFirstRoom();

    const checkoutPage = new BookingCheckoutPage(newPage);
    const urlCheckout = newPage.url();
    await checkoutPage.submitEmptyForm();

    // El formulario no avanza
    await expect(newPage).toHaveURL(urlCheckout);

    for (const campo of [checkoutPage.inputFirstName, checkoutPage.inputLastName, checkoutPage.inputEmail]) {
      const html5 = await checkoutPage.getHtml5ValidationMessage(campo);
      if (html5) {
        // Validación nativa de HTML5
        expect(html5).not.toBe("");
      } else {
        // Validación personalizada de JavaScript
        await expect(campo).toHaveAttribute("aria-invalid", "true");
        const error = await checkoutPage.getErrorMessage(campo);
        await expect(error).toBeVisible();
        await expect(error).toHaveText(/\S+/);
      }
    }
  });
});
