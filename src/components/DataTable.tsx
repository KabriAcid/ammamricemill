import React, { useState } from "react";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Eye,
  ChevronUp,
  ChevronDown,
} from "lucide-react";

interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: any) => React.ReactNode;
}

interface DataTableProps {
  data: any[];
  columns: Column[];
  title: string;
  onAdd?: () => void;
  onEdit?: (item: any) => void;
  onDelete?: (item: any) => void;
  onView?: (item: any) => void;
  searchPlaceholder?: string;
  addButtonLabel?: string;
}

export const DataTable: React.FC<DataTableProps> = ({
  data,
  columns,
  title,
  onAdd,
  onEdit,
  onDelete,
  onView,
  searchPlaceholder = "Search...",
  addButtonLabel = "Add New",
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const filteredData = data.filter((item) =>
    Object.values(item).some((value) =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const sortedData = sortColumn
    ? [...filteredData].sort((a, b) => {
        const aVal = a[sortColumn];
        const bVal = b[sortColumn];
        const modifier = sortDirection === "asc" ? 1 : -1;
        return aVal > bVal ? modifier : -modifier;
      })
    : filteredData;

  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(columnKey);
      setSortDirection("asc");
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100/50 overflow-hidden transition-all duration-300 hover:shadow-2xl">
      {/* Header with gradient background */}
      <div className="relative bg-gradient-to-r from-slate-50 to-gray-50/50 p-8 border-b border-gray-100/80">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50/20 to-purple-50/20"></div>
        <div className="relative flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              {title}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {sortedData.length} {sortedData.length === 1 ? "item" : "items"}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            {/* Enhanced Search */}
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 transition-colors group-focus-within:text-blue-500" />
              <input
                type="text"
                placeholder={searchPlaceholder}
                className="pl-12 pr-6 py-3.5 bg-white/70 border border-gray-200/80 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 focus:bg-white transition-all duration-200 w-full sm:w-80 text-sm placeholder-gray-400 shadow-sm hover:shadow-md"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Enhanced Add Button */}
            {onAdd && (
              <button
                onClick={onAdd}
                className="group bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3.5 rounded-xl flex items-center gap-3 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0 font-medium"
              >
                <Plus className="w-5 h-5 transition-transform group-hover:rotate-90 duration-200" />
                {addButtonLabel}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Table */}
      <div className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-gray-50/80 to-slate-50/80 border-b border-gray-100/60">
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={`px-8 py-5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider ${
                      column.sortable
                        ? "cursor-pointer hover:text-gray-800 hover:bg-gray-100/50 transition-all duration-150"
                        : ""
                    }`}
                    onClick={() => column.sortable && handleSort(column.key)}
                  >
                    <div className="flex items-center gap-2">
                      {column.label}
                      {column.sortable && (
                        <div className="flex flex-col">
                          <ChevronUp
                            className={`w-3 h-3 transition-colors ${
                              sortColumn === column.key &&
                              sortDirection === "asc"
                                ? "text-blue-600"
                                : "text-gray-300"
                            }`}
                          />
                          <ChevronDown
                            className={`w-3 h-3 -mt-1 transition-colors ${
                              sortColumn === column.key &&
                              sortDirection === "desc"
                                ? "text-blue-600"
                                : "text-gray-300"
                            }`}
                          />
                        </div>
                      )}
                    </div>
                  </th>
                ))}
                {(onEdit || onDelete || onView) && (
                  <th className="px-8 py-5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100/60">
              {sortedData.length === 0 ? (
                <tr>
                  <td
                    colSpan={
                      columns.length + (onEdit || onDelete || onView ? 1 : 0)
                    }
                    className="px-8 py-16 text-center"
                  >
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                        <Search className="w-8 h-8 text-gray-400" />
                      </div>
                      <div>
                        <p className="text-gray-500 font-medium">
                          No data found
                        </p>
                        <p className="text-gray-400 text-sm mt-1">
                          Try adjusting your search criteria
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                sortedData.map((item, index) => (
                  <tr
                    key={item.id || index}
                    className="group hover:bg-gradient-to-r hover:from-blue-50/30 hover:to-purple-50/20 transition-all duration-200 border-l-4 border-transparent hover:border-blue-400/50"
                  >
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className="px-8 py-6 text-sm text-gray-700 font-medium"
                      >
                        {column.render
                          ? column.render(item[column.key], item)
                          : item[column.key]}
                      </td>
                    ))}
                    {(onEdit || onDelete || onView) && (
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2 opacity-70 group-hover:opacity-100 transition-opacity duration-200">
                          {onView && (
                            <button
                              onClick={() => onView(item)}
                              className="p-2.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-150 hover:scale-105 active:scale-95"
                              title="View"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          )}
                          {onEdit && (
                            <button
                              onClick={() => onEdit(item)}
                              className="p-2.5 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all duration-150 hover:scale-105 active:scale-95"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}
                          {onDelete && (
                            <button
                              onClick={() => onDelete(item)}
                              className="p-2.5 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-150 hover:scale-105 active:scale-95"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
