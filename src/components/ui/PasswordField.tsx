"use client";

import { useState, type InputHTMLAttributes } from "react";
import { Icon } from "@/components/ui/Icon";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  id?: string;
};

// A plain `.field` with type="password" gave no way to confirm what you'd
// actually typed — easy to mistype invisibly, especially one-handed on a
// phone. One shared toggle button (eye / eye-off) covers every password
// input in the app (signup, login, change-password) instead of each form
// reimplementing its own show/hide state.
export function PasswordField({ id, className = "", style, ...rest }: Props) {
  const [visible, setVisible] = useState(false);

  return (
    <div style={{ position: "relative" }}>
      <input
        id={id}
        type={visible ? "text" : "password"}
        className={`field ${className}`}
        style={{ paddingRight: 44, ...style }}
        {...rest}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        style={{
          position: "absolute",
          right: 4,
          top: "50%",
          transform: "translateY(-50%)",
          width: 40,
          height: 40,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--text-tertiary)",
          background: "none",
          border: "none",
          cursor: "pointer",
        }}
      >
        <Icon name={visible ? "eye-off" : "eye"} size={20} />
      </button>
    </div>
  );
}
