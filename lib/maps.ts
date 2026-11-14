"use client";

import { importLibrary, setOptions } from "@googlemaps/js-api-loader";

let configured = false;

export const MAP_ID =
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID || "DEMO_MAP_ID";

export function hasMapsKey() {
  return Boolean(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY);
}

export async function loadMapLibraries() {
  if (!configured) {
    setOptions({
      key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
      v: "weekly",
    });
    configured = true;
  }

  const [maps, marker] = await Promise.all([
    importLibrary("maps"),
    importLibrary("marker"),
  ]);

  return { maps, marker };
}
