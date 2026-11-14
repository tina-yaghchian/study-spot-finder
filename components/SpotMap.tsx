"use client";

import { useEffect, useRef, useState } from "react";
import { MapPinOff } from "lucide-react";
import { hasMapsKey, loadMapLibraries, MAP_ID } from "@/lib/maps";

export type MapSpot = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
};

type SpotMapProps = {
  spots: MapSpot[];
  /** Show an info window with a link to each spot's page when its pin is clicked. */
  linkToSpots?: boolean;
  className?: string;
};

export default function SpotMap({
  spots,
  linkToSpots = false,
  className = "h-80",
}: SpotMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    hasMapsKey() ? "loading" : "error"
  );

  // Rebuild the map only when the set of pins actually changes.
  const spotsKey = spots
    .map((s) => `${s.id}:${s.latitude}:${s.longitude}`)
    .join("|");

  useEffect(() => {
    if (!hasMapsKey() || !containerRef.current || spots.length === 0) return;

    let cancelled = false;
    const markers: google.maps.marker.AdvancedMarkerElement[] = [];

    loadMapLibraries()
      .then(({ maps, marker }) => {
        if (cancelled || !containerRef.current) return;

        const map = new maps.Map(containerRef.current, {
          center: { lat: spots[0].latitude, lng: spots[0].longitude },
          zoom: 16,
          mapId: MAP_ID,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
        });

        const infoWindow = new maps.InfoWindow();

        for (const spot of spots) {
          const glyph = new marker.PinElement({
            background: "#1e5f4f",
            borderColor: "#174c3f",
            glyphColor: "#ffffff",
          });

          const pin = new marker.AdvancedMarkerElement({
            map,
            position: { lat: spot.latitude, lng: spot.longitude },
            title: spot.name,
            content: glyph.element,
            gmpClickable: linkToSpots,
          });

          if (linkToSpots) {
            pin.addEventListener("gmp-click", () => {
              const link = document.createElement("a");
              link.href = `/study-spots/${spot.id}`;
              link.textContent = spot.name;
              link.style.fontWeight = "600";
              link.style.color = "#1e5f4f";
              infoWindow.setContent(link);
              infoWindow.open({ map, anchor: pin });
            });
          }

          markers.push(pin);
        }

        if (spots.length > 1) {
          const bounds = new google.maps.LatLngBounds();
          spots.forEach((s) =>
            bounds.extend({ lat: s.latitude, lng: s.longitude })
          );
          map.fitBounds(bounds, 48);
        }

        setStatus("ready");
      })
      .catch((error) => {
        console.error("Google Maps failed to load", error);
        if (!cancelled) setStatus("error");
      });

    return () => {
      cancelled = true;
      markers.forEach((m) => (m.map = null));
    };
    // spotsKey captures every value from `spots` the effect depends on.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spotsKey, linkToSpots]);

  if (status === "error" || spots.length === 0) {
    return (
      <div
        className={`${className} flex w-full flex-col items-center justify-center gap-2 rounded-md border border-dashed border-line-strong bg-canvas text-sm text-ink-muted`}
      >
        <MapPinOff className="size-5" aria-hidden />
        {spots.length === 0 ? "No locations to show" : "The map could not be loaded"}
      </div>
    );
  }

  return (
    <div className={`${className} relative w-full overflow-hidden rounded-md bg-canvas`}>
      <div ref={containerRef} className="absolute inset-0" />
      {status === "loading" && (
        <div className="absolute inset-0 animate-pulse bg-line/40" aria-hidden />
      )}
    </div>
  );
}
