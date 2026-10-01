// Ports icon() + the handful of ICON_PATHS this screen group actually uses.
const SHARED = {
  width: undefined as number | undefined,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function Icon({ name, size = 20 }: { name: "pin" | "cam" | "directions" | "msg"; size?: number }) {
  const props = { ...SHARED, width: size, height: size };
  switch (name) {
    case "pin":
      return (
        <svg {...props}>
          <path d="M12 21s-7-7.2-7-12a7 7 0 0 1 14 0c0 4.8-7 12-7 12Z" />
          <circle cx="12" cy="9" r="2.3" />
        </svg>
      );
    case "cam":
      return (
        <svg {...props}>
          <path d="M4 8a2 2 0 0 1 2-2h1.4l1-1.7h7.2l1 1.7H18a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z" />
          <circle cx="12" cy="13" r="3.3" />
        </svg>
      );
    case "directions":
      return (
        <svg {...props}>
          <path d="M12 2 4 20l8-4 8 4-8-18Z" />
        </svg>
      );
    case "msg":
      return (
        <svg {...props}>
          <path d="M4 5.5h16a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H9l-4.2 3.2A.5.5 0 0 1 4 19.3V6.5a1 1 0 0 1 1-1z" />
        </svg>
      );
  }
}
