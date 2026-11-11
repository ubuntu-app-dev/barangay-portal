import { psaProvider } from "./psa";
import { psgcProvider } from "./psgc";
import type { GeoProvider } from "@/types/geo";

/**
 * With PSA_PSGC_TOKEN set (server environment), the official PSA API is used.
 * Without it, the free PSGC API is used. A bad token fails loudly instead of falling back.
 */
export function getGeoProvider(): GeoProvider {
  return process.env.PSA_PSGC_TOKEN ? psaProvider : psgcProvider;
}
