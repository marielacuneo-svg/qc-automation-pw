/**
 * Motivo que se muestra en el reporte cuando Booking no devuelve resultados
 * a un navegador automatizado. Detalle y evidencia en LIMITACIONES-BOOKING.md
 */
export const BOOKING_SIN_RESULTADOS =
  "Booking bloquea los resultados para navegadores automatizados: redirige /searchresults " +
  "a la landing de la ciudad (HTTP 301) o informa 0 propiedades. Ver LIMITACIONES-BOOKING.md";
