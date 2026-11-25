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

**Cómo se resolvió en las Actividades 2, 3 y 4:** los tests ejecutan el flujo real y, después
de buscar, consultan `BookingResultsPage.hasResults()`. Si Booking bloqueó los resultados, el
test queda **skipped** con el motivo en el reporte (`test.skip(condición, motivo)`), en lugar
de fallar o de dar un falso positivo. Si Booking deja de bloquear, los tests corren completos
sin cambios.

**Selectores que no se pudieron verificar contra el sitio real** (por el bloqueo):

| Page Object | Selector | Estado |
|---|---|---|
| BookingResultsPage | `[data-testid="property-card"]`, `title`, `title-link` | No verificado |
| BookingResultsPage | checkbox "Cancelación gratis" / "Muy bien: 8 o más" | No verificado |
| BookingDetailPage | `#hp_hotel_name h1` (nombre del hotel) | **Verificado** abriendo una ficha directamente |
| BookingDetailPage | `#hprt-table select`, botón "Reservaré" | No verificado: la ficha también pierde las fechas y no muestra habitaciones |
| BookingCheckoutPage | `#firstname`, `#lastname`, `#email`, botón "Siguiente" | No verificado: no se puede llegar al checkout |

Los mensajes de error del checkout se localizan por `aria-describedby` del input (la forma
accesible de asociar un error a un campo) para no depender de clases CSS.

## 1b. Variantes A/B del buscador

Booking muestra distintas versiones de la home a distintas sesiones (se nota al correr tests
en paralelo):

- En una variante el destino se llama "Buscá con tus propias palabras" y el botón de personas
  no tiene `data-testid="occupancy-config"` → se usa `.or()` con su nombre accesible.
- En otra, el calendario y las personas se abren como modal que tapa el formulario hasta
  tocar "Confirmar"/"Listo" → `confirmIfModal()` lo cierra solo si aparece.

Por la cantidad de pasos y esperas, el timeout de los tests de Booking se subió a 90 s con una
fixture automática (`bookingTimeout` en `fixtures/bookingFixtures.ts`).

Estabilidad comprobada: 44 ejecuciones (4 tests × 11 repeticiones, 4 en paralelo) sin fallas.

## 1c. La ficha del hotel se abre en otra pestaña y las fixtures usan `page`

Las fixtures se crean con la `page` del test, pero la ficha se abre en una pestaña nueva.
- Actividad 3: se instancia `BookingDetailPage` con la nueva referencia de Page (lo que pide
  la consigna).
- Actividad 4: se abre la URL de la pestaña nueva en `page` y se cierra la nueva, para que la
  fixture `checkoutPage` trabaje sobre la misma página.

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
