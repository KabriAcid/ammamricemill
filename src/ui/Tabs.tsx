import React, { useState, ReactNode } from "react";

interface Tab {
  label: string;
  content: ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  initialIndex?: number;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, initialIndex = 0 }) => {
  const [active, setActive] = useState(initialIndex);

  return (
    <div>
      <div className="flex border-b border-gray-200">
        {tabs.map((tab, idx) => (
          <button
            key={tab.label}
            className={`px-4 py-2 -mb-px font-medium border-b-2 transition-colors duration-200 focus:outline-none ${
              active === idx
                ? "border-[#AF792F] text-[#AF792F] bg-white"
                : "border-transparent text-gray-500 hover:text-[#AF792F]"
            }`}
            onClick={() => setActive(idx)}
            type="button"
            role="tab"
            aria-selected={active === idx}
            aria-controls={`tab-panel-${idx}`}
            tabIndex={active === idx ? 0 : -1}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="pt-6" id={`tab-panel-${active}`} role="tabpanel">
        {tabs[active].content}
      </div>
    </div>
  );
};
