import React, { useState } from "react";

interface EmptyStateProps {
  message?: string;
  imageSrc?: string;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  message = "No data found",
  imageSrc = "/img/empty.jpg",
  className = "",
}) => {
  const fallbackImages = [
    "/img/empty.jpg",
    "/public/img/empty.jpg",
    "/empty.jpg",
    "https://via.placeholder.com/128?text=No+Image",
  ];
  const [srcIndex, setSrcIndex] = useState(0);
  const [src, setSrc] = useState(imageSrc || fallbackImages[0]);

  const handleError = () => {
    if (srcIndex < fallbackImages.length - 1) {
      const nextIndex = srcIndex + 1;
      setSrc(fallbackImages[nextIndex]);
      setSrcIndex(nextIndex);
    }
  };

  return (
    <div
      className={`flex flex-col items-center justify-center py-12 ${className}`}
    >
      <img
        src={src}
        alt="No data"
        className="w-32 h-32 object-contain mb-4 opacity-80 filter grayscale contrast-125"
        loading="lazy"
        onError={handleError}
      />
      <p className="text-gray-500 text-base font-medium">{message}</p>
    </div>
  );
};
