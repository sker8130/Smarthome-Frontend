"use client";
import { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "danger";
};

export default function Button({ className = "", variant = "primary", ...rest }: Props) {
  const base = "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition";
  const styles =
    variant === "primary"
      ? "bg-[--primary] text-white hover:opacity-90"
      : variant === "danger"
      ? "bg-red-500 text-white hover:bg-red-600"
      : "border border-gray-200 hover:bg-gray-50";
  return <button className={`${base} ${styles} ${className}`} {...rest} />;
}
