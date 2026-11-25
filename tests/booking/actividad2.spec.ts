import { test, expect } from "@playwright/test";
import { BookingSearchPage } from "../../pages/booking/BookingSearchPage";
import { BookingResultsPage } from "../../pages/booking/BookingResultsPage";
import { futureStay } from "../../utils/booking/bookingDates";
import { BOOKING_SIN_RESULTADOS } from "../../utils/booking/bookingLimitations";

test.describe("Booking - Actividad 2: filtros y validación de resultados", () => {
  test("@booking Filtrar por cancelación gratis y puntuación 8+ devuelve resultados", async ({ page }) => {
    const { checkIn, checkOut } = futureStay(30, 3);
    const searchPage = new BookingSearchPage(page);
    const resultsPage = new BookingResultsPage(page);

    // Reutilizamos la búsqueda de la Actividad 1
    await searchPage.goto();
    await searchPage.searchDestination("Bariloche", checkIn, checkOut, 2);
    test.skip(!(await resultsPage.hasResults()), BOOKING_SIN_RESULTADOS);

    await resultsPage.applyFreeCancellationFilter();
    await expect(page).toHaveURL(/nflt=/);

    await resultsPage.applyVeryGoodScoreFilter();
    await expect(page).toHaveURL(/review_score/);

    expect(await resultsPage.getResultsCount()).toBeGreaterThan(0);
  });
});
