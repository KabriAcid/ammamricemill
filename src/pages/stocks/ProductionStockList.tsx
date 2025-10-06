import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Trash2,
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

interface ProductionStockItem {
  id: string;
  categoryId: string;
  productId: string;
  size?: string;
  weight?: string;
  godownId: string;
  quantity: number;
  netWeight: number;
}

interface ProductionStock {
  id: string;
  invoiceNo: string;
  date: string;
  productionNo: string;
  productionId: string;
  description?: string;
  items: ProductionStockItem[];
  totalQuantity: number;
  totalNetWeight: number;
  createdAt: string;
  updatedAt: string;
}

const ProductionStocksList: React.FC = () => {
  // State management
  const [stocks, setStocks] = useState<ProductionStock[]>([]);
  const [selectedStocks, setSelectedStocks] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Fetch production stocks
  useEffect(() => {
    const fetchProductionStocks = async () => {
      setLoading(true);
      try {
        // TODO: API endpoint - GET /api/stocks/production-stocks-list
        // Query params: ?page={currentPage}&pageSize={pageSize}&search={searchQuery}&fromDate={dateRange.from}&toDate={dateRange.to}
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Mock data
        const mockStocks: ProductionStock[] = [
          {
            id: "1",
            invoiceNo: "PS-001",
            date: "2024-01-15",
            productionNo: "PROD-001",
            productionId: "1",
            description: "Production stock entry",
            items: [
              {
                id: "1",
                categoryId: "CAT-001",
                productId: "PROD-001",
                size: "50kg",
                weight: "50",
                godownId: "GD-001",
                quantity: 100,
                netWeight: 5000,
              },
            ],
            totalQuantity: 100,
            totalNetWeight: 5000,
            createdAt: "2024-01-15T10:00:00Z",
            updatedAt: "2024-01-15T10:00:00Z",
          },
        ];
        setStocks(mockStocks);
      } catch (error) {
        console.error("Error fetching production stocks:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductionStocks();
  }, [currentPage, pageSize, searchQuery, dateRange]);

  // Filtering logic
  const filteredStocks = stocks.filter((stock) => {
    const matchesSearch =
      stock.invoiceNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stock.productionNo.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDateRange =
      (!dateRange.from || stock.date >= dateRange.from) &&
      (!dateRange.to || stock.date <= dateRange.to);
    return matchesSearch && matchesDateRange;
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
    { key: "invoiceNo", label: "Invoice No", sortable: true },
    { key: "productionNo", label: "Production No", sortable: true },
    {
      key: "items",
      label: "Items",
      render: (items: ProductionStock["items"]) => items.length,
    },
    {
      key: "totalQuantity",
      label: "Quantity",
      render: (value: number) => value.toLocaleString(),
    },
    {
      key: "totalNetWeight",
      label: "Net Weight (Kg)",
      render: (value: number) => value.toLocaleString(),
    },
  ];

  // Action handlers
  const handleDelete = async (stockIds: string[]) => {
    if (
      confirm(
        `Are you sure you want to delete ${stockIds.length} production stock(s)?`
      )
    ) {
      setLoading(true);
      try {
        // TODO: API endpoint - DELETE /api/stocks/production-stocks-list
        // Body: { ids: stockIds }
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setStocks((prev) =>
          prev.filter((stock) => !stockIds.includes(stock.id))
        );
        setSelectedStocks([]);
      } catch (error) {
        console.error("Error deleting production stocks:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  // Calculate summary statistics
  const stats = {
    totalStocks: stocks.length,
    totalQuantity: stocks.reduce((sum, s) => sum + s.totalQuantity, 0),
    totalWeight: stocks.reduce((sum, s) => sum + s.totalNetWeight, 0),
  };

  const loadingCards = loading && !stocks.length;

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Production Stocks List
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage production stock entries and inventory.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card icon={<Package size={32} />} loading={loadingCards} hover>
          <div>
            <p className="text-3xl font-bold text-gray-700">
              {stats.totalStocks}
            </p>
            <p className="text-sm text-gray-500">Total Stock Entries</p>
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
        placeholder="Search by invoice or production number..."
      >
        <div className="flex items-center space-x-2">
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
            onClick={() => navigate("/stocks/production-stock-form")}
            icon={Plus}
            size="sm"
          >
            New Stock Entry
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
      />
    </div>
  );
};

export default ProductionStocksList;
