import { test, expect } from "@playwright/test";
import { BookingSearchPage } from "../../pages/booking/BookingSearchPage";
import { BookingResultsPage } from "../../pages/booking/BookingResultsPage";
import { BookingDetailPage } from "../../pages/booking/BookingDetailPage";
import { futureStay } from "../../utils/booking/bookingDates";
import { BOOKING_SIN_RESULTADOS } from "../../utils/booking/bookingLimitations";

test.describe("Booking - Actividad 3: manejo de nuevas pestañas", () => {
  test("@booking Abrir un alojamiento en pestaña nueva muestra el hotel seleccionado", async ({ page }) => {
    const { checkIn, checkOut } = futureStay(30, 3);
    const searchPage = new BookingSearchPage(page);
    const resultsPage = new BookingResultsPage(page);

    await searchPage.goto();
    await searchPage.searchDestination("Bariloche", checkIn, checkOut, 2);
    test.skip(!(await resultsPage.hasResults()), BOOKING_SIN_RESULTADOS);

    const { name, newPage } = await resultsPage.openProperty(0);

    // El Page Object de la ficha trabaja sobre la pestaña nueva, no sobre `page`
    const detailPage = new BookingDetailPage(newPage);
    await detailPage.handlePopups();

    expect(newPage).not.toBe(page);
    await expect(newPage).toHaveURL(/\/hotel\//);
    await expect(detailPage.hotelName).toHaveText(name);
  });
});
