import type { ButtonHTMLAttributes, PropsWithChildren, ReactNode } from 'react';
import classNames from 'classnames';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  loading?: boolean;
}

const baseClasses =
  'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60 disabled:cursor-not-allowed';

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-brand-500 text-white hover:bg-brand-600 focus-visible:outline-brand-500 shadow-card shadow-brand-500/20',
  secondary:
    'bg-white text-brand-700 hover:bg-slate-100 border border-slate-200 focus-visible:outline-brand-400',
  ghost:
    'bg-transparent text-brand-500 hover:bg-brand-500/10 focus-visible:outline-brand-400',
  danger:
    'bg-red-500 text-white hover:bg-red-600 focus-visible:outline-red-400',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'text-sm px-3 py-1.5',
  md: 'text-sm px-4 py-2',
  lg: 'text-base px-5 py-2.5',
};

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  iconLeft,
  iconRight,
  loading,
  className,
  ...rest
}: PropsWithChildren<ButtonProps>) => (
  <button
    className={classNames(
      baseClasses,
      variantClasses[variant],
      sizeClasses[size],
      className
    )}
    {...rest}
  >
    {loading && (
      <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-b-transparent" />
    )}
    {!loading && iconLeft}
    <span>{children}</span>
    {iconRight}
  </button>
);

export default Button;
