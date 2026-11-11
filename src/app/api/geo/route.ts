import { NextResponse } from "next/server";
import { getGeoProvider } from "@/lib/geo";
import type { GeoOption } from "@/types/geo";

const CODE = /^\d{9,10}$/;
const CACHE = "public, s-maxage=86400, stale-while-revalidate=604800";
const isCode = (value: string | null): value is string =>
  value !== null && CODE.test(value);
const bad = (message: string) =>
  NextResponse.json({ message }, { status: 400 });

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const level = searchParams.get("level");
  const region = searchParams.get("region");
  const province = searchParams.get("province");
  const municipality = searchParams.get("municipality");
  const geoProvider = getGeoProvider();

  try {
    let data: GeoOption[];
    switch (level) {
      case "regions":
        data = await geoProvider.regions();
        break;
      case "provinces":
        if (!isCode(region)) return bad("Invalid region.");
        data = await geoProvider.provinces(region);
        break;
      case "municipalities":
        if (!isCode(region)) return bad("Invalid region.");
        if (province !== null && !isCode(province))
          return bad("Invalid province.");
        data = await geoProvider.municipalities({
          region,
          province: province ?? undefined,
        });
        break;
      case "barangays":
        if (!isCode(municipality)) return bad("Invalid municipality.");
        data = await geoProvider.barangays(municipality);
        break;
      default:
        return bad("Unknown level.");
    }
    return NextResponse.json(data, { headers: { "Cache-Control": CACHE } });
  } catch (error) {
    console.error(
      "[api/geo]",
      error instanceof Error ? error.message : "unknown error",
    );
    return NextResponse.json(
      { message: "The location service is unavailable. Try again." },
      { status: 502 },
    );
  }
}
