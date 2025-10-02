import React, { useState, useEffect } from "react";
import {
  Plus,
  Printer,
  Package,
  PackageCheck,
  Scale,
} from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Table } from "../../components/ui/Table";
import { FilterBar } from "../../components/ui/FilterBar";
import { format } from "date-fns";

interface ProductionStockDetailEntry {
  id: string;
  date: string;
  invoiceNo: string;
  productionNo: string;
  productId: string;
  productName?: string;
  size?: string;
  weight?: string;
  godownId: string;
  godownName?: string;
  quantity: number;
  netWeight: number;
  createdAt: string;
  updatedAt: string;
}

const ProductionStocksDetails: React.FC = () => {
  // State management
  const [entries, setEntries] = useState<ProductionStockDetailEntry[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [productFilter, setProductFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Array<{ id: string; name: string }>>([]);

  // Fetch production stock details
  useEffect(() => {
    const fetchProductionStockDetails = async () => {
      setLoading(true);
      try {
        // TODO: API endpoint - GET /api/stocks/production-stocks-details
        // Query params: ?page={currentPage}&pageSize={pageSize}&search={searchQuery}&fromDate={dateRange.from}&toDate={dateRange.to}&productId={productFilter}
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Mock data
        const mockEntries: ProductionStockDetailEntry[] = [
          {
            id: "1",
            date: "2024-01-15",
            invoiceNo: "PS-001",
            productionNo: "PROD-001",
            productId: "PROD-001",
            productName: "Basmati Rice",
            size: "50kg",
            weight: "50",
            godownId: "GD-001",
            godownName: "Main Godown",
            quantity: 100,
            netWeight: 5000,
            createdAt: "2024-01-15T10:00:00Z",
            updatedAt: "2024-01-15T10:00:00Z",
          },
        ];

        setEntries(mockEntries);

        // Mock products data
        setProducts([
          { id: "PROD-001", name: "Basmati Rice" },
          { id: "PROD-002", name: "Jasmine Rice" },
        ]);
      } catch (error) {
        console.error("Error fetching production stock details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductionStockDetails();
  }, [currentPage, pageSize, searchQuery, dateRange, productFilter]);

  // Filtering logic
  const filteredEntries = entries.filter((entry) => {
    const matchesSearch =
      entry.invoiceNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.productionNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.productName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDateRange =
      (!dateRange.from || entry.date >= dateRange.from) &&
      (!dateRange.to || entry.date <= dateRange.to);
    const matchesProduct = !productFilter || entry.productId === productFilter;
    return matchesSearch && matchesDateRange && matchesProduct;
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
    { key: "id", label: "#", width: "80px" },
    {
      key: "date",
      label: "Date",
      render: (value: string) => format(new Date(value), "dd/MM/yyyy"),
    },
    { key: "invoiceNo", label: "Invoice No", sortable: true },
    { key: "productionNo", label: "Production No", sortable: true },
    { key: "productName", label: "Product", sortable: true },
    { key: "size", label: "Size" },
    { key: "weight", label: "Weight" },
    { key: "godownName", label: "Godown" },
    {
      key: "quantity",
      label: "Quantity",
      render: (value: number) => value.toLocaleString(),
    },
    {
      key: "netWeight",
      label: "Net Weight (Kg)",
      render: (value: number) => value.toLocaleString(),
    },
  ];

  // Calculate summary statistics
  const stats = {
    totalEntries: entries.length,
    totalQuantity: entries.reduce((sum, e) => sum + e.quantity, 0),
    totalWeight: entries.reduce((sum, e) => sum + e.netWeight, 0),
  };

  const loadingCards = loading && !entries.length;

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Production Stocks Details
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          View detailed production stock transaction history.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
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
      </div>

      {/* Filter Bar */}
      <FilterBar
        onSearch={setSearchQuery}
        placeholder="Search by invoice, production no, or product..."
      >
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

export default ProductionStocksDetails;