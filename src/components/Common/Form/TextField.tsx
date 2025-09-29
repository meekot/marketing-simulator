import type { InputHTMLAttributes } from 'react';
import classNames from 'classnames';

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  helperText?: string;
  error?: string;
}

export const TextField = ({
  label,
  helperText,
  error,
  className,
  ...rest
}: TextFieldProps) => (
  <label className="flex w-full flex-col gap-1 text-sm text-slate-600">
    <span className="font-medium text-slate-700">{label}</span>
    <input
      className={classNames(
        'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-700 shadow-sm transition focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200',
        error && 'border-red-400 focus:ring-red-200',
        className
      )}
      {...rest}
    />
    {error ? (
      <span className="text-xs text-red-500">{error}</span>
    ) : (
      helperText && <span className="text-xs text-slate-400">{helperText}</span>
    )}
  </label>
);

export default TextField;
