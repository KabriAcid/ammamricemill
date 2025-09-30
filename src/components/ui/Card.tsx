import React from "react";

interface CardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  children,
  className = "",
  hover = false,
}) => {
  // Merge DashboardCard's style: white bg, rounded-xl, p-3, shadow-card-hover, hover:shadow-card, transition, cursor-pointer
  const mergedBase =
    "bg-white rounded-xl p-3 shadow-card-hover transition-all duration-300";
  const mergedHover = hover ? "hover:card cursor-pointer" : "";
  return (
    <div className={`${mergedBase} ${mergedHover} ${className}`}>
      {(title || subtitle) && (
        <div className="p-6 border-b border-gray-200">
          {title && (
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          )}
          {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
};
