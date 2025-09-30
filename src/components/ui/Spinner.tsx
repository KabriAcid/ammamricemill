import React from "react";

export const Spinner: React.FC<{ size?: number; className?: string }> = ({ size = 32, className = "" }) => (
  <svg
    className={`animate-spin text-[#AF792F] ${className}`}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
    />
  </svg>
);

export const FullPageSpinner: React.FC = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-60 z-50">
    <Spinner size={48} />
  </div>
);
