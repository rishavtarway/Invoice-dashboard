import { forwardRef, useId } from 'react';

const Input = forwardRef(function Input(
  { label, error, className = '', id, type = 'text', ...rest },
  ref
) {
  const autoId = useId();
  const inputId = id || autoId;
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={inputId} className="text-xs font-medium text-inkSecondary">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        type={type}
        className={[
          'w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted',
          'focus:outline-none focus:ring-1 focus:ring-ink',
          error ? 'border-statusOverdue focus:ring-statusOverdue' : '',
          className,
        ].join(' ')}
        aria-invalid={!!error}
        {...rest}
      />
      {error && <span className="text-xs text-statusOverdue">{error}</span>}
    </div>
  );
});

export default Input;
