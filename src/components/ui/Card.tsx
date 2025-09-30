import React from "react";

interface CardProps {
  icon: React.ReactNode;
  iconClassName?: string;
  loading?: boolean;
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({
  icon,
  iconClassName = "text-primary-600",
  loading = false,
  children,
  className = "",
  hover = false,
}) => {
  const mergedBase =
    "bg-white rounded-xl p-3 shadow-card-hover transition-all duration-300";
  const mergedHover = hover ? "hover:card cursor-pointer" : "";

  return (
    <div className={`${mergedBase} ${mergedHover} ${className}`}>
      <div className="flex items-center justify-between min-h-[72px] px-2 py-3">
        <div className="flex-1 flex flex-col justify-center">
          {loading ? (
            <div className="animate-pulse space-y-2">
              <div className="h-6 bg-gray-200 rounded w-2/3" />
              <div className="h-4 bg-gray-100 rounded w-1/3" />
            </div>
          ) : (
            children
          )}
        </div>
        <div className="flex items-center ml-4">
          {icon && React.isValidElement(icon)
            ? React.cloneElement(icon as React.ReactElement, {
                className: `${
                  icon.props.className || ""
                } ${iconClassName}`.trim(),
              })
            : icon}
        </div>
      </div>
    </div>
  );
};
