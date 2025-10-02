import React, { useState, useEffect } from "react";
import { Printer, FileText, TrendingUp, Package } from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Table } from "../../components/ui/Table";
import { FilterBar } from "../../components/ui/FilterBar";
import { format } from "date-fns";

interface StockRegisterEntry {
  id: string;
  date: string;
  transactionType: string;
  referenceNo: string;
  productId: string;
  productName?: string;
  categoryId: string;
  categoryName?: string;
  inQuantity: number;
  outQuantity: number;
  balanceQuantity: number;
  inWeight: number;
  outWeight: number;
  balanceWeight: number;
  rate?: number;
  remarks?: string;
}

const StockRegister: React.FC = () => {
  // State management
  const [entries, setEntries] = useState<StockRegisterEntry[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [categoryFilter, setCategoryFilter] = useState("");
  const [productFilter, setProductFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [products, setProducts] = useState<Array<{ id: string; name: string }>>(
    []
  );

  // Fetch stock register
  useEffect(() => {
    const fetchStockRegister = async () => {
      setLoading(true);
      try {
        // TODO: API endpoint - GET /api/stocks/stock-register
        // Query params: ?page={currentPage}&pageSize={pageSize}&search={searchQuery}&fromDate={dateRange.from}&toDate={dateRange.to}&categoryId={categoryFilter}&productId={productFilter}
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Mock data
        const mockEntries: StockRegisterEntry[] = [
          {
            id: "1",
            date: "2024-01-15",
            transactionType: "Purchase",
            referenceNo: "PUR-001",
            productId: "PROD-001",
            productName: "Basmati Rice",
            categoryId: "CAT-001",
            categoryName: "Rice",
            inQuantity: 100,
            outQuantity: 0,
            balanceQuantity: 100,
            inWeight: 5000,
            outWeight: 0,
            balanceWeight: 5000,
            rate: 50,
            remarks: "Regular purchase",
          },
          {
            id: "2",
            date: "2024-01-16",
            transactionType: "Sales",
            referenceNo: "SAL-001",
            productId: "PROD-001",
            productName: "Basmati Rice",
            categoryId: "CAT-001",
            categoryName: "Rice",
            inQuantity: 0,
            outQuantity: 50,
            balanceQuantity: 50,
            inWeight: 0,
            outWeight: 2500,
            balanceWeight: 2500,
            rate: 60,
            remarks: "Regular sale",
          },
        ];

        setEntries(mockEntries);

        // Mock categories and products
        setCategories([
          { id: "CAT-001", name: "Rice" },
          { id: "CAT-002", name: "Wheat" },
        ]);

        setProducts([
          { id: "PROD-001", name: "Basmati Rice" },
          { id: "PROD-002", name: "Jasmine Rice" },
        ]);
      } catch (error) {
        console.error("Error fetching stock register:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStockRegister();
  }, [
    currentPage,
    pageSize,
    searchQuery,
    dateRange,
    categoryFilter,
    productFilter,
  ]);

  // Filtering logic
  const filteredEntries = entries.filter((entry) => {
    const matchesSearch =
      entry.referenceNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.productName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDateRange =
      (!dateRange.from || entry.date >= dateRange.from) &&
      (!dateRange.to || entry.date <= dateRange.to);
    const matchesCategory =
      !categoryFilter || entry.categoryId === categoryFilter;
    const matchesProduct = !productFilter || entry.productId === productFilter;
    return (
      matchesSearch && matchesDateRange && matchesCategory && matchesProduct
    );
  });

  // Pagination
  const totalPages = Math.ceil(filteredEntries.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedEntries = filteredEntries.slice(
    startIndex,
    startIndex + pageSize
  );

  // Table columns
  const columns = [
    { key: "id", label: "#", width: "60px" },
    {
      key: "date",
      label: "Date",
      render: (value: string) => format(new Date(value), "dd/MM/yyyy"),
    },
    { key: "transactionType", label: "Type", sortable: true },
    { key: "referenceNo", label: "Reference No" },
    { key: "productName", label: "Product", sortable: true },
    {
      key: "inQuantity",
      label: "In (Bags)",
      render: (value: number) => (value ? value.toLocaleString() : "-"),
    },
    {
      key: "outQuantity",
      label: "Out (Bags)",
      render: (value: number) => (value ? value.toLocaleString() : "-"),
    },
    {
      key: "balanceQuantity",
      label: "Balance (Bags)",
      render: (value: number) => value.toLocaleString(),
    },
    {
      key: "inWeight",
      label: "In (Kg)",
      render: (value: number) => (value ? value.toLocaleString() : "-"),
    },
    {
      key: "outWeight",
      label: "Out (Kg)",
      render: (value: number) => (value ? value.toLocaleString() : "-"),
    },
    {
      key: "balanceWeight",
      label: "Balance (Kg)",
      render: (value: number) => value.toLocaleString(),
    },
  ];

  // Calculate summary statistics
  const stats = {
    totalEntries: entries.length,
    totalIn: entries.reduce((sum, e) => sum + e.inQuantity, 0),
    totalOut: entries.reduce((sum, e) => sum + e.outQuantity, 0),
    currentBalance:
      entries.length > 0 ? entries[entries.length - 1].balanceQuantity : 0,
  };

  const loadingCards = loading && !entries.length;

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Stock Register</h1>
        <p className="mt-1 text-sm text-gray-500">
          View detailed stock movement history and transactions.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card icon={<FileText size={32} />} loading={loadingCards} hover>
          <div>
            <p className="text-3xl font-bold text-gray-700">
              {stats.totalEntries}
            </p>
            <p className="text-sm text-gray-500">Total Entries</p>
          </div>
        </Card>
        <Card icon={<TrendingUp size={32} />} loading={loadingCards} hover>
          <div>
            <p className="text-3xl font-bold text-gray-700">
              {stats.totalIn.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500">Total In</p>
          </div>
        </Card>
        <Card
          icon={<TrendingUp size={32} className="rotate-180" />}
          loading={loadingCards}
          hover
        >
          <div>
            <p className="text-3xl font-bold text-gray-700">
              {stats.totalOut.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500">Total Out</p>
          </div>
        </Card>
        <Card icon={<Package size={32} />} loading={loadingCards} hover>
          <div>
            <p className="text-3xl font-bold text-gray-700">
              {stats.currentBalance.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500">Current Balance</p>
          </div>
        </Card>
      </div>

      {/* Filter Bar */}
      <FilterBar
        onSearch={setSearchQuery}
        placeholder="Search by reference or product..."
      >
        <div className="flex items-center space-x-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="input-base h-9"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
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
        data={paginatedEntries}
        columns={columns}
        loading={loading}
        pagination={{
          currentPage,
          totalPages,
          pageSize,
          totalItems: filteredEntries.length,
          onPageChange: setCurrentPage,
          onPageSizeChange: (size) => {
            setPageSize(size);
            setCurrentPage(1);
          },
        }}
      />
    </div>
  );
};

export default StockRegister;
