import { expect, Locator, Page } from "@playwright/test";
import { BookingBasePage } from "./BookingBasePage";

/** Buscador de la home de Booking: destino, fechas y cantidad de personas. */
export class BookingSearchPage extends BookingBasePage {
  private readonly inputDestination: Locator;
  private readonly autocompleteResults: Locator;
  private readonly datesContainer: Locator;
  private readonly calendar: Locator;
  private readonly btnNextMonth: Locator;
  private readonly occupancyConfig: Locator;
  private readonly inputAdults: Locator;
  private readonly btnSearch: Locator;

  constructor(page: Page) {
    super(page);
    this.inputDestination = page.locator('input[name="ss"]');
    this.autocompleteResults = page.locator('[data-testid="autocomplete-result"]');
    this.datesContainer = page.locator('[data-testid="searchbox-dates-container"]');
    this.calendar = page.locator('[data-testid="searchbox-datepicker-calendar"]');
    // Booking escribe "Mes siquiente" (con q): usamos regex para no depender del typo
    this.btnNextMonth = this.calendar.getByRole("button", { name: /^(Mes si|Next month)/ });
    this.occupancyConfig = page.locator('[data-testid="occupancy-config"]');
    this.inputAdults = page.locator("#group_adults");
    this.btnSearch = page.locator('button[type="submit"]');
  }

  /**
   * Busca alojamiento.
   * @param fechaInicio y fechaFin en formato YYYY-MM-DD (ver utils/booking/bookingDates.ts)
   */
  async searchDestination(destino: string, fechaInicio: string, fechaFin: string, adultos = 2) {
    await this.selectDestination(destino);
    await this.selectDates(fechaInicio, fechaFin);
    await this.setAdults(adultos);
    await this.btnSearch.click();
  }

  async selectDestination(destino: string) {
    // Al cargar la home (o al cerrarse el popup de Genius) Booking puede borrar lo escrito,
    // y al hacer foco muestra "destinos tendencia". Reintentamos hasta que aparezca
    // una sugerencia que coincida con el destino buscado.
    await expect(async () => {
      await this.inputDestination.fill(destino);
      await this.autocompleteResults.filter({ hasText: destino }).first().click({ timeout: 5_000 });
    }).toPass({ timeout: 30_000 });
  }

  async selectDates(fechaInicio: string, fechaFin: string) {
    // al elegir el destino el calendario se abre solo; si no, lo abrimos
    if (!(await this.calendar.isVisible())) {
      await this.datesContainer.click();
    }
    await this.clickDay(fechaInicio);
    await this.clickDay(fechaFin);
  }

  async setAdults(adultos: number) {
    await this.occupancyConfig.click();
    // los botones - y + son hermanos del input y tienen aria-hidden, por eso usamos CSS
    const btnMinus = this.page.locator("#group_adults ~ button").first();
    const btnPlus = this.page.locator("#group_adults ~ button").last();

    let actual = Number(await this.inputAdults.inputValue());
    while (actual < adultos) {
      await btnPlus.click();
      actual++;
    }
    while (actual > adultos) {
      await btnMinus.click();
      actual--;
    }
  }

  /** Celda del calendario para una fecha (atributo data-date). */
  private dayCell(fecha: string): Locator {
    return this.calendar.locator(`[data-date="${fecha}"]`);
  }

  private async clickDay(fecha: string) {
    // el calendario muestra 2 meses: avanzamos hasta que aparezca la fecha
    for (let i = 0; i < 12 && !(await this.dayCell(fecha).isVisible()); i++) {
      await this.btnNextMonth.click();
    }
    await this.dayCell(fecha).click();
  }
}
