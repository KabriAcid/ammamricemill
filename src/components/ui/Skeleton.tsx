import React from "react";

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  className?: string;
  variant?: "rectangular" | "circular" | "text" | "button";
  animation?: "pulse" | "wave" | "none";
  repeat?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = "100%",
  height = "1rem",
  className = "",
  variant = "rectangular",
  animation = "pulse",
  repeat = 1,
}) => {
  const style = {
    width: typeof width === "number" ? `${width}px` : width,
    height: typeof height === "number" ? `${height}px` : height,
  };

  const variants = {
    rectangular: "rounded",
    circular: "rounded-full",
    text: "rounded",
    button: "rounded-lg",
  };

  const animations = {
    pulse: "animate-pulse",
    wave: "animate-shimmer",
    none: "",
  };

  const elements = Array.from({ length: repeat }, (_, index) => (
    <div
      key={index}
      className={`bg-gray-200 ${variants[variant]} ${animations[animation]} ${className}`}
      style={style}
    />
  ));

  return repeat === 1 ? (
    elements[0]
  ) : (
    <div className="space-y-2">{elements}</div>
  );
};

export const SkeletonCard: React.FC<{
  variant?: "stat" | "action" | "activity";
}> = ({ variant = "stat" }) => {
  if (variant === "stat") {
    return (
      <div className="bg-white rounded-xl p-6 shadow-card">
        <div className="flex items-center space-x-4">
          <Skeleton variant="circular" width={48} height={48} />
          <div className="flex-1">
            <Skeleton variant="text" width="60%" height={16} className="mb-2" />
            <Skeleton variant="text" width="80%" height={24} />
          </div>
        </div>
      </div>
    );
  }

  if (variant === "action") {
    return (
      <div className="bg-white rounded-xl p-6 shadow-card">
        <Skeleton variant="text" width="40%" height={24} className="mb-4" />
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-4 border border-gray-200 rounded-lg">
              <Skeleton
                variant="circular"
                width={24}
                height={24}
                className="mx-auto mb-2"
              />
              <Skeleton
                variant="text"
                width="80%"
                height={16}
                className="mx-auto"
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Activity variant
  return (
    <div className="bg-white rounded-xl p-6 shadow-card">
      <Skeleton variant="text" width="40%" height={24} className="mb-4" />
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center space-x-3">
            <Skeleton variant="circular" width={16} height={16} />
            <div className="flex-1">
              <Skeleton
                variant="text"
                width="80%"
                height={16}
                className="mb-1"
              />
              <Skeleton variant="text" width="40%" height={12} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const SkeletonChart: React.FC = () => (
  <div className="bg-white rounded-xl p-6 shadow-card">
    <Skeleton variant="text" width="30%" height={24} className="mb-4" />
    <Skeleton variant="rectangular" width="100%" height={200} />
  </div>
);

export const SkeletonTable: React.FC<{
  rows?: number;
  cols?: number;
  showHeader?: boolean;
  cellHeight?: number;
}> = ({ rows = 5, cols = 4, showHeader = true, cellHeight = 20 }) => (
  <div className="space-y-4">
    {showHeader && (
      <div className="flex space-x-4 mb-2">
        {Array.from({ length: cols }).map((_, j) => (
          <Skeleton
            key={j}
            variant="text"
            height={24}
            className="flex-1"
            animation="pulse"
          />
        ))}
      </div>
    )}
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex space-x-4">
        {Array.from({ length: cols }).map((_, j) => (
          <Skeleton
            key={j}
            variant="text"
            height={cellHeight}
            className="flex-1"
            animation={i % 2 === 0 ? "pulse" : "wave"}
          />
        ))}
      </div>
    ))}
  </div>
);
