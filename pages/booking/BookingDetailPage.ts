import { Locator, Page } from "@playwright/test";
import { BookingBasePage } from "./BookingBasePage";

/** Ficha de un alojamiento (se abre en una pestaña nueva desde los resultados). */
export class BookingDetailPage extends BookingBasePage {
  readonly hotelName: Locator;
  private readonly roomSelects: Locator;
  private readonly btnReserve: Locator;

  constructor(page: Page) {
    super(page);
    this.hotelName = page.locator("#hp_hotel_name h1");
    // La tabla de habitaciones solo aparece si la ficha recibe fechas de estadía
    this.roomSelects = page.locator("#hprt-table select");
    this.btnReserve = page.getByRole("button", { name: /Reservaré/i }).first();
  }

  async getHotelName(): Promise<string> {
    return (await this.hotelName.innerText()).trim();
  }

  /** Elige 1 unidad de la primera habitación y avanza al formulario de datos del huésped. */
  async reserveFirstRoom() {
    await this.roomSelects.first().selectOption({ index: 1 });
    await this.btnReserve.click();
    await this.page.waitForURL(/\/book/);
  }
}
