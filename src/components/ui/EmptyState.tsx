import React from 'react';
import { Package } from 'lucide-react';

interface EmptyStateProps {
  message?: string;
  icon?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  message = 'No data available',
  icon = <Package className="w-12 h-12 text-gray-400" />,
  className = ''
}) => {
  return (
    <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
      {icon}
      <p className="mt-4 text-sm text-gray-500">{message}</p>
    </div>
  );
};