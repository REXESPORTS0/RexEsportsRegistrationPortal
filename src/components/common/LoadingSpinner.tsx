import React from 'react';

export const LoadingSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg'; text?: string }> = ({
  size = 'md',
  text
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4'
  };

  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div className={`${sizeClasses[size]} border-brand-200 border-t-brand-600 rounded-full animate-spin mb-2`}></div>
      {text && <p className="text-xs text-surface-500 font-medium">{text}</p>}
    </div>
  );
};

