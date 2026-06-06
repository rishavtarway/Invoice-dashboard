import { forwardRef } from 'react';

const VARIANTS = {
  primary:
    'bg-ink text-white border border-ink hover:bg-accentHover disabled:opacity-50 disabled:cursor-not-allowed',
  ghost:
    'bg-transparent text-ink border border-border hover:bg-canvas disabled:opacity-50 disabled:cursor-not-allowed',
  danger:
    'bg-statusOverdue text-white border border-statusOverdue hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed',
  dangerGhost:
    'bg-transparent text-statusOverdue border border-statusOverdue hover:bg-statusOverdueBg disabled:opacity-50 disabled:cursor-not-allowed',
};

const SIZES = {
  sm: 'h-8 px-2.5 text-xs',
  md: 'h-9 px-3 text-sm',
  lg: 'h-10 px-4 text-sm',
};

const Button = forwardRef(function Button(
  {
    variant = 'primary',
    size = 'md',
    className = '',
    type = 'button',
    children,
    ...rest
  },
  ref
) {
  const classes = [
    'inline-flex items-center justify-center gap-1.5 rounded-md font-medium transition-colors',
    'focus:outline-none focus:ring-1 focus:ring-ink focus:ring-offset-1 focus:ring-offset-canvas',
    VARIANTS[variant] || VARIANTS.primary,
    SIZES[size] || SIZES.md,
    className,
  ].join(' ');

  return (
    <button ref={ref} type={type} className={classes} {...rest}>
      {children}
    </button>
  );
});

export default Button;
