import { Locator, Page } from "@playwright/test";
import { BookingBasePage } from "./BookingBasePage";

/** Pantalla de resultados de búsqueda: grilla de alojamientos y filtros. */
export class BookingResultsPage extends BookingBasePage {
  readonly propertyCards: Locator;
  private readonly filterFreeCancellation: Locator;
  private readonly filterVeryGoodScore: Locator;

  constructor(page: Page) {
    super(page);
    this.propertyCards = page.locator('[data-testid="property-card"]');
    // Los filtros aparecen dos veces (filtros populares y su grupo): usamos el primero
    this.filterFreeCancellation = page.getByRole("checkbox", { name: /Cancelación gratis/i }).first();
    this.filterVeryGoodScore = page.getByRole("checkbox", { name: /Muy bien: 8 o más/i }).first();
  }

  /**
   * Espera a que termine la redirección de la búsqueda e indica si hay grilla de resultados.
   * Devuelve false si Booking redirigió a la landing de la ciudad o no mostró alojamientos.
   */
  async hasResults(): Promise<boolean> {
    await this.page.waitForURL(/\/searchresults|\/city\//);
    if (!/\/searchresults/.test(this.page.url())) return false;
    try {
      await this.propertyCards.first().waitFor({ timeout: 15_000 });
      return true;
    } catch {
      return false;
    }
  }

  async applyFreeCancellationFilter() {
    await this.applyFilter(this.filterFreeCancellation);
  }

  async applyVeryGoodScoreFilter() {
    await this.applyFilter(this.filterVeryGoodScore);
  }

  /**
   * Booking actualiza la grilla por AJAX y agrega el filtro a la URL (parámetro nflt).
   * Esperamos el cambio de URL y que la grilla vuelva a tener tarjetas.
   */
  private async applyFilter(filter: Locator) {
    const urlAnterior = this.page.url();
    await filter.check();
    await this.page.waitForURL((url) => url.href !== urlAnterior);
    await this.propertyCards.first().waitFor();
  }

  async getResultsCount(): Promise<number> {
    await this.propertyCards.first().waitFor();
    return await this.propertyCards.count();
  }

  /**
   * Abre un alojamiento de la grilla. Booking lo abre en una pestaña nueva:
   * empezamos a escuchar el evento 'page' ANTES del clic.
   */
  async openProperty(index = 0): Promise<{ name: string; newPage: Page }> {
    const card = this.propertyCards.nth(index);
    const name = (await card.locator('[data-testid="title"]').innerText()).trim();

    const newPagePromise = this.page.context().waitForEvent("page");
    await card.locator('[data-testid="title-link"]').click();
    const newPage = await newPagePromise;
    await newPage.waitForLoadState("domcontentloaded");

    return { name, newPage };
  }
}
