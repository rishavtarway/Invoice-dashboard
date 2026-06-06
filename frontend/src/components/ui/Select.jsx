import { forwardRef, useId } from 'react';

const Select = forwardRef(function Select(
  { label, error, options = [], placeholder, className = '', id, children, ...rest },
  ref
) {
  const autoId = useId();
  const selectId = id || autoId;
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={selectId} className="text-xs font-medium text-inkSecondary">
          {label}
        </label>
      )}
      <select
        ref={ref}
        id={selectId}
        className={[
          'w-full appearance-none rounded-md border border-border bg-surface px-3 py-2 pr-8 text-sm text-ink',
          'focus:outline-none focus:ring-1 focus:ring-ink',
          'bg-[url("data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%2212%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%239B9690%22 stroke-width=%222%22><polyline points=%226 9 12 15 18 9%22/></svg>")] bg-no-repeat bg-[right_0.6rem_center]',
          error ? 'border-statusOverdue focus:ring-statusOverdue' : '',
          className,
        ].join(' ')}
        aria-invalid={!!error}
        {...rest}
      >
        {children ?? (
          <>
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) =>
              typeof opt === 'string' ? (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ) : (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              )
            )}
          </>
        )}
      </select>
      {error && <span className="text-xs text-statusOverdue">{error}</span>}
    </div>
  );
});

export default Select;
