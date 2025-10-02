import React, { useState, useEffect } from "react";
import {
  Printer,
  Warehouse,
  Package,
  TrendingUp,
  DollarSign,
} from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Table } from "../../components/ui/Table";
import { FilterBar } from "../../components/ui/FilterBar";
import { format } from "date-fns";

interface GodownStockDetail {
  id: string;
  categoryId: string;
  categoryName?: string;
  productId: string;
  productName?: string;
  godownId: string;
  godownName?: string;
  opening: number;
  add: number;
  purchase: number;
  sales: number;
  production: number;
  productionStocks: number;
  stock: number;
  avgPrice: number;
  totalPrice: number;
}

const GodownStocks: React.FC = () => {
  // State management
  const [stocks, setStocks] = useState<GodownStockDetail[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [searchQuery, setSearchQuery] = useState("");
  const [godownFilter, setGodownFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [godowns, setGodowns] = useState<Array<{ id: string; name: string }>>(
    []
  );
  const [categories, setCategories] = useState<
    Array<{ id: string; name: string }>
  >([]);

  // Fetch godown stocks
  useEffect(() => {
    const fetchGodownStocks = async () => {
      setLoading(true);
      try {
        // TODO: API endpoint - GET /api/stocks/godown-stocks
        // Query params: ?page={currentPage}&pageSize={pageSize}&search={searchQuery}&godownId={godownFilter}&categoryId={categoryFilter}
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Mock data
        const mockStocks: GodownStockDetail[] = [
          {
            id: "1",
            categoryId: "CAT-001",
            categoryName: "Rice",
            productId: "PROD-001",
            productName: "Basmati Rice",
            godownId: "GD-001",
            godownName: "Main Godown",
            opening: 1000,
            add: 200,
            purchase: 500,
            sales: 300,
            production: 150,
            productionStocks: 250,
            stock: 1800,
            avgPrice: 50,
            totalPrice: 90000,
          },
        ];

        setStocks(mockStocks);

        // Mock godowns and categories
        setGodowns([
          { id: "GD-001", name: "Main Godown" },
          { id: "GD-002", name: "Secondary Godown" },
        ]);

        setCategories([
          { id: "CAT-001", name: "Rice" },
          { id: "CAT-002", name: "Wheat" },
        ]);
      } catch (error) {
        console.error("Error fetching godown stocks:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGodownStocks();
  }, [currentPage, pageSize, searchQuery, godownFilter, categoryFilter]);

  // Filtering logic
  const filteredStocks = stocks.filter((stock) => {
    const matchesSearch =
      stock.productName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stock.categoryName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGodown = !godownFilter || stock.godownId === godownFilter;
    const matchesCategory =
      !categoryFilter || stock.categoryId === categoryFilter;
    return matchesSearch && matchesGodown && matchesCategory;
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
    { key: "id", label: "#", width: "60px" },
    { key: "godownName", label: "Godown", sortable: true },
    { key: "categoryName", label: "Category", sortable: true },
    { key: "productName", label: "Product", sortable: true },
    {
      key: "opening",
      label: "Opening",
      render: (value: number) => value.toLocaleString(),
    },
    {
      key: "add",
      label: "Add",
      render: (value: number) => value.toLocaleString(),
    },
    {
      key: "purchase",
      label: "Purchase",
      render: (value: number) => value.toLocaleString(),
    },
    {
      key: "sales",
      label: "Sales",
      render: (value: number) => value.toLocaleString(),
    },
    {
      key: "production",
      label: "Production",
      render: (value: number) => value.toLocaleString(),
    },
    {
      key: "productionStocks",
      label: "Production Stocks",
      render: (value: number) => value.toLocaleString(),
    },
    {
      key: "stock",
      label: "Stock",
      render: (value: number) => value.toLocaleString(),
    },
    {
      key: "avgPrice",
      label: "Avg Price",
      render: (value: number) => `₦${value.toLocaleString()}`,
    },
    {
      key: "totalPrice",
      label: "Total Price",
      render: (value: number) => `₦${value.toLocaleString()}`,
    },
  ];

  // Calculate summary statistics
  const stats = {
    totalStock: stocks.reduce((sum, s) => sum + s.stock, 0),
    totalValue: stocks.reduce((sum, s) => sum + s.totalPrice, 0),
    totalProducts: stocks.length,
    totalGodowns: new Set(stocks.map((s) => s.godownId)).size,
  };

  // Calculate totals for table footer
  const totals = {
    opening: stocks.reduce((sum, s) => sum + s.opening, 0),
    add: stocks.reduce((sum, s) => sum + s.add, 0),
    purchase: stocks.reduce((sum, s) => sum + s.purchase, 0),
    sales: stocks.reduce((sum, s) => sum + s.sales, 0),
    production: stocks.reduce((sum, s) => sum + s.production, 0),
    productionStocks: stocks.reduce((sum, s) => sum + s.productionStocks, 0),
    stock: stocks.reduce((sum, s) => sum + s.stock, 0),
    totalPrice: stocks.reduce((sum, s) => sum + s.totalPrice, 0),
  };

  const loadingCards = loading && !stocks.length;

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Godown Stocks</h1>
        <p className="mt-1 text-sm text-gray-500">
          View godown-wise stock inventory and movements.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card icon={<Package size={32} />} loading={loadingCards} hover>
          <div>
            <p className="text-3xl font-bold text-gray-700">
              {stats.totalStock.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500">Total Stock</p>
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
        <Card icon={<TrendingUp size={32} />} loading={loadingCards} hover>
          <div>
            <p className="text-3xl font-bold text-gray-700">
              {stats.totalProducts}
            </p>
            <p className="text-sm text-gray-500">Total Products</p>
          </div>
        </Card>
        <Card icon={<Warehouse size={32} />} loading={loadingCards} hover>
          <div>
            <p className="text-3xl font-bold text-gray-700">
              {stats.totalGodowns}
            </p>
            <p className="text-sm text-gray-500">Godowns</p>
          </div>
        </Card>
      </div>

      {/* Company Header (for print) */}
      <div className="hidden print:block text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Amam Rice Mill</h1>
        <p className="text-sm text-gray-500">123 Rice Mill Road, City</p>
        <p className="text-sm text-gray-500">
          Date: {format(new Date(), "dd/MM/yyyy")}
        </p>
      </div>

      {/* Filter Bar */}
      <FilterBar
        onSearch={setSearchQuery}
        placeholder="Search by product or category..."
      >
        <div className="flex items-center space-x-2">
          <select
            value={godownFilter}
            onChange={(e) => setGodownFilter(e.target.value)}
            className="input-base h-9"
          >
            <option value="">All Godowns</option>
            {godowns.map((godown) => (
              <option key={godown.id} value={godown.id}>
                {godown.name}
              </option>
            ))}
          </select>
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
        summaryRow={{
          opening: totals.opening.toLocaleString(),
          add: totals.add.toLocaleString(),
          purchase: totals.purchase.toLocaleString(),
          sales: totals.sales.toLocaleString(),
          production: totals.production.toLocaleString(),
          productionStocks: totals.productionStocks.toLocaleString(),
          stock: totals.stock.toLocaleString(),
          totalPrice: `₦${totals.totalPrice.toLocaleString()}`,
        }}
      />
    </div>
  );
};

export default GodownStocks;
