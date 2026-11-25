/**
 * Credenciales de SauceDemo centralizadas en un solo módulo.
 * Son usuarios públicos de demo; si cambian, se actualizan solo acá.
 */
export interface SauceCredentials {
  username: string;
  password: string;
}

export const SAUCE_PASSWORD = "secret_sauce";

export const STANDARD_USER: SauceCredentials = {
  username: "standard_user",
  password: SAUCE_PASSWORD,
};

export const LOCKED_OUT_USER: SauceCredentials = {
  username: "locked_out_user",
  password: SAUCE_PASSWORD,
};
