"use client";

import { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost";
};

// Ports .btn / .btn-primary / .btn-ghost from the tested prototype 1:1.
export function Button({ variant = "primary", className = "", ...rest }: Props) {
  const variantClass = variant === "primary" ? "btn-primary" : "btn-ghost";
  return <button className={`btn ${variantClass} ${className}`} {...rest} />;
}
