/**
 * Punto de entrada de los fixtures de SauceDemo.
 * Los specs importan desde acá en lugar de "@playwright/test":
 *   import { test, expect } from "../../fixtures/saucedemo";
 */
export { test } from "./auth.fixture";
export { expect } from "@playwright/test";
