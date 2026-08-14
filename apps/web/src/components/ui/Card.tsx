import { HTMLAttributes, forwardRef } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "static" | "interactive";
  padding?: "none" | "sm" | "md" | "lg";
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className = "", variant = "default", padding = "md", children, ...props }, ref) => {
    const baseStyles = "rounded-2xl transition-all duration-300";

    const variants = {
      default: "glass-card",
      static: "glass-card-static",
      interactive: "glass-card hover:border-primary/40 group",
    };

    const paddings = {
      none: "",
      sm: "p-4",
      md: "p-6",
      lg: "p-8",
    };

    return (
      <div
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${paddings[padding]} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

export default Card;
