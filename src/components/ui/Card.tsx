import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddingMap = {
  none: '',
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-6'
};

export function Card({ children, className = '', hover = false, padding = 'md' }: CardProps) {
  return (
    <div
      className={`bg-surface rounded-card border border-border shadow-sm ${
        hover ? 'hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 cursor-pointer' : ''
      } ${paddingMap[padding]} ${className}`}
    >
      {children}
    </div>
  );
}
