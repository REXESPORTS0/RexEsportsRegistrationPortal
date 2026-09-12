import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'urgent' | 'live';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className = ''
}) => {
  const baseStyles = 'inline-flex items-center font-medium border rounded-md transition-colors';
  const sizeStyles = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  const variantStyles = {
    default: 'bg-surface-100 text-surface-700 border-surface-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200',
    urgent: 'bg-rose-100 text-rose-800 border-rose-300 font-semibold',
    live: 'bg-rose-600 text-white border-rose-700 animate-pulse font-semibold shadow-sm'
  };

  return (
    <span className={`${baseStyles} ${sizeStyles} ${variantStyles[variant]} ${className}`}>
      {children}
    </span>
  );
};

