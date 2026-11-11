/** Query strings for /api/geo. Also used as the client-side cache key. */
export const geoQuery = {
  regions: () => "level=regions",
  provinces: (region: string) => `level=provinces&region=${region}`,
  municipalities: (region: string, province?: string) =>
    `level=municipalities&region=${region}${province ? `&province=${province}` : ""}`,
  barangays: (municipality: string) => `level=barangays&municipality=${municipality}`,
};
