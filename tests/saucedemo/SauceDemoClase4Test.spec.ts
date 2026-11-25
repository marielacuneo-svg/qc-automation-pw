/**
 * Archivo de pruebas E2E para SauceDemo utilizando Playwright.
 * Contiene flujos de autenticación y compra de productos.
 *
 * Usa los custom fixtures de fixtures/saucedemo:
 * - Los Page Objects (loginPage, cartPage, ...) llegan ya creados como parámetros del test.
 * - loggedInPage hace el login con standard_user antes del test y entrega el inventario.
 */
import { expect, test } from "../../fixtures/saucedemo";
import { LOCKED_OUT_USER, STANDARD_USER } from "../../data/saucedemo/sauceUsers";

// Suite principal: sus etiquetas se heredan en los tests internos.
test.describe(
  "SauceDemo - Flujos E2E de compra",
  { tag: ["@saucedemo", "@regression"] },
  () => {
    // Pruebas que verifican acceso, rechazo de acceso y cierre de sesión.
    // Acá el login es lo que se prueba, por eso se usa loginPage y no loggedInPage.
    test.describe("Autenticación", { tag: "@auth" }, () => {
      test(
        "Iniciar sesión con credenciales válidas",
        { tag: "@smoke" },
        async ({ loginPage }) => {
          await test.step("Paso 1: Abrir la página de inicio de sesión", async () => {
            await loginPage.goto();
          });

          await test.step("Paso 2: Ingresar credenciales válidas", async () => {
            // Completa ambos campos con el usuario estándar de SauceDemo.
            await loginPage.login(STANDARD_USER.username, STANDARD_USER.password);
          });

          await test.step("Paso 3: Verificar que se abrió el inventario", async () => {
            // Comprueba la URL de destino y que el título del inventario sea visible.
            expect(await loginPage.getInventoryPageVisible()).toBeTruthy();
          });
        },
      );

      test("Rechazar credenciales inválidas", async ({ loginPage }) => {
        await test.step("Paso 1: Abrir la página de inicio de sesión", async () => {
          // Empieza en una página limpia de login.
          await loginPage.goto();
        });

        await test.step("Paso 2: Enviar una contraseña incorrecta", async () => {
          // Usa un usuario conocido, pero una contraseña que no es válida.
          await loginPage.login(STANDARD_USER.username, "wrong_password");
        });

        await test.step("Paso 3: Verificar el mensaje de error", async () => {
          const msjError =
            "Epic sadface: Username and password do not match any user in this service";
          expect(await loginPage.getErrorMessage()).toContain(msjError);
        });
      });

      test("Impedir el acceso al usuario bloqueado", async ({ loginPage }) => {
        await test.step("Paso 1: Abrir la página de inicio de sesión", async () => {
          await loginPage.goto();
        });

        await test.step("Paso 2: Intentar ingresar con locked_out_user", async () => {
          await loginPage.login(LOCKED_OUT_USER.username, LOCKED_OUT_USER.password);
        });

        await test.step("Paso 3: Verificar que el acceso fue bloqueado", async () => {
          const msjError = "Sorry, this user has been locked out";
          expect(await loginPage.getErrorMessage()).toContain(msjError);
        });
      });

      test("Cerrar sesión e impedir el acceso directo al inventario", async ({
        loggedInPage: inventoryPage,
        loginPage,
      }) => {
        // El fixture loggedInPage ya inició sesión antes de este punto.

        await test.step("Paso 1: Cerrar sesión desde el menú", async () => {
          // Abre la navegación lateral y selecciona la opción para salir.
          await loginPage.logout();
        });

        await test.step("Paso 2: Verificar el regreso al login", async () => {
          // La presencia del campo de usuario confirma que terminó la sesión.
          expect(await loginPage.isUsernameVisible()).toBeTruthy();
          expect(await loginPage.isPasswordVisible()).toBeTruthy();
          expect(await loginPage.isLoginButtonVisible()).toBeTruthy();
        });

        await test.step("Paso 3: Verificar que el inventario requiere autenticación", async () => {
          // Intenta abrir directamente una ruta protegida después de salir.
          await inventoryPage.openInventoryDirectly();
          // Confirma que el sitio redirige al formulario de acceso.
          expect(await loginPage.isUsernameVisible()).toBeTruthy();
          expect(await loginPage.isPasswordVisible()).toBeTruthy();
          expect(await loginPage.isLoginButtonVisible()).toBeTruthy();
        });
      });
    });

    // Suite para las opciones de ordenamiento y el detalle de producto.
    test.describe("Inventario", { tag: "@inventory" }, () => {
      test("Ordenar productos por nombre y precio", async ({
        loggedInPage: inventoryPage,
      }) => {
        await test.step("Paso 1: Ordenar nombres de A a Z", async () => {
          // El valor "az" selecciona el orden alfabético ascendente.
          await inventoryPage.orderByName("az", "Sauce Labs Backpack");

          const productNames = await inventoryPage.getProductNames();
          await expect(productNames).toEqual([
            "Sauce Labs Backpack",
            "Sauce Labs Bike Light",
            "Sauce Labs Bolt T-Shirt",
            "Sauce Labs Fleece Jacket",
            "Sauce Labs Onesie",
            "Test.allTheThings() T-Shirt (Red)",
          ]);
        });

        await test.step("Paso 2: Ordenar nombres de Z a A", async () => {
          // El valor "za" selecciona el orden alfabético descendente.
          await inventoryPage.orderByName(
            "za",
            "Test.allTheThings() T-Shirt (Red)",
          );
          const productNames = await inventoryPage.getProductNames();
          await expect(productNames).toEqual([
            "Test.allTheThings() T-Shirt (Red)",
            "Sauce Labs Onesie",
            "Sauce Labs Fleece Jacket",
            "Sauce Labs Bolt T-Shirt",
            "Sauce Labs Bike Light",
            "Sauce Labs Backpack",
          ]);
        });

        await test.step("Paso 3: Ordenar precios de menor a mayor", async () => {
          // El valor "lohi" ordena los precios de menor a mayor.
          await inventoryPage.orderByPrice("lohi", "$7.99");
          const productPrices = await inventoryPage.getProductPrices();
          await expect(productPrices).toEqual([
            "$7.99",
            "$9.99",
            "$15.99",
            "$15.99",
            "$29.99",
            "$49.99",
          ]);
        });

        await test.step("Paso 4: Ordenar precios de mayor a menor", async () => {
          // El valor "hilo" ordena los precios de mayor a menor.
          await inventoryPage.orderByPrice("hilo", "$49.99");
          const productPrices = await inventoryPage.getProductPrices();
          await expect(productPrices).toEqual([
            "$49.99",
            "$29.99",
            "$15.99",
            "$15.99",
            "$9.99",
            "$7.99",
          ]);
        });
      });

      test("Abrir el detalle de un producto y regresar al inventario", async ({
        loggedInPage: inventoryPage,
        productDetailPage,
        page,
      }) => {
        await test.step("Paso 1: Abrir el detalle de Sauce Labs Backpack", async () => {
          await inventoryPage.openProductDetail("Sauce Labs Backpack");
          expect(await productDetailPage.validateUrl()).toBeTruthy();
        });

        await test.step("Paso 2: Verificar la información del producto", async () => {
          expect(await productDetailPage.isProductNameVisible()).toBeTruthy();
          expect(await productDetailPage.isProductDescriptionVisible()).toBeTruthy();
          expect(await productDetailPage.isProductPriceVisible()).toBeTruthy();
          expect(await productDetailPage.isAddToCartButtonVisible()).toBeTruthy();
        });

        await test.step("Paso 3: Regresar al inventario", async () => {
          await productDetailPage.goBackToProducts();
          await expect(page).toHaveURL(/inventory.html/);
        });
      });
    });

    // Suite para agregar, quitar y conservar artículos del carrito.
    test.describe("Carrito", { tag: "@cart" }, () => {
      test("Agregar y quitar productos del carrito", async ({
        loggedInPage: inventoryPage,
        cartPage,
      }) => {
        await test.step("Paso 1: Agregar Sauce Labs Backpack", async () => {
          await inventoryPage.addProductToCart("Sauce Labs Backpack");
          await expect.poll(() => inventoryPage.getCartBadgeText()).toBe("1");
        });

        await test.step("Paso 2: Abrir el carrito y verificar el producto", async () => {
          await inventoryPage.openCart();
          await expect.poll(() => cartPage.getItemCount()).toBe(1);
          await expect
            .poll(() => cartPage.getItemNames())
            .toContain("Sauce Labs Backpack");
        });

        await test.step("Paso 3: Quitar el producto", async () => {
          await cartPage.removeProduct("Sauce Labs Backpack");
          await expect.poll(() => cartPage.getItemCount()).toBe(0);
          await expect.poll(() => cartPage.isCartBadgeVisible()).toBe(false);
        });
      });

      test("Conservar productos al navegar entre inventario y carrito", async ({
        loggedInPage: inventoryPage,
        cartPage,
        page,
      }) => {
        await test.step("Paso 1: Agregar dos productos", async () => {
          await inventoryPage.addProductToCart("Sauce Labs Backpack");
          await inventoryPage.addProductToCart("Sauce Labs Bike Light");
          await expect(await inventoryPage.getCartBadgeText()).toBe("2");
        });

        await test.step("Paso 2: Verificar ambos productos en el carrito", async () => {
          await inventoryPage.openCart();
          await expect.poll(() => cartPage.getItemCount()).toBe(2);
          await expect(await cartPage.getItemNames()).toEqual([
            "Sauce Labs Backpack",
            "Sauce Labs Bike Light",
          ]);
        });

        await test.step("Paso 3: Volver al inventario", async () => {
          await cartPage.continueShopping();
          await expect(page).toHaveURL(/inventory.html/);
          await expect(await inventoryPage.getCartBadgeText()).toBe("2");
        });

        await test.step("Paso 4: Confirmar que los productos siguen en el carrito", async () => {
          await inventoryPage.openCart();
          await expect.poll(() => cartPage.getItemCount()).toBe(2);
          await expect(await cartPage.getItemNames()).toEqual([
            "Sauce Labs Backpack",
            "Sauce Labs Bike Light",
          ]);
        });
      });
    });

    // Suite para completar una compra.
    test.describe("Checkout", { tag: "@checkout" }, () => {
      test(
        "Completar la compra de dos productos",
        { tag: "@smoke" },
        async ({
          loggedInPage: inventoryPage,
          cartPage,
          checkoutInformationPage,
          checkoutOverviewPage,
          checkoutCompletePage,
          page,
        }) => {
          await test.step("Paso 1: Agregar dos productos al carrito", async () => {
            await inventoryPage.addProductToCart("Sauce Labs Backpack");
            await inventoryPage.addProductToCart("Sauce Labs Bike Light");
            await expect(await inventoryPage.getCartBadgeText()).toBe("2");
          });

          await test.step("Paso 2: Revisar el carrito y comenzar el checkout", async () => {
            await inventoryPage.openCart();
            await expect.poll(() => cartPage.getItemCount()).toBe(2);
            await expect(await cartPage.getItemNames()).toEqual([
              "Sauce Labs Backpack",
              "Sauce Labs Bike Light",
            ]);
            await cartPage.checkout();
            await expect(page).toHaveURL(/checkout-step-one.html/);
          });

          await test.step("Paso 3: Completar los datos del comprador", async () => {
            await checkoutInformationPage.fillData("Ada", "Lovelace", "12345");
            await expect(page).toHaveURL(/checkout-step-two.html/);
          });

          await test.step("Paso 4: Verificar productos y totales", async () => {
            expect(await checkoutOverviewPage.getItemCount()).toBe(2);
            expect(await checkoutOverviewPage.getSubtotal()).toBe("Item total: $39.98");
            expect(await checkoutOverviewPage.getTax()).toBe("Tax: $3.20");
            expect(await checkoutOverviewPage.getTotal()).toBe("Total: $43.18");
          });

          await test.step("Paso 5: Finalizar y validar la confirmación", async () => {
            await checkoutOverviewPage.finish();
            await expect(page).toHaveURL(/checkout-complete.html/);
            expect(await checkoutCompletePage.getCompleteHeaderText()).toBe(
              "Thank you for your order!",
            );
            expect(await checkoutCompletePage.isBackToHomeButtonVisible()).toBe(true);
            await checkoutCompletePage.backToHome();
            await expect(page).toHaveURL(/inventory.html/);
          });
        },
      );

      test(
        "Completar checkout y descargar el PDF de la orden",
        { tag: "@pdf" },
        async ({
          loggedInPage: inventoryPage,
          cartPage,
          checkoutInformationPage,
          checkoutOverviewPage,
          checkoutCompletePage,
          page,
        }) => {
          await test.step("Paso 1: Agregar un producto al carrito", async () => {
            await inventoryPage.addProductToCart("Sauce Labs Backpack");
            await expect(await inventoryPage.getCartBadgeText()).toBe("1");
          });

          await test.step("Paso 2: Abrir el carrito e iniciar el checkout", async () => {
            await inventoryPage.openCart();
            await expect(await cartPage.getItemNames()).toContain(
              "Sauce Labs Backpack",
            );
            await cartPage.checkout();
            await expect(page).toHaveURL(/checkout-step-one.html/);
          });

          await test.step("Paso 3: Completar los datos del comprador", async () => {
            await checkoutInformationPage.fillData("Ada", "Lovelace", "12345");
            await expect(page).toHaveURL(/checkout-step-two.html/);
          });

          await test.step("Paso 4: Confirmar el resumen de la orden", async () => {
            await expect(await checkoutOverviewPage.getItemNames()).toContain(
              "Sauce Labs Backpack",
            );
          });

          await test.step("Paso 5: Finalizar la compra", async () => {
            await checkoutOverviewPage.finish();
            await expect(page).toHaveURL(/checkout-complete.html/);
            await expect(await checkoutCompletePage.getCompleteHeaderText()).toBe(
              "Thank you for your order!",
            );
          });

          await test.step("Paso 6: Generar y validar el PDF descargado", async () => {
            await checkoutCompletePage.generatePDF();
          });
        },
      );
    });
  },
);
