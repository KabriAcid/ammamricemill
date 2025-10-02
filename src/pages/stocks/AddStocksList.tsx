import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Trash2,
  Printer,
  Package,
  PackageCheck,
  Scale,
  DollarSign,
} from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Table } from "../../components/ui/Table";
import { FilterBar } from "../../components/ui/FilterBar";
import { format } from "date-fns";

interface AddStock {
  id: string;
  date: string;
  productId: string;
  productName?: string;
  godownId: string;
  godownName?: string;
  quantity: number;
  netWeight: number;
  rate: number;
  totalPrice: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

const AddStocksList: React.FC = () => {
  // State management
  const [stocks, setStocks] = useState<AddStock[]>([]);
  const [selectedStocks, setSelectedStocks] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [productFilter, setProductFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Array<{ id: string; name: string }>>(
    []
  );
  const navigate = useNavigate();

  // Fetch add stocks
  useEffect(() => {
    const fetchAddStocks = async () => {
      setLoading(true);
      try {
        // TODO: API endpoint - GET /api/stocks/add-stocks
        // Query params: ?page={currentPage}&pageSize={pageSize}&fromDate={dateRange.from}&toDate={dateRange.to}&productId={productFilter}
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Mock data
        const mockStocks: AddStock[] = [
          {
            id: "1",
            date: "2024-01-15",
            productId: "PROD-001",
            productName: "Basmati Rice",
            godownId: "GD-001",
            godownName: "Main Godown",
            quantity: 100,
            netWeight: 5000,
            rate: 50,
            totalPrice: 5000,
            notes: "Manual stock addition",
            createdAt: "2024-01-15T10:00:00Z",
            updatedAt: "2024-01-15T10:00:00Z",
          },
        ];

        setStocks(mockStocks);

        // Mock products
        setProducts([
          { id: "PROD-001", name: "Basmati Rice" },
          { id: "PROD-002", name: "Jasmine Rice" },
        ]);
      } catch (error) {
        console.error("Error fetching add stocks:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAddStocks();
  }, [currentPage, pageSize, dateRange, productFilter]);

  // Filtering logic
  const filteredStocks = stocks.filter((stock) => {
    const matchesDateRange =
      (!dateRange.from || stock.date >= dateRange.from) &&
      (!dateRange.to || stock.date <= dateRange.to);
    const matchesProduct = !productFilter || stock.productId === productFilter;
    return matchesDateRange && matchesProduct;
  });

  // Pagination
  const totalPages = Math.ceil(filteredStocks.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedStocks = filteredStocks.slice(
    startIndex,
    startIndex + pageSize
  );

  // Table columns
  const columns = [
    { key: "id", label: "#", width: "80px" },
    {
      key: "date",
      label: "Date",
      render: (value: string) => format(new Date(value), "dd/MM/yyyy"),
    },
    { key: "productName", label: "Product", sortable: true },
    {
      key: "quantity",
      label: "Quantity (Bag)",
      render: (value: number) => value.toLocaleString(),
    },
    {
      key: "netWeight",
      label: "Net Weight (Kg)",
      render: (value: number) => value.toLocaleString(),
    },
    {
      key: "rate",
      label: "Rate",
      render: (value: number) => `₦${value.toLocaleString()}`,
    },
    {
      key: "totalPrice",
      label: "Total Price",
      render: (value: number) => `₦${value.toLocaleString()}`,
    },
  ];

  // Action handlers
  const handleDelete = async (stockIds: string[]) => {
    if (
      confirm(
        `Are you sure you want to delete ${stockIds.length} stock entry(ies)?`
      )
    ) {
      setLoading(true);
      try {
        // TODO: API endpoint - DELETE /api/stocks/add-stocks
        // Body: { ids: stockIds }
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setStocks((prev) =>
          prev.filter((stock) => !stockIds.includes(stock.id))
        );
        setSelectedStocks([]);
      } catch (error) {
        console.error("Error deleting add stocks:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  // Calculate summary statistics
  const stats = {
    totalEntries: stocks.length,
    totalQuantity: stocks.reduce((sum, s) => sum + s.quantity, 0),
    totalWeight: stocks.reduce((sum, s) => sum + s.netWeight, 0),
    totalValue: stocks.reduce((sum, s) => sum + s.totalPrice, 0),
  };

  // Calculate totals for table footer
  const totals = {
    quantity: stocks.reduce((sum, s) => sum + s.quantity, 0),
    netWeight: stocks.reduce((sum, s) => sum + s.netWeight, 0),
    totalPrice: stocks.reduce((sum, s) => sum + s.totalPrice, 0),
  };

  const loadingCards = loading && !stocks.length;

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Add Stocks List</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage manual stock additions and adjustments.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card icon={<Package size={32} />} loading={loadingCards} hover>
          <div>
            <p className="text-3xl font-bold text-gray-700">
              {stats.totalEntries}
            </p>
            <p className="text-sm text-gray-500">Total Entries</p>
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
        <Card icon={<Scale size={32} />} loading={loadingCards} hover>
          <div>
            <p className="text-3xl font-bold text-gray-700">
              {stats.totalWeight.toLocaleString()} Kg
            </p>
            <p className="text-sm text-gray-500">Total Weight</p>
          </div>
        </Card>
        <Card icon={<DollarSign size={32} />} loading={loadingCards} hover>
          <div>
            <p className="text-3xl font-bold text-gray-700">
              ₦{stats.totalValue.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500">Total Value</p>
          </div>
        </Card>
      </div>

      {/* Filter Bar */}
      <FilterBar onSearch={() => {}} placeholder="">
        <div className="flex items-center space-x-2">
          <select
            value={productFilter}
            onChange={(e) => setProductFilter(e.target.value)}
            className="input-base h-9"
          >
            <option value="">All Products</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={dateRange.from}
            onChange={(e) =>
              setDateRange((prev) => ({ ...prev, from: e.target.value }))
            }
            className="input-base h-9"
          />
          <input
            type="date"
            value={dateRange.to}
            onChange={(e) =>
              setDateRange((prev) => ({ ...prev, to: e.target.value }))
            }
            className="input-base h-9"
          />
          <Button
            onClick={() => navigate("/stocks/add-stocks/new")}
            icon={Plus}
            size="sm"
          >
            New Stock
          </Button>
          {selectedStocks.length > 0 && (
            <Button
              variant="danger"
              size="sm"
              icon={Trash2}
              onClick={() => handleDelete(selectedStocks)}
              loading={loading}
            >
              Delete ({selectedStocks.length})
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
        data={paginatedStocks}
        columns={columns}
        loading={loading}
        pagination={{
          currentPage,
          totalPages,
          pageSize,
          totalItems: filteredStocks.length,
          onPageChange: setCurrentPage,
          onPageSizeChange: (size) => {
            setPageSize(size);
            setCurrentPage(1);
          },
        }}
        selection={{
          selectedItems: selectedStocks,
          onSelectionChange: setSelectedStocks,
        }}
        summaryRow={{
          quantity: totals.quantity.toLocaleString(),
          netWeight: totals.netWeight.toLocaleString(),
          totalPrice: `₦${totals.totalPrice.toLocaleString()}`,
        }}
      />
    </div>
  );
};

export default AddStocksList;
