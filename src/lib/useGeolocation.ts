"use client";

import { useEffect, useState } from "react";

export type GeoStatus = "idle" | "requesting" | "granted" | "denied" | "unavailable" | "unsupported";

// Ports requestGeolocation()/maybeRequestGeolocation() — fires once per
// mount (the real browser Geolocation API, no key required), tracking the
// same status values the prototype did.
export function useGeolocation() {
  const [status, setStatus] = useState<GeoStatus>("idle");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    // Deferred with setTimeout, same as the prototype's
    // maybeRequestGeolocation() — keeps the state update out of the effect's
    // own synchronous body.
    const t = setTimeout(() => {
      if (!("geolocation" in navigator)) {
        setStatus("unsupported");
        return;
      }
      setStatus("requesting");
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setStatus("granted");
        },
        (err) => {
          setStatus(err && err.code === 1 ? "denied" : "unavailable");
        },
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
      );
    }, 0);
    return () => clearTimeout(t);
  }, []);

  return { status, coords };
}
