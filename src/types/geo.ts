export type GeoOption = { code: string; name: string };

export type GeoStatus = "idle" | "loading" | "ready" | "error";

/** Anything that can answer the four location questions. Swap implementations in lib/geo/index.ts. */
export type GeoProvider = {
  regions: () => Promise<GeoOption[]>;
  provinces: (regionCode: string) => Promise<GeoOption[]>;
  municipalities: (scope: {
    region: string;
    province?: string;
  }) => Promise<GeoOption[]>;
  barangays: (municipalityCode: string) => Promise<GeoOption[]>;
};

/** A location resolved from the slugs in a sign-in URL. `province` is null for NCR and for province-free cities. */
export type ResolvedLocation = {
  region: GeoOption;
  province: GeoOption | null;
  municipality: GeoOption;
  barangay: GeoOption | null;
};
