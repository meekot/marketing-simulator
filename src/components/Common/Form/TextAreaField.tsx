import type { TextareaHTMLAttributes } from 'react';
import classNames from 'classnames';

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  helperText?: string;
}

export const TextAreaField = ({
  label,
  helperText,
  className,
  ...rest
}: TextAreaProps) => (
  <label className="flex w-full flex-col gap-1 text-sm text-slate-600">
    <span className="font-medium text-slate-700">{label}</span>
    <textarea
      className={classNames(
        'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-700 shadow-sm transition focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200',
        className
      )}
      rows={4}
      {...rest}
    />
    {helperText && <span className="text-xs text-slate-400">{helperText}</span>}
  </label>
);

export default TextAreaField;
