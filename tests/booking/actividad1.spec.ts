import { test, expect } from "@playwright/test";
import { BookingSearchPage } from "../../pages/booking/BookingSearchPage";
import { futureStay } from "../../utils/booking/bookingDates";

test.describe("Booking - Actividad 1: búsqueda de alojamientos", () => {
  test("@booking Buscar destino con fechas y personas redirige a resultados", async ({ page }) => {
    const destino = "Bariloche";
    const adultos = 3;
    const { checkIn, checkOut } = futureStay(30, 3);
    const searchPage = new BookingSearchPage(page);

    await searchPage.goto();

    // Escuchamos la navegación ANTES de hacer clic en "Buscar"
    const searchRequest = page.waitForRequest(/\/searchresults/);
    await searchPage.searchDestination(destino, checkIn, checkOut, adultos);
    const searchUrl = (await searchRequest).url();

    // La aplicación redirige a la pantalla de resultados con los datos de la búsqueda
    expect(searchUrl).toMatch(/\/searchresults/);
    expect(searchUrl).toContain(destino);
    expect(searchUrl).toContain(`checkin=${checkIn}`);
    expect(searchUrl).toContain(`checkout=${checkOut}`);
    expect(searchUrl).toContain(`group_adults=${adultos}`);

    // LIMITACIÓN: con navegadores automatizados Booking responde 301 hacia la landing
    // de la ciudad (/city/...) en lugar de mostrar /searchresults. Ver LIMITACIONES-BOOKING.md
    await page.waitForLoadState("domcontentloaded");
    test.info().annotations.push({ type: "URL final", description: page.url() });
  });
});
