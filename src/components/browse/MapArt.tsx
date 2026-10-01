"use client";

import { useGeolocation } from "@/lib/useGeolocation";
import { pinImageSrc, pinState, type PinKind } from "@/lib/mapPins";

export type MapPin = {
  id: string;
  kind: PinKind;
  name: string;
  open: boolean;
  closedEarly: boolean;
  xPct: number;
  yPct: number;
};

// Ports mapArt() + youAreHereLabel(). Same stylized illustration (gradient
// wash + a few road lines/labels — real vector terrain/roads were never
// reproduced, by design: effort goes into the real UI on top instead) and
// the same fixed "you are here" marker position, since it's illustrative,
// not tied to real device coordinates — only the label text/link reacts to
// what the browser actually reports.
export function MapArt({ pins, onPinTap }: { pins: MapPin[]; onPinTap: (pin: MapPin) => void }) {
  const { status, coords } = useGeolocation();

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "linear-gradient(160deg,#dcead0 0%,#c9dfb8 40%,#b9d6ad 100%)",
        overflow: "hidden",
      }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 402 769"
        preserveAspectRatio="xMidYMid slice"
        style={{ position: "absolute", inset: 0, opacity: 0.5 }}
      >
        <path d="M0,120 C80,100 140,180 220,150 S 360,90 402,140" stroke="#a9c493" strokeWidth="10" fill="none" />
        <path d="M0,300 C100,280 160,360 260,330 S 380,260 402,320" stroke="#a9c493" strokeWidth="8" fill="none" />
        <path d="M40,0 C60,120 20,240 60,769" stroke="#bcd2a6" strokeWidth="6" fill="none" />
        <text x="16" y="330" fontSize="13" fill="#696158">
          County Line Rd
        </text>
        <text x="205" y="575" fontSize="13" fill="#696158">
          Willow Creek Rd
        </text>
        <text x="310" y="20" fontSize="13" fill="#696158">
          Rt 20
        </text>
      </svg>

      {/* "You are here" — fixed on the illustration (no real coordinate
          system to place it in); only the label below reacts to geolocation. */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "47.9%",
          width: 92,
          height: 92,
          borderRadius: "50%",
          background: "rgba(71,146,210,.15)",
          transform: "translate(-50%,-50%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "47.9%",
          width: 62,
          height: 62,
          borderRadius: "50%",
          background: "rgba(71,146,210,.25)",
          transform: "translate(-50%,-50%)",
        }}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/pins/pin-here.png"
        alt=""
        style={{
          position: "absolute",
          left: "49.9%",
          top: "40.4%",
          width: 51,
          height: 58,
          transform: "translateX(-50%)",
          filter: "drop-shadow(0 2px 3px rgba(0,0,0,.3))",
        }}
      />
      <YouAreHereLabel status={status} coords={coords} />

      {pins.map((p) => {
        const state = pinState(p.kind, p.open, p.closedEarly);
        return (
          <div
            key={p.id}
            onClick={() => onPinTap(p)}
            style={{
              position: "absolute",
              left: `${p.xPct}%`,
              top: `${p.yPct}%`,
              transform: "translate(-50%,-100%)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              cursor: "pointer",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={pinImageSrc(p.kind, state)} alt="" width={40} height={40} style={{ display: "block" }} />
            <div
              style={{
                marginTop: 4,
                background: "#fff",
                border: "1px solid var(--border-subtle)",
                borderRadius: 8,
                padding: "4px 8px",
                whiteSpace: "nowrap",
                pointerEvents: "none",
              }}
            >
              <span className="body-s-strong">{p.name}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function YouAreHereLabel({
  status,
  coords,
}: {
  status: ReturnType<typeof useGeolocation>["status"];
  coords: { lat: number; lng: number } | null;
}) {
  if (status === "granted" && coords) {
    return (
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "47.3%",
          transform: "translateX(-50%)",
          width: 150,
          background: "#fff",
          border: "1px solid var(--border-subtle)",
          borderRadius: 8,
          padding: "6px 8px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
        }}
      >
        <span className="body-s-strong">You are here</span>
        <a
          style={{ fontSize: 11, color: "var(--text-link)", cursor: "pointer" }}
          onClick={() =>
            window.open(`https://www.google.com/maps/search/?api=1&query=${coords.lat},${coords.lng}`, "_blank", "noopener")
          }
        >
          Open in Google Maps
        </a>
      </div>
    );
  }
  // Every other status ('idle', 'requesting', 'denied', 'unavailable',
  // 'unsupported') renders this identical plain label — an explicit, already
  // confirmed product decision: no permission/denied messaging ever shows on
  // the map itself, regardless of what geolocation actually reports.
  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: "47.3%",
        transform: "translateX(-50%)",
        width: 130,
        height: 26,
        background: "#fff",
        border: "1px solid var(--border-subtle)",
        borderRadius: 8,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <span className="body-s-strong">You are here</span>
    </div>
  );
}
