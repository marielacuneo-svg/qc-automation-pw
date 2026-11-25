# Limitaciones encontradas al automatizar Booking.com

Fecha de las pruebas: 25/11/2026 — Playwright 1.64.1, Chromium, locale `es-AR`.

## 1. Booking no muestra resultados a navegadores automatizados

**Qué pasa:** al completar destino, fechas y personas y hacer clic en "Buscar", el formulario
navega correctamente a `/searchresults` con todos los parámetros:

```
/searchresults.es-ar.html?ss=San+Carlos+de+Bariloche...&checkin=2026-12-25&checkout=2026-12-28&group_adults=3&no_rooms=1&group_children=0
```

pero el servidor responde **HTTP 301** hacia la landing de la ciudad
(`/city/ar/san-carlos-de-bariloche.es-ar.html`), donde se pierden las fechas.

Si se abre la URL de `/searchresults` directamente, la página carga pero informa
"Hay 0 propiedades disponibles en este destino y alrededores".

**Verificado que no es un error del test:**
- Sucede tanto en modo headless como con `--headed`.
- La request de búsqueda contiene los datos correctos (se capturó con `page.waitForRequest`).
- Volver a buscar desde la landing de la ciudad produce la misma redirección.

**Cómo se resolvió en la Actividad 1:** el test valida, con una expresión regular sobre
`/searchresults`, la navegación que dispara la aplicación y que incluya destino, check-in,
check-out y cantidad de adultos. La URL final se registra como anotación en el reporte.

**Impacto:** las Actividades 2 (filtros sobre resultados), 3 (abrir un alojamiento) y
4 (checkout) dependen de la grilla de resultados.

## 2. Popup de Genius ("Iniciá sesión y ahorrá")

Aparece unos segundos después de cargar la home, en un momento variable, y al cerrarse
puede borrar el texto escrito en el destino. Se resolvió con `page.addLocatorHandler()` en
`BookingBasePage` (lo cierra automáticamente cuando aparece) y reintentando la carga del
destino con `expect().toPass()` en `BookingSearchPage.selectDestination()`.

## 3. Detalles del HTML

- El botón para avanzar de mes dice "Mes **siquiente**" (error de tipeo de Booking): se
  localiza con una expresión regular.
- Los botones +/- de adultos tienen `aria-hidden="true"`, por lo que `getByRole` no los
  encuentra: se localizan con CSS (`#group_adults ~ button`).
- Al hacer foco en el destino se muestran "Destinos que son tendencia" antes de las
  sugerencias reales: se filtra la sugerencia por el texto del destino.
