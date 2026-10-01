// Ports icon() + the ICON_PATHS entries this app actually uses, as one
// shared component (previously split off as farm/Icon.tsx when only the
// farm-profile group needed it; Filters and Messages need a few more of
// the same set, so it lives under ui/ now).
const SHARED = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export type IconName = "pin" | "cam" | "directions" | "msg" | "search" | "lock" | "basket" | "clock" | "close";

export function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
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
    case "search":
      return (
        <svg {...props}>
          <circle cx="10.5" cy="10.5" r="6.5" />
          <path d="m20 20-4.8-4.8" />
        </svg>
      );
    case "lock":
      return (
        <svg {...props}>
          <rect x="5" y="10.5" width="14" height="9" rx="2" />
          <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
        </svg>
      );
    case "basket":
      return (
        <svg {...props}>
          <path d="M4 9h16l-1.4 9.5A2 2 0 0 1 16.6 20H7.4a2 2 0 0 1-2-1.5L4 9Z" />
          <path d="M9 9V7a3 3 0 0 1 6 0v2" />
        </svg>
      );
    case "clock":
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7.2V12l3.3 2" />
        </svg>
      );
    case "close":
      return (
        <svg {...props}>
          <path d="M6 6l12 12M18 6 6 18" />
        </svg>
      );
  }
}
