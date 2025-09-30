import React, { useState } from 'react';
import { Search, Filter, Calendar } from 'lucide-react';
import { Button } from './Button';

interface FilterBarProps {
  onSearch: (query: string) => void;
  onDateRange?: (start: string, end: string) => void;
  onFilterChange?: (filters: Record<string, any>) => void;
  placeholder?: string;
  children?: React.ReactNode;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  onSearch,
  onDateRange,
  placeholder = 'Search...',
  children
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  const handleDateFilter = () => {
    if (onDateRange && startDate && endDate) {
      onDateRange(startDate, endDate);
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <form onSubmit={handleSearch} className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder={placeholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-base pl-10"
            />
          </div>
        </form>
        
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
            <Button
              variant="outline"
              size="sm"
              onClick={handleDateFilter}
            >
              Filter
            </Button>
          </div>
        )}
        
        {children}
      </div>
    </div>
  );
};