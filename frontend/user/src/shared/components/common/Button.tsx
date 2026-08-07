import { cn } from '@shared/lib/cn';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

const variants = {
  primary: 'bg-brand-600 text-white hover:bg-brand-700 shadow-sm',
  secondary: 'bg-white text-gray-900 border border-border hover:bg-gray-50',
  danger: 'bg-danger text-white hover:bg-red-700',
  ghost: 'text-brand-600 hover:bg-brand-50',
  success: 'bg-success text-white hover:bg-emerald-700',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  loading?: boolean;
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className,
  loading = false,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
        variants[variant],
        sizes[size],
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </button>
  );
}
