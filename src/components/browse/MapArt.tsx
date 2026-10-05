"use client";

import type { CSSProperties } from "react";
import { useGeolocation } from "@/lib/useGeolocation";
import { pinImageSrc, pinState, youPinImageSrc, type PinKind } from "@/lib/mapPins";
import { farmTodayStatus, type HourRow, type TodayStatus } from "@/lib/farmStatus";

export type MapPin = {
  id: string;
  kind: PinKind;
  name: string;
  // Raw hours + manual override, not a precomputed open/closedEarly — the
  // farm's own stored timezone (farms.timezone) is passed down too, so
  // farmTodayStatus() below gives the exact answer for that farm regardless
  // of where it's computed or who's viewing.
  hours: HourRow[];
  todayStatus: TodayStatus;
  timezone: string;
  xPct: number;
  yPct: number;
};

export type OwnFarmMarker = {
  name: string;
  hours: HourRow[];
  todayStatus: TodayStatus;
  timezone: string;
};

// Ports mapArt() + youAreHereLabel(). Same stylized illustration (gradient
// wash + a few road lines/labels — real vector terrain/roads were never
// reproduced, by design: effort goes into the real UI on top instead) and
// the same fixed "you are here" marker position, since it's illustrative,
// not tied to real device coordinates — only the label text/link reacts to
// what the browser actually reports. When the signed-in visitor owns a
// published farm, this marker IS that farm — it's where they already are,
// not a second pin to go find — so the label shows the farm's name and a
// link to My Farm instead of the generic geolocation label.
export function MapArt({
  pins,
  onPinTap,
  ownFarm,
}: {
  pins: MapPin[];
  onPinTap: (pin: MapPin) => void;
  ownFarm: OwnFarmMarker | null;
}) {
  const { status, coords } = useGeolocation();
  const ownFarmStatus = ownFarm ? farmTodayStatus(ownFarm.hours, ownFarm.todayStatus, ownFarm.timezone) : null;

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
        <text x="16" y="330" fontSize="13" fill="var(--text-tertiary)">
          County Line Rd
        </text>
        <text x="205" y="575" fontSize="13" fill="var(--text-tertiary)">
          Willow Creek Rd
        </text>
        <text x="310" y="20" fontSize="13" fill="var(--text-tertiary)">
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
      {ownFarm ? (
        // Your own farm's marker: same icon-above-name layout as every other
        // pin (see pins.map below) instead of a separate "This is your farm"
        // callout — it's just another pin now, one that happens to be you.
        <div
          style={{
            position: "absolute",
            left: "49.9%",
            top: "40.4%",
            transform: "translateX(-50%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={youPinImageSrc(pinState("farm", ownFarmStatus!.open, ownFarmStatus!.closedEarly))}
            alt=""
            width={51}
            height={58}
            style={{ display: "block", filter: "drop-shadow(0 2px 3px rgba(0,0,0,.3))" }}
          />
          <div
            style={{
              marginTop: 4,
              background: "var(--bg-raised)",
              border: "1px solid var(--border-subtle)",
              borderRadius: 8,
              padding: "4px 8px",
              whiteSpace: "nowrap",
            }}
          >
            <span className="body-s-strong">{ownFarm.name}</span>
          </div>
        </div>
      ) : (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/pins/pin-you-open.svg"
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
        </>
      )}

      {pins.map((p) => {
        const pStatus = farmTodayStatus(p.hours, p.todayStatus, p.timezone);
        const state = pinState(p.kind, pStatus.open, pStatus.closedEarly);
        // Label anchoring: the pin icon always stays centered on its own
        // (xPct, yPct) point, but the name label used to be centered under
        // it too — on a pin near either edge (pinPosition keeps xPct within
        // [12, 82], so this does happen) a longer name overflowed straight
        // off the visible map with no way to pan back to it. Past those
        // same two thresholds the label instead anchors by its near edge
        // (grows away from the screen edge rather than away from the pin),
        // and a maxWidth + ellipsis is a hard backstop for any name long
        // enough to still not fit.
        const edge = p.xPct < 20 ? "left" : p.xPct > 80 ? "right" : "center";
        const labelStyle: CSSProperties =
          edge === "left"
            ? { left: 0, transform: "none" }
            : edge === "right"
              ? { left: 0, transform: "translateX(-100%)" }
              : { left: 0, transform: "translateX(-50%)" };
        return (
          <div
            key={p.id}
            onClick={() => onPinTap(p)}
            style={{
              position: "absolute",
              left: `${p.xPct}%`,
              top: `${p.yPct}%`,
              width: 0,
              height: 0,
              cursor: "pointer",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={pinImageSrc(p.kind, state)}
              alt=""
              width={40}
              height={40}
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                width: 40,
                height: 40,
                // Tailwind's preflight sets `img { max-width: 100% }`, which
                // for an absolutely-positioned image resolves against its
                // containing block — here the 0×0 pin anchor div below, so
                // without this override the pin collapsed to 0×0 and
                // silently vanished (the label alone stayed visible).
                maxWidth: "none",
                transform: "translate(-50%,-100%)",
                display: "block",
              }}
            />
            <div
              style={{
                position: "absolute",
                top: 4,
                ...labelStyle,
                maxWidth: 160,
                background: "var(--bg-raised)",
                border: "1px solid var(--border-subtle)",
                borderRadius: 8,
                padding: "4px 8px",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
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

// Only renders for a visitor with no published farm of their own — the
// owned-farm case is handled inline above, as a regular pin.
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
          background: "var(--bg-raised)",
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
        background: "var(--bg-raised)",
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
