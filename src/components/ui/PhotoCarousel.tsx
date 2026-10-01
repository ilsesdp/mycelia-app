"use client";

import { useRef, useState } from "react";

export type CarouselPhoto = { id: string; url: string };

// Hero image for a market/farm/event page, now owner-uploadable (one or
// more photos) instead of the old static gradient "hero" block. With zero
// photos it falls back to that same gradient + decorative dots so an
// unfinished listing still looks intentional; with one photo it's a plain
// cover image; two or more get a swipeable, snap-scrolling strip with real
// position dots.
export function PhotoCarousel({ photos, height = 180 }: { photos: CarouselPhoto[]; height?: number }) {
  const [index, setIndex] = useState(0);
  const scrollerRef = useRef<HTMLDivElement>(null);

  if (photos.length === 0) {
    return (
      <div className="hero" style={{ height }}>
        <div className="hero-dots">
          <div className="d" style={{ width: 18 }} />
          <div className="d" style={{ width: 6 }} />
          <div className="d" style={{ width: 6 }} />
        </div>
      </div>
    );
  }

  if (photos.length === 1) {
    return (
      <div
        className="hero"
        style={{ height, backgroundImage: `url(${photos[0].url})`, backgroundSize: "cover", backgroundPosition: "center" }}
      />
    );
  }

  function handleScroll() {
    const el = scrollerRef.current;
    if (!el) return;
    setIndex(Math.round(el.scrollLeft / el.clientWidth));
  }

  return (
    <div style={{ position: "relative", height, flexShrink: 0, overflow: "hidden" }}>
      <div
        ref={scrollerRef}
        onScroll={handleScroll}
        style={{
          display: "flex",
          height: "100%",
          overflowX: "auto",
          scrollSnapType: "x mandatory",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {photos.map((p) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={p.id}
            src={p.url}
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover", flexShrink: 0, scrollSnapAlign: "start" }}
          />
        ))}
      </div>
      <div className="hero-dots" style={{ position: "absolute", left: 0, right: 0, top: "auto", bottom: 12, justifyContent: "center" }}>
        {photos.map((p, i) => (
          <div key={p.id} className="d" style={{ width: i === index ? 18 : 6, opacity: i === index ? 1 : 0.6 }} />
        ))}
      </div>
    </div>
  );
}
