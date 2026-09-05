"use client";

import { useEffect, useRef } from "react";
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";

let mapsConfigured = false;

type MapProps = {
  latitude: number;
  longitude: number;
};

export default function Map({ latitude, longitude }: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadMap() {
      if (!mapRef.current) return;

        if (!mapsConfigured) {
        setOptions({
            key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
            v: "weekly",
        });

        mapsConfigured = true;
        }
      const { Map } = await importLibrary("maps");
      const { AdvancedMarkerElement } = await importLibrary("marker");

        const map = new Map(mapRef.current, {
        center: {
            lat: latitude,
            lng: longitude,
        },
        zoom: 16,
        mapId: "DEMO_MAP_ID",
        });

      new AdvancedMarkerElement({
  map,
  position: {
    lat: latitude,
    lng: longitude,
  },
});
    }

    loadMap();
  }, [latitude, longitude]);

  return (
    <div
      ref={mapRef}
      className="h-80 w-full rounded-xl"
    />
  );
}