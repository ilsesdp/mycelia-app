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

export type IconName =
  | "pin"
  | "cam"
  | "directions"
  | "msg"
  | "search"
  | "lock"
  | "shield"
  | "basket"
  | "clock"
  | "close"
  | "pencil"
  | "bell"
  | "user"
  | "help"
  | "info"
  | "eye"
  | "eye-off"
  | "gear"
  | "calendar"
  | "facebook"
  | "instagram"
  | "website"
  | "sun"
  | "filter"
  | "menu"
  | "map"
  | "check"
  | "store"
  | "mail"
  | "phone"
  | "calendar-range"
  | "date-checklist";

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
    case "shield":
      return (
        <svg {...props}>
          <path d="M12 3.5 5 6v5.5c0 4.6 3 8 7 9 4-1 7-4.4 7-9V6l-7-2.5Z" />
          <path d="m9 12 2 2 4-4.2" />
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
    case "pencil":
      return (
        <svg {...props}>
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
        </svg>
      );
    case "bell":
      return (
        <svg {...props}>
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.7 21a2 2 0 0 1-3.4 0" />
        </svg>
      );
    case "user":
      return (
        <svg {...props}>
          <circle cx="12" cy="8" r="3.6" />
          <path d="M4.5 20c1.2-4 4-6 7.5-6s6.3 2 7.5 6" />
        </svg>
      );
    case "help":
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="9" />
          <path d="M9.2 9a2.8 2.8 0 1 1 3.9 2.6c-.9.4-1.6 1-1.6 2.1v.4" />
          <circle cx="12" cy="17.2" r="0.9" fill="currentColor" stroke="none" />
        </svg>
      );
    case "info":
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 11v5" />
          <circle cx="12" cy="7.6" r="1" fill="currentColor" stroke="none" />
        </svg>
      );
    case "eye":
      return (
        <svg {...props}>
          <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      );
    case "eye-off":
      return (
        <svg {...props}>
          <path d="M3 3l18 18" />
          <path d="M10.6 5.2A10.6 10.6 0 0 1 12 5c6.4 0 10 7 10 7a17.7 17.7 0 0 1-3.6 4.6M6.5 6.6C3.6 8.4 2 12 2 12s3.6 7 10 7c1.4 0 2.6-.3 3.7-.8" />
          <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
        </svg>
      );
    case "gear":
      return (
        <svg {...props}>
          <path d="M22 12 18.93 14.87 19.07 19.07 14.87 18.93 12 22 9.13 18.93 4.93 19.07 5.07 14.87 2 12 5.07 9.13 4.93 4.93 9.13 5.07 12 2 14.87 5.07 19.07 4.93 18.93 9.13Z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      );
    case "calendar":
      return (
        <svg {...props}>
          <rect x="3.5" y="5.5" width="17" height="15" rx="2" />
          <path d="M3.5 10h17M8 3.5v4M16 3.5v4" />
        </svg>
      );
    case "facebook":
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="9" />
          <path d="M14 16.5v-5h2l.4-2.4H14v-1.5c0-.7.3-1.2 1.3-1.2H16.5V4c-.3 0-1.2-.1-2.1-.1-2.1 0-3.5 1.3-3.5 3.6v1.6H9v2.4h1.9v5" />
        </svg>
      );
    case "instagram":
      return (
        <svg {...props}>
          <rect x="4" y="4" width="16" height="16" rx="5" />
          <circle cx="12" cy="12" r="3.4" />
          <circle cx="16.3" cy="7.7" r="0.6" fill="currentColor" stroke="none" />
        </svg>
      );
    case "website":
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3a15.3 15.3 0 0 1 0 18M12 3a15.3 15.3 0 0 0 0 18" />
        </svg>
      );
    case "sun":
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="4.2" />
          <path d="M12 2.8v2.6M12 18.6v2.6M4.2 4.2l1.8 1.8M18 18l1.8 1.8M2.8 12h2.6M18.6 12h2.6M4.2 19.8 6 18M18 6l1.8-1.8" />
        </svg>
      );
    case "filter":
      return (
        <svg {...props}>
          <path d="M4 6h16l-7 8v5h-2v-5L4 6Z" />
        </svg>
      );
    case "menu":
      return (
        <svg {...props}>
          <path d="M4 6.5h16M4 12h16M4 17.5h16" />
        </svg>
      );
    case "map":
      return (
        <svg {...props}>
          <path d="M9 4.5 4 6.3v13.2l5-1.8 6 1.8 5-1.8V5.5l-5 1.8-6-1.8Z" />
          <path d="M9 4.5v13.2M15 7.3v13.2" />
        </svg>
      );
    case "check":
      return (
        <svg {...props}>
          <path d="M5 12.5 10 17.5 19 7" />
        </svg>
      );
    case "store":
      return (
        <svg {...props}>
          <path d="M4 4.5h16l1.5 5a2.2 2.2 0 0 1-4.3.8 2.2 2.2 0 0 1-4.2 0 2.2 2.2 0 0 1-4.2 0 2.2 2.2 0 0 1-4.3-.8Z" />
          <path d="M5.5 10.3V19a1 1 0 0 0 1 1H10v-5.5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1V20h3.5a1 1 0 0 0 1-1v-8.7" />
        </svg>
      );
    case "mail":
      return (
        <svg {...props}>
          <rect x="3.5" y="5.5" width="17" height="13" rx="2" />
          <path d="m4.5 7 7.5 6 7.5-6" />
        </svg>
      );
    case "phone":
      return (
        <svg {...props}>
          <path d="M6.6 3.5h3l1.4 4.2-2 1.6a13 13 0 0 0 5.7 5.7l1.6-2 4.2 1.4v3a1.5 1.5 0 0 1-1.6 1.5A16.5 16.5 0 0 1 5.1 5.1a1.5 1.5 0 0 1 1.5-1.6Z" />
        </svg>
      );
    case "calendar-range":
      return (
        <svg {...props}>
          <rect x="3.5" y="5.5" width="17" height="15" rx="2" />
          <path d="M3.5 10h17M8 3.5v4M16 3.5v4M7 15h3M14 15h3" />
        </svg>
      );
    case "date-checklist":
      return (
        <svg {...props}>
          <rect x="3.5" y="4" width="6" height="6" rx="1.5" />
          <path d="m5 7 1 1 2-2" />
          <rect x="3.5" y="14" width="6" height="6" rx="1.5" />
          <path d="m5 17 1 1 2-2" />
          <path d="M12.5 7h8M12.5 17h8" />
        </svg>
      );
  }
}
