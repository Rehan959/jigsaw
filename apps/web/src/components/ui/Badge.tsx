import { HTMLAttributes, forwardRef } from "react";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "error" | "primary";
  size?: "sm" | "md";
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className = "", variant = "default", size = "sm", children, ...props }, ref) => {
    const baseStyles = "inline-flex items-center font-medium rounded-full";

    const variants = {
      default: "bg-bg-elevated text-text-secondary",
      success: "badge-success",
      warning: "badge-warning",
      error: "badge-error",
      primary: "badge-primary",
    };

    const sizes = {
      sm: "px-2 py-0.5 text-xs",
      md: "px-2.5 py-1 text-sm",
    };

    return (
      <span
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = "Badge";

export default Badge;
