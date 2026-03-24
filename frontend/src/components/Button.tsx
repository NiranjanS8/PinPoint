import type { ButtonHTMLAttributes, PropsWithChildren } from "react";

type ButtonVariant = "primary" | "ghost" | "danger";
type ButtonSize = "md" | "sm";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
}

export function Button({
  children,
  className = "",
  variant = "ghost",
  size = "md",
  fullWidth = false,
  type = "button",
  ...props
}: PropsWithChildren<ButtonProps>) {
  const classes = [
    "button",
    `button-${variant}`,
    `button-${size}`,
    fullWidth ? "button-full" : "",
    className
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button type={type} className={classes} {...props}>
      {children}
    </button>
  );
}
