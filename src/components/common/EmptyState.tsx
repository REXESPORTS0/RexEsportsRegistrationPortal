import React from 'react';
import { LucideIcon, Inbox } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Inbox,
  title,
  description,
  actionLabel,
  onAction
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 md:p-12 text-center bg-white border border-surface-200 rounded-xl shadow-subtle my-4">
      <div className="w-12 h-12 rounded-full bg-surface-100 flex items-center justify-center text-surface-500 mb-4">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-base font-semibold text-surface-900 mb-1">{title}</h3>
      <p className="text-sm text-surface-500 max-w-sm mb-6 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-700 transition-colors shadow-sm"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

