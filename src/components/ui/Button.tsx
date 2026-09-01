import type { ReactNode, ButtonHTMLAttributes, AnchorHTMLAttributes } from 'react';

type Variant = 'primary' | 'outline' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface BaseProps {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
  className?: string;
  loading?: boolean;
}

type ButtonProps = BaseProps &
  ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };
type AnchorProps = BaseProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

type Props = ButtonProps | AnchorProps;

function classNames(
  variant: Variant,
  size: Size,
  loading: boolean,
  extra: string
) {
  const base =
    'inline-flex items-center justify-center gap-2 font-semibold rounded-btn transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants: Record<Variant, string> = {
    primary:
      'bg-primary text-white hover:bg-primary-dark active:scale-[0.98] shadow-sm hover:shadow-md',
    outline:
      'border-2 border-primary text-primary hover:bg-primary hover:text-white active:scale-[0.98]',
    ghost:
      'text-text-secondary hover:text-secondary hover:bg-background active:scale-[0.98]',
    danger:
      'bg-error text-white hover:bg-red-700 active:scale-[0.98]'
  };

  const sizes: Record<Size, string> = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  return [base, variants[variant], sizes[size], loading ? 'cursor-wait' : '', extra]
    .filter(Boolean)
    .join(' ');
}

export function Button({ variant = 'primary', size = 'md', loading, children, ...rest }: Props) {
  const cls = classNames(variant, size, !!loading, (rest as { className?: string }).className ?? '');

  if ('href' in rest && rest.href !== undefined) {
    const { href, ...anchorRest } = rest as AnchorProps;
    return (
      <a href={href} {...anchorRest} className={cls}>
        {loading ? (
          <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : null}
        {children}
      </a>
    );
  }

  const { ...btnRest } = rest as ButtonProps;
  return (
    <button {...btnRest} disabled={loading || rest.disabled} className={cls}>
      {loading ? (
        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24" aria-hidden="true">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : null}
      {children}
    </button>
  );
}
