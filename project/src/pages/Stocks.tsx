import React, { useState, useEffect } from 'react';
import { Archive, Eye, AlertTriangle } from 'lucide-react';
import { Breadcrumb } from '../components/Breadcrumb';
import { DataTable } from '../components/DataTable';
import { FormModal } from '../components/FormModal';
import { mockStocks, MockStock } from '../mock';

export const Stocks: React.FC = () => {
  const [stocks, setStocks] = useState<MockStock[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState<MockStock | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStocks();
  }, []);

  const fetchStocks = async () => {
    try {
      const response = await fetch('/api/stocks');
      const data = await response.json();
      setStocks(data);
    } catch (error) {
      setStocks(mockStocks);
    }
  };

  const handleViewDetails = (stock: MockStock) => {
    setSelectedStock(stock);
    setIsModalOpen(true);
  };

  const getStockStatus = (quantity: number) => {
    if (quantity < 100) return { status: 'critical', color: 'text-red-600', bg: 'bg-red-100' };
    if (quantity < 500) return { status: 'low', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    if (quantity < 1000) return { status: 'medium', color: 'text-blue-600', bg: 'bg-blue-100' };
    return { status: 'good', color: 'text-green-600', bg: 'bg-green-100' };
  };

  const columns = [
    { key: 'product', label: 'Product', sortable: true },
    { key: 'category', label: 'Category', sortable: true },
    { 
      key: 'quantity', 
      label: 'Quantity', 
      sortable: true,
      render: (value: number, row: MockStock) => (
        <div className="flex items-center gap-2">
          <span>{value.toLocaleString()} {row.unit}</span>
          {value < 100 && <AlertTriangle className="w-4 h-4 text-red-500" />}
        </div>
      )
    },
    { key: 'location', label: 'Location', sortable: true },
    { key: 'lastUpdated', label: 'Last Updated', sortable: true },
    {
      key: 'quantity',
      label: 'Status',
      render: (value: number) => {
        const { status, color, bg } = getStockStatus(value);
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${bg} ${color}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        );
      }
    }
  ];

  // Calculate summary stats
  const totalProducts = stocks.length;
  const totalQuantity = stocks.reduce((acc, stock) => acc + stock.quantity, 0);
  const lowStockItems = stocks.filter(stock => stock.quantity < 500).length;
  const criticalStockItems = stocks.filter(stock => stock.quantity < 100).length;

  return (
    <div className="p-6">
      <Breadcrumb items={[
        { label: 'Stocks' },
        { label: 'Main Stocks' }
      ]} />

      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Archive className="w-6 h-6 text-[#AF792F]" />
          <h1 className="text-2xl font-bold text-gray-900">Stock Management</h1>
        </div>
        <p className="text-gray-600">Monitor and manage your inventory levels</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Products</h3>
          <p className="text-2xl font-bold text-gray-900 mt-2">{totalProducts}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Quantity</h3>
          <p className="text-2xl font-bold text-blue-600 mt-2">{totalQuantity.toLocaleString()} kg</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-sm font-medium text-gray-500">Low Stock Items</h3>
          <p className="text-2xl font-bold text-yellow-600 mt-2">{lowStockItems}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-sm font-medium text-gray-500">Critical Stock</h3>
          <p className="text-2xl font-bold text-red-600 mt-2">{criticalStockItems}</p>
        </div>
      </div>

      <DataTable
        data={stocks}
        columns={columns}
        title="Stock Overview"
        onView={handleViewDetails}
        searchPlaceholder="Search stocks..."
      />

      <FormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Stock Details"
      >
        {selectedStock && (
          <div className="space-y-6">
            {/* Product Info */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-3">Product Information</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Product:</span>
                  <span className="ml-2 font-medium">{selectedStock.product}</span>
                </div>
                <div>
                  <span className="text-gray-500">Category:</span>
                  <span className="ml-2 font-medium">{selectedStock.category}</span>
                </div>
                <div>
                  <span className="text-gray-500">Location:</span>
                  <span className="ml-2 font-medium">{selectedStock.location}</span>
                </div>
                <div>
                  <span className="text-gray-500">Last Updated:</span>
                  <span className="ml-2 font-medium">{selectedStock.lastUpdated}</span>
                </div>
              </div>
            </div>

            {/* Stock Details */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Stock Details</h3>
              
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <span className="text-gray-600">Current Stock</span>
                  <div className="text-2xl font-bold text-gray-900 mt-1">
                    {selectedStock.quantity.toLocaleString()} {selectedStock.unit}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-gray-600">Status</span>
                  <div className="mt-1">
                    {(() => {
                      const { status, color, bg } = getStockStatus(selectedStock.quantity);
                      return (
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${bg} ${color}`}>
                          {status.charAt(0).toUpperCase() + status.slice(1)} Stock
                        </span>
                      );
                    })()}
                  </div>
                </div>
              </div>

              {selectedStock.quantity < 500 && (
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-yellow-800">Stock Alert</h4>
                      <p className="text-yellow-700 text-sm mt-1">
                        {selectedStock.quantity < 100 
                          ? 'Critical stock level! Immediate restocking required.'
                          : 'Low stock level. Consider restocking soon.'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Recent Activity */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Recent Activity</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <div>
                    <span className="text-sm font-medium">Stock Updated</span>
                    <div className="text-xs text-gray-500">Last inventory count</div>
                  </div>
                  <span className="text-sm text-gray-600">{selectedStock.lastUpdated}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </FormModal>
    </div>
  );
};