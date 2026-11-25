import { test, expect } from "../../fixtures/bookingFixtures";
import { futureStay } from "../../utils/booking/bookingDates";
import { BOOKING_SIN_RESULTADOS } from "../../utils/booking/bookingLimitations";

test.describe("Booking - Actividad 2: filtros y validación de resultados", () => {
  test("@booking Filtrar por cancelación gratis y puntuación 8+ devuelve resultados", async ({ page, searchPage, searchResultsPage }) => {
    const { checkIn, checkOut } = futureStay(30, 3);

    // Reutilizamos la búsqueda de la Actividad 1
    await searchPage.goto();
    await searchPage.searchDestination("Bariloche", checkIn, checkOut, 2);
    test.skip(!(await searchResultsPage.hasResults()), BOOKING_SIN_RESULTADOS);

    await searchResultsPage.applyFreeCancellationFilter();
    await expect(page).toHaveURL(/nflt=/);

    await searchResultsPage.applyVeryGoodScoreFilter();
    await expect(page).toHaveURL(/review_score/);

    expect(await searchResultsPage.getResultsCount()).toBeGreaterThan(0);
  });
});
