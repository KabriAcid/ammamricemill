import React from 'react';
import { ChevronLeft, ChevronRight, CreditCard as Edit, Trash2, Eye, MoreHorizontal } from 'lucide-react';
import { TableProps } from '../../types';
import { Button } from './Button';
import { Spinner } from './Spinner';
import { EmptyState } from './EmptyState';

export function Table<T extends { id: string }>({
  data,
  columns,
  loading = false,
  pagination,
  selection,
  actions
}: TableProps<T>) {
  const handleSelectAll = (checked: boolean) => {
    if (selection) {
      const newSelection = checked ? data.map(item => item.id) : [];
      selection.onSelectionChange(newSelection);
    }
  };

  const handleSelectItem = (itemId: string, checked: boolean) => {
    if (selection) {
      const currentSelection = selection.selectedItems;
      const newSelection = checked
        ? [...currentSelection, itemId]
        : currentSelection.filter(id => id !== itemId);
      selection.onSelectionChange(newSelection);
    }
  };

  const isAllSelected = selection && selection.selectedItems.length === data.length && data.length > 0;
  const isIndeterminate = selection && selection.selectedItems.length > 0 && selection.selectedItems.length < data.length;

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Spinner size="lg" />
      </div>
    );
  }

  if (data.length === 0) {
    return <EmptyState message="No data found" />;
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="table-base">
          <thead>
            <tr>
              {selection && (
                <th className="table-header w-12">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = isIndeterminate || false;
                    }}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="table-header"
                  style={{ width: column.width }}
                >
                  {column.label}
                </th>
              ))}
              {actions && <th className="table-header w-32">Actions</th>}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((item, index) => (
              <tr key={item.id} className="hover:bg-gray-50">
                {selection && (
                  <td className="table-cell">
                    <input
                      type="checkbox"
                      checked={selection.selectedItems.includes(item.id)}
                      onChange={(e) => handleSelectItem(item.id, e.target.checked)}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                  </td>
                )}
                {columns.map((column) => (
                  <td key={column.key} className="table-cell">
                    {column.render 
                      ? column.render((item as any)[column.key], item)
                      : (item as any)[column.key]
                    }
                  </td>
                ))}
                {actions && (
                  <td className="table-cell">
                    <div className="flex items-center space-x-2">
                      {actions.onView && (
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={Eye}
                          onClick={() => actions.onView!(item)}
                          className="p-1"
                        />
                      )}
                      {actions.onEdit && (
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={Edit}
                          onClick={() => actions.onEdit!(item)}
                          className="p-1"
                        />
                      )}
                      {actions.custom?.map((action, idx) => (
                        <Button
                          key={idx}
                          variant={action.variant || 'ghost'}
                          size="sm"
                          onClick={() => action.onClick(item)}
                          className="p-1"
                        >
                          {action.icon}
                        </Button>
                      ))}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {pagination && (
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-700">Show</span>
            <select
              value={pagination.pageSize}
              onChange={(e) => pagination.onPageSizeChange(Number(e.target.value))}
              className="border border-gray-300 rounded px-2 py-1 text-sm"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="text-sm text-gray-700">entries</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-700">
              {((pagination.currentPage - 1) * pagination.pageSize) + 1} to{' '}
              {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalItems)} of{' '}
              {pagination.totalItems} entries
            </span>
            <div className="flex space-x-1">
              <Button
                variant="outline"
                size="sm"
                icon={ChevronLeft}
                onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
              />
              <Button
                variant="outline"
                size="sm"
                icon={ChevronRight}
                onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}