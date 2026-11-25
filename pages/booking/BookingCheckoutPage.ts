import { Locator, Page } from "@playwright/test";
import { BookingBasePage } from "./BookingBasePage";

/** Formulario de datos del huésped (secure.booking.com/book.html). */
export class BookingCheckoutPage extends BookingBasePage {
  readonly inputFirstName: Locator;
  readonly inputLastName: Locator;
  readonly inputEmail: Locator;
  private readonly btnSubmit: Locator;

  constructor(page: Page) {
    super(page);
    this.inputFirstName = page.locator("#firstname");
    this.inputLastName = page.locator("#lastname");
    this.inputEmail = page.locator("#email");
    this.btnSubmit = page.getByRole("button", { name: /Siguiente|últimos detalles/i }).first();
  }

  /** Deja nombre, apellido y email vacíos e intenta enviar el formulario. */
  async submitEmptyForm() {
    await this.inputFirstName.clear();
    await this.inputLastName.clear();
    await this.inputEmail.clear();
    await this.btnSubmit.click();
  }

  /**
   * Mensaje de error personalizado (JavaScript) de un campo.
   * Usa aria-describedby, que es como el formulario asocia el error al input.
   */
  async getErrorMessage(field: Locator): Promise<Locator> {
    const describedBy = await field.getAttribute("aria-describedby");
    const ids = (describedBy ?? "").split(" ").filter(Boolean).map((id) => `[id="${id}"]`);
    return this.page.locator(ids.join(", ") || "[data-error-inexistente]");
  }

  /** Mensaje de validación nativa de HTML5 (vacío si el campo es válido). */
  async getHtml5ValidationMessage(field: Locator): Promise<string> {
    return await field.evaluate((el: HTMLInputElement) => el.validationMessage);
  }
}
