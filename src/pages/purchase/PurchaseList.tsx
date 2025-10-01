import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Trash2,
  Printer,
  ShoppingBag,
  PackageCheck,
  DollarSign,
  ArrowDownCircle,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Table } from '../../components/ui/Table';
import { FilterBar } from '../../components/ui/FilterBar';
import { Modal } from '../../components/ui/Modal';
import { Purchase } from '../../types/purchase';
import { format } from 'date-fns';

const PurchaseList: React.FC = () => {
  // State management
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [selectedPurchases, setSelectedPurchases] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Fetch purchases
  useEffect(() => {
    const fetchPurchases = async () => {
      setLoading(true);
      try {
        // TODO: Replace with actual API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        // Mock data
        const mockPurchases: Purchase[] = [
          {
            id: '1',
            invoiceNo: 'PUR-001',
            date: '2024-01-15',
            challanNo: 'CH-001',
            partyId: 'PARTY-001',
            transportInfo: 'Truck ABC-123',
            notes: 'Regular purchase',
            items: [
              {
                categoryId: 'CAT-001',
                productId: 'PROD-001',
                godownId: 'GD-001',
                quantity: 100,
                netWeight: 5000,
                rate: 50,
                totalPrice: 5000
              }
            ],
            totalQuantity: 100,
            totalNetWeight: 5000,
            invoiceAmount: 5000,
            discount: 100,
            totalAmount: 4900,
            previousBalance: 1000,
            netPayable: 5900,
            paidAmount: 4000,
            currentBalance: 1900,
            createdAt: '2024-01-15T10:00:00Z',
            updatedAt: '2024-01-15T10:00:00Z'
          }
        ];
        setPurchases(mockPurchases);
      } catch (error) {
        console.error('Error fetching purchases:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPurchases();
  }, []);

  // Filtering logic
  const filteredPurchases = purchases.filter(purchase => {
    const matchesSearch = 
      purchase.invoiceNo.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDateRange = 
      (!dateRange.from || purchase.date >= dateRange.from) &&
      (!dateRange.to || purchase.date <= dateRange.to);
    return matchesSearch && matchesDateRange;
  });

  // Pagination
  const totalPages = Math.ceil(filteredPurchases.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedPurchases = filteredPurchases.slice(
    startIndex,
    startIndex + pageSize
  );

  // Table columns
  const columns = [
    { key: 'id', label: '#', width: '80px' },
    { key: 'date', label: 'Date', 
      render: (value: string) => format(new Date(value), 'dd/MM/yyyy')
    },
    { key: 'invoiceNo', label: 'Invoice No', sortable: true },
    { key: 'partyId', label: 'Party', sortable: true },
    { 
      key: 'items',
      label: 'Items',
      render: (items: Purchase['items']) => items.length
    },
    { 
      key: 'totalQuantity',
      label: 'Quantity',
      render: (value: number) => value.toLocaleString()
    },
    { 
      key: 'totalAmount',
      label: 'Total',
      render: (value: number) => `₹${value.toLocaleString()}`
    },
    { 
      key: 'discount',
      label: 'Discount',
      render: (value: number) => `₹${value.toLocaleString()}`
    },
    { 
      key: 'netPayable',
      label: 'Net Price',
      render: (value: number) => `₹${value.toLocaleString()}`
    },
  ];

  // Action handlers
  const handleDelete = async (purchaseIds: string[]) => {
    if (confirm(`Are you sure you want to delete ${purchaseIds.length} purchase(s)?`)) {
      setLoading(true);
      try {
        // TODO: Replace with actual API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setPurchases(prev => 
          prev.filter(purchase => !purchaseIds.includes(purchase.id))
        );
        setSelectedPurchases([]);
      } catch (error) {
        console.error('Error deleting purchases:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleView = (purchase: Purchase) => {
    navigate(`/purchases/${purchase.id}`);
  };

  // Calculate summary statistics
  const stats = {
    totalPurchases: purchases.length,
    totalQuantity: purchases.reduce((sum, p) => sum + p.totalQuantity, 0),
    totalAmount: purchases.reduce((sum, p) => sum + p.totalAmount, 0),
    averageAmount: purchases.length ? 
      purchases.reduce((sum, p) => sum + p.totalAmount, 0) / purchases.length : 0
  };

  const loadingCards = loading && !purchases.length;

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Purchase Management</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage purchase orders and transactions.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card icon={<ShoppingBag size={32} />} loading={loadingCards} hover>
          <div>
            <p className="text-3xl font-bold text-gray-700">
              {stats.totalPurchases}
            </p>
            <p className="text-sm text-gray-500">Total Purchases</p>
          </div>
        </Card>
        <Card icon={<PackageCheck size={32} />} loading={loadingCards} hover>
          <div>
            <p className="text-3xl font-bold text-gray-700">
              {stats.totalQuantity.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500">Total Quantity</p>
          </div>
        </Card>
        <Card icon={<DollarSign size={32} />} loading={loadingCards} hover>
          <div>
            <p className="text-3xl font-bold text-gray-700">
              ₹{stats.totalAmount.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500">Total Amount</p>
          </div>
        </Card>
        <Card icon={<ArrowDownCircle size={32} />} loading={loadingCards} hover>
          <div>
            <p className="text-3xl font-bold text-gray-700">
              ₹{Math.round(stats.averageAmount).toLocaleString()}
            </p>
            <p className="text-sm text-gray-500">Average Purchase</p>
          </div>
        </Card>
      </div>

      {/* Filter Bar */}
      <FilterBar
        onSearch={setSearchQuery}
        placeholder="Search by invoice number..."
      >
        <div className="flex items-center space-x-2">
          <input
            type="date"
            value={dateRange.from}
            onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
            className="input-base h-9"
          />
          <input
            type="date"
            value={dateRange.to}
            onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
            className="input-base h-9"
          />
          <Button onClick={() => navigate('/purchases/new')} icon={Plus} size="sm">
            New Purchase
          </Button>
          {selectedPurchases.length > 0 && (
            <Button
              variant="danger"
              size="sm"
              icon={Trash2}
              onClick={() => handleDelete(selectedPurchases)}
              loading={loading}
            >
              Delete ({selectedPurchases.length})
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            icon={Printer}
            onClick={() => window.print()}
          >
            Print
          </Button>
        </div>
      </FilterBar>

      {/* Table */}
      <Table
        data={paginatedPurchases}
        columns={columns}
        loading={loading}
        pagination={{
          currentPage,
          totalPages,
          pageSize,
          totalItems: filteredPurchases.length,
          onPageChange: setCurrentPage,
          onPageSizeChange: (size) => {
            setPageSize(size);
            setCurrentPage(1);
          },
        }}
        selection={{
          selectedItems: selectedPurchases,
          onSelectionChange: setSelectedPurchases,
        }}
        actions={{
          onView: handleView,
        }}
      />
    </div>
  );
};

export default PurchaseList;