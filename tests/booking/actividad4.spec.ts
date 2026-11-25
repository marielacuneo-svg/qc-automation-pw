import { test, expect } from "../../fixtures/bookingFixtures";
import { BookingDetailPage } from "../../pages/booking/BookingDetailPage";
import { futureStay } from "../../utils/booking/bookingDates";
import { BOOKING_SIN_RESULTADOS } from "../../utils/booking/bookingLimitations";

test.describe("Booking - Actividad 4: validaciones negativas en el checkout", () => {
  test("@booking Enviar datos del huésped vacíos no avanza y muestra errores", async ({ page, searchPage, searchResultsPage, checkoutPage }) => {
    const { checkIn, checkOut } = futureStay(30, 3);

    await searchPage.goto();
    await searchPage.searchDestination("Bariloche", checkIn, checkOut, 2);
    test.skip(!(await searchResultsPage.hasResults()), BOOKING_SIN_RESULTADOS);

    // La ficha se abre en una pestaña nueva. Para que la fixture checkoutPage (atada a `page`)
    // sirva, abrimos la URL de esa pestaña en la página principal y cerramos la nueva.
    const { newPage } = await searchResultsPage.openProperty(0);
    await page.goto(newPage.url());
    await newPage.close();

    const detailPage = new BookingDetailPage(page);
    await detailPage.reserveFirstRoom();

    const urlCheckout = page.url();
    await checkoutPage.submitEmptyForm();

    // El formulario no avanza
    await expect(page).toHaveURL(urlCheckout);

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
