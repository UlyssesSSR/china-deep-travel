interface PointsChipProps {
  points: number;
  className?: string;
  size?: 'sm' | 'md';
}

export function PointsChip({ points, className = '', size = 'md' }: PointsChipProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 bg-gold/10 border border-gold/30 rounded-full font-semibold text-secondary ${size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'} ${className}`}
    >
      🪙{' '}
      <span className="text-accent font-bold">{points.toLocaleString()}</span>
      <span className="text-text-muted font-normal">pts</span>
    </span>
  );
}
