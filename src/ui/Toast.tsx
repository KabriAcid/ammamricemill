import React, { createContext, useContext, useState, ReactNode } from "react";

interface Toast {
  id: number;
  message: string;
  type?: "success" | "error" | "info";
}

interface ToastContextType {
  showToast: (message: string, type?: "success" | "error" | "info") => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
};

const toastTypeStyles = {
  success: "border-green-500 bg-white text-green-700",
  error: "border-red-500 bg-white text-red-700",
  info: "border-[#AF792F] bg-white text-[#AF792F]",
};

const iconMap = {
  success: (
    <svg
      className="w-6 h-6 text-green-500"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 13l4 4L19 7"
      />
    </svg>
  ),
  error: (
    <svg
      className="w-6 h-6 text-red-500"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  ),
  info: (
    <svg
      className="w-6 h-6 text-[#AF792F]"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13 16h-1v-4h-1m1-4h.01"
      />
    </svg>
  ),
};

export const ToastProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (
    message: string,
    type: "success" | "error" | "info" = "info"
  ) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-6 right-6 z-50 space-y-3 flex flex-col items-end">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`relative px-5 py-3 min-w-[240px] max-w-xs rounded-lg shadow-lg border-l-4 flex items-center gap-3 bg-white animate-fade-in-up transition-all duration-300 ${
              toastTypeStyles[toast.type || "info"]
            }`}
            style={{
              boxShadow:
                "0 4px 16px 0 rgba(31, 38, 135, 0.10)",
              backdropFilter: "blur(2px)",
            }}
          >
            <span className="inline-block align-middle">
              {iconMap[toast.type || "info"]}
            </span>
            <span className="flex-1 text-base font-medium tracking-tight">
              {toast.message}
            </span>
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 transition"
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              aria-label="Close toast"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.5s cubic-bezier(0.23, 1, 0.32, 1);
        }
      `}</style>
    </ToastContext.Provider>
  );
};
