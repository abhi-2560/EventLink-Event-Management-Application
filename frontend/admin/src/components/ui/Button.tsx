import { cn } from '../../utils/helpers';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

const variants = {
  primary: 'bg-accent text-white hover:bg-accent-hover',
  secondary: 'bg-white text-slate-700 border border-border hover:bg-slate-50',
  danger: 'bg-danger text-white hover:bg-red-700',
  ghost: 'text-accent hover:bg-indigo-50',
};

const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2 text-sm', lg: 'px-5 py-2.5 text-sm' };

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children?: ReactNode;
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  loading?: boolean;
};

export default function Button({ children, variant = 'primary', size = 'md', className, loading = false, disabled = false, ...props }: ButtonProps) {
  return (
    <button
      className={cn('inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors disabled:opacity-50', variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />}
      {children}
    </button>
  );
}
