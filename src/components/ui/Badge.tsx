type Variant = 'default' | 'accent' | 'success' | 'warning' | 'error' | 'gold';

interface BadgeProps {
  children: React.ReactNode;
  variant?: Variant;
  icon?: string;
  className?: string;
}

const variantStyles: Record<Variant, string> = {
  default: 'bg-surface border border-border text-text-secondary',
  accent: 'bg-accent/10 border border-accent/30 text-accent',
  success: 'bg-success/10 border border-success/30 text-success',
  warning: 'bg-warning/10 border border-warning/30 text-warning',
  error: 'bg-error/10 border border-error/30 text-error',
  gold: 'bg-gold/10 border border-gold/30 text-accent'
};

export function Badge({ children, variant = 'default', icon, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${variantStyles[variant]} ${className}`}
    >
      {icon ? <span aria-hidden="true">{icon}</span> : null}
      {children}
    </span>
  );
}
