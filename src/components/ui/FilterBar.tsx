import React, { useState } from "react";
import { Search, Calendar } from "lucide-react";
import { Button } from "./Button";

interface FilterBarProps {
  onSearch: (query: string) => void;
  onDateRange?: (start: string, end: string) => void;
  onFilterChange?: (filters: Record<string, any>) => void;
  placeholder?: string;
  children?: React.ReactNode;
  value?: string;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  onSearch,
  onDateRange,
  placeholder = "Search...",
  children,
  value,
}) => {
  const [searchQuery, setSearchQuery] = useState(value || "");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Live search - trigger onSearch immediately when typing
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch(query); // Call onSearch immediately for live search
  };

  const handleDateFilter = () => {
    if (onDateRange && startDate && endDate) {
      onDateRange(startDate, endDate);
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="search"
              placeholder={placeholder}
              value={searchQuery}
              onChange={handleSearchChange}
              className="input-base pl-10"
            />
          </div>
        </div>

        {onDateRange && (
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="input-base"
            />
            <span className="text-gray-500">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="input-base"
            />
            <Button variant="outline" size="sm" onClick={handleDateFilter}>
              Filter
            </Button>
          </div>
        )}

        {children}
      </div>
    </div>
  );
};
