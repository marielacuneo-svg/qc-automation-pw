import { test, expect } from "../../fixtures/bookingFixtures";
import { BookingDetailPage } from "../../pages/booking/BookingDetailPage";
import { futureStay } from "../../utils/booking/bookingDates";
import { BOOKING_SIN_RESULTADOS } from "../../utils/booking/bookingLimitations";

test.describe("Booking - Actividad 3: manejo de nuevas pestañas", () => {
  test("@booking Abrir un alojamiento en pestaña nueva muestra el hotel seleccionado", async ({ page, searchPage, searchResultsPage }) => {
    const { checkIn, checkOut } = futureStay(30, 3);

    await searchPage.goto();
    await searchPage.searchDestination("Bariloche", checkIn, checkOut, 2);
    test.skip(!(await searchResultsPage.hasResults()), BOOKING_SIN_RESULTADOS);

    const { name, newPage } = await searchResultsPage.openProperty(0);

    // La ficha vive en la pestaña nueva: no puede ser una fixture atada a `page`,
    // por eso la instanciamos con la nueva referencia de Page
    const detailPage = new BookingDetailPage(newPage);
    await detailPage.handlePopups();

    expect(newPage).not.toBe(page);
    await expect(newPage).toHaveURL(/\/hotel\//);
    await expect(detailPage.hotelName).toHaveText(name);
  });
});
