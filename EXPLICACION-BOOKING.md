# Explicación del trabajo práctico — Booking con POM y Custom Fixtures

## Cómo organicé el proyecto

Separé el proyecto en carpetas para no mezclar las cosas:

- En `pages/booking/` puse los Page Objects, una clase por cada pantalla de Booking: la búsqueda (`BookingSearchPage`), los resultados (`BookingResultsPage`), el detalle del hotel (`BookingDetailPage`) y el checkout (`BookingCheckoutPage`).
- Todas heredan de `BookingBasePage`, que guarda el `page` y se encarga de cerrar los popups que aparecen, como el de "Iniciá sesión y ahorrá". Así no tuve que repetir ese código en cada página.
- En `tests/booking/` están los tests, uno por actividad.
- En `fixtures/` está el archivo de las fixtures.
- En `utils/booking/` dejé funciones de ayuda, por ejemplo la que calcula las fechas de la estadía.

Cada Page Object tiene sus localizadores y sus métodos, por ejemplo `searchDestination()` o `applyFreeCancellationFilter()`. Los tests solo llaman a esos métodos y hacen las validaciones.

## Ventajas que encontré con POM

- Si Booking cambia un botón, lo arreglo en un solo lugar (el Page Object) y no en todos los tests. Me pasó de verdad: Booking muestra distintas versiones del buscador y lo corregí solo en `BookingSearchPage`.
- Los tests se leen más fácil porque se entiende qué hace cada paso sin ver los selectores.
- Pude reutilizar la búsqueda de la Actividad 1 en las demás actividades sin copiar código.

## Ventajas que encontré con las Custom Fixtures

Antes, en cada test tenía que escribir `new BookingSearchPage(page)`, `new BookingResultsPage(page)`, etc. Con las fixtures pido directamente `searchPage` o `searchResultsPage` en los parámetros del test y Playwright los crea solo. Los tests quedaron más cortos y prolijos. En el historial de commits se puede ver cómo eran antes y después del cambio.

Me costó un poco la parte de la pestaña nueva. Las fixtures usan la página principal, pero el hotel se abre en otra pestaña. Para la Actividad 3 creé el `BookingDetailPage` con la pestaña nueva. Para la Actividad 4 abrí la URL de esa pestaña en la página principal, así podía usar la fixture del checkout.

## Limitaciones

Booking detecta que el navegador está automatizado y no muestra los resultados de búsqueda: redirige a la página de la ciudad o dice que hay 0 alojamientos. Por eso la Actividad 1 pasa, pero las Actividades 2, 3 y 4 quedan omitidas (skipped) y el reporte muestra el motivo. Dejé todo explicado con evidencia en `LIMITACIONES-BOOKING.md`.
