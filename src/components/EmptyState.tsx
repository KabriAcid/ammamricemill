import React from "react";

interface EmptyStateProps {
  message?: string;
  imageSrc?: string;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  message = "No data found",
  imageSrc = "/img/empty.jpg",
  className = "",
}) => (
  <div
    className={`flex flex-col items-center justify-center py-12 ${className}`}
  >
    <img
      src={imageSrc}
      alt="No data"
      className="w-32 h-32 object-contain mb-4 opacity-80"
      loading="lazy"
    />
    <p className="text-gray-500 text-base font-medium">{message}</p>
  </div>
);
