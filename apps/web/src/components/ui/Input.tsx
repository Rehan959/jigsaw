import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", label, error, hint, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-text-secondary">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`input-base ${error ? "border-error focus:border-error focus:ring-error/30" : ""} ${className}`}
          {...props}
        />
        {error && (
          <p className="text-sm text-error">{error}</p>
        )}
        {hint && !error && (
          <p className="text-sm text-text-muted">{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
