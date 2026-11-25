import { Locator, Page } from "@playwright/test";

/**
 * Clase base de todos los Page Objects de Booking.
 * Guarda la instancia de Page y resuelve lo que se repite en todas las pantallas
 * (navegación y popups que tapan la página).
 */
export class BookingBasePage {
  protected readonly page: Page;
  protected readonly baseUrl = "https://www.booking.com";
  private readonly btnCloseSignIn: Locator;
  private readonly btnAcceptCookies: Locator;

  constructor(page: Page) {
    this.page = page;
    this.btnCloseSignIn = page.getByRole("button", { name: "No quiero iniciar sesión." });
    this.btnAcceptCookies = page.locator("#onetrust-accept-btn-handler");
  }

  async goto(path = "/") {
    await this.handlePopups();
    await this.page.goto(`${this.baseUrl}${path}`);
  }

  /**
   * El popup de Genius ("Iniciá sesión y ahorrá") y el banner de cookies aparecen
   * unos segundos después de cargar y en momentos variables. addLocatorHandler
   * los cierra automáticamente cada vez que tapan la página, sin esperas fijas.
   */
  async handlePopups() {
    await this.page.addLocatorHandler(this.btnCloseSignIn, async () => {
      await this.btnCloseSignIn.click();
    });
    await this.page.addLocatorHandler(this.btnAcceptCookies, async () => {
      await this.btnAcceptCookies.click();
    });
  }
}
