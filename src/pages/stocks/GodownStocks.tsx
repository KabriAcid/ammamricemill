import { useState, useEffect } from "react";
import {
  Printer,
  Warehouse,
  Package,
  TrendingUp,
  DollarSign,
  RefreshCcw,
} from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Table } from "../../components/ui/Table";
import { FilterBar } from "../../components/ui/FilterBar";
import { SkeletonCard } from "../../components/ui/Skeleton";
import { useToast } from "../../components/ui/Toast";
import { api } from "../../utils/fetcher";
import { ApiResponse } from "../../types";
import { formatCurrency } from "../../utils/formatters";

interface GodownStockDetail {
  id: string;
  categoryId: string;
  categoryName: string;
  productId: string;
  productName: string;
  godownId: string;
  godownName: string;
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

interface Category {
  id: string;
  name: string;
}

interface Godown {
  id: string;
  name: string;
}

const GodownStocks = () => {
  const [data, setData] = useState<GodownStockDetail[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [godowns, setGodowns] = useState<Godown[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [godownFilter, setGodownFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const { showToast } = useToast();

  const fetchGodownStocks = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (godownFilter) params.append("godown_id", godownFilter);
      if (categoryFilter) params.append("category_id", categoryFilter);

      const response = await api.get<ApiResponse<GodownStockDetail[]>>(
        `/stocks/godown-stocks?${params.toString()}`
      );

      if (response.success && response.data) {
        setData(
          response.data.map((item) => ({ ...item, id: String(item.id) }))
        );
      }
    } catch (error) {
      console.error("Error fetching godown stocks:", error);
      showToast("Failed to load godown stocks", "error");
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get<ApiResponse<Category[]>>("/categories");
      if (response.success && response.data) {
        setCategories(
          response.data.map((cat) => ({ id: String(cat.id), name: cat.name }))
        );
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchGodowns = async () => {
    try {
      const response = await api.get<ApiResponse<Godown[]>>("/godowns");
      if (response.success && response.data) {
        setGodowns(
          response.data.map((gd) => ({ id: String(gd.id), name: gd.name }))
        );
      }
    } catch (error) {
      console.error("Error fetching godowns:", error);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchGodownStocks();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  useEffect(() => {
    fetchGodownStocks();
    fetchCategories();
    fetchGodowns();
  }, []);

  useEffect(() => {
    if (!initialLoading) {
      fetchGodownStocks();
    }
  }, [godownFilter, categoryFilter]);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "k") {
        event.preventDefault();
        document
          .querySelector<HTMLInputElement>('input[type="search"]')
          ?.focus();
      }
      if ((event.ctrlKey || event.metaKey) && event.key === "r") {
        event.preventDefault();
        handleRefresh();
      }
      if ((event.ctrlKey || event.metaKey) && event.key === "p") {
        event.preventDefault();
        handlePrint();
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const filteredData = data.filter((item) => {
    const query = search.toLowerCase().trim();
    if (!query) return true;

    return (
      item.productName?.toLowerCase().includes(query) ||
      item.categoryName?.toLowerCase().includes(query) ||
      item.godownName?.toLowerCase().includes(query) ||
      false
    );
  });

  const totalPages = Math.ceil(filteredData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = filteredData.slice(startIndex, startIndex + pageSize);

  const totalStock = filteredData.reduce((sum, s) => sum + s.stock, 0);
  const totalValue = filteredData.reduce((sum, s) => sum + s.totalPrice, 0);
  const totalProducts = filteredData.length;
  const totalGodowns = new Set(filteredData.map((s) => s.godownId)).size;

  const totals = {
    opening: filteredData.reduce((sum, s) => sum + s.opening, 0),
    add: filteredData.reduce((sum, s) => sum + s.add, 0),
    purchase: filteredData.reduce((sum, s) => sum + s.purchase, 0),
    sales: filteredData.reduce((sum, s) => sum + s.sales, 0),
    production: filteredData.reduce((sum, s) => sum + s.production, 0),
    productionStocks: filteredData.reduce(
      (sum, s) => sum + s.productionStocks,
      0
    ),
    stock: filteredData.reduce((sum, s) => sum + s.stock, 0),
    totalPrice: filteredData.reduce((sum, s) => sum + s.totalPrice, 0),
  };

  const handlePrint = () => {
    window.print();
  };

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
      render: (value: number) => `₦${formatCurrency(value)}`,
    },
    {
      key: "totalPrice",
      label: "Total Price",
      render: (value: number) => `₦${formatCurrency(value)}`,
    },
  ];

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Godown Stocks</h1>
          <p className="mt-1 text-sm text-gray-500">
            View godown-wise stock inventory and movements.
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className={`p-2 text-gray-500 hover:text-gray-700 transition-colors ${
            isRefreshing ? "animate-spin" : ""
          }`}
          title="Refresh data (Ctrl+R)"
        >
          <RefreshCcw className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {initialLoading ? (
          <>
            <SkeletonCard variant="stat" />
            <SkeletonCard variant="stat" />
            <SkeletonCard variant="stat" />
            <SkeletonCard variant="stat" />
          </>
        ) : (
          <>
            <Card icon={<Package className="w-8 h-8 text-primary-800" />} hover>
              <div>
                <p className="text-3xl font-bold text-gray-700">
                  {totalStock.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">Total Stock</p>
              </div>
            </Card>
            <Card
              icon={<DollarSign className="w-8 h-8 text-green-600" />}
              hover
            >
              <div>
                <p className="text-3xl font-bold text-gray-700">
                  ₦{formatCurrency(totalValue)}
                </p>
                <p className="text-sm text-gray-500">Total Value</p>
              </div>
            </Card>
            <Card
              icon={<TrendingUp className="w-8 h-8 text-blue-600" />}
              hover
            >
              <div>
                <p className="text-3xl font-bold text-gray-700">
                  {totalProducts}
                </p>
                <p className="text-sm text-gray-500">Total Products</p>
              </div>
            </Card>
            <Card
              icon={<Warehouse className="w-8 h-8 text-orange-600" />}
              hover
            >
              <div>
                <p className="text-3xl font-bold text-gray-700">
                  {totalGodowns}
                </p>
                <p className="text-sm text-gray-500">Godowns</p>
              </div>
            </Card>
          </>
        )}
      </div>

      <FilterBar
        onSearch={setSearch}
        placeholder="Search by product, category, or godown... (Ctrl+K)"
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
            onClick={handlePrint}
          >
            Print
          </Button>
        </div>
      </FilterBar>

      <Table
        data={paginatedData}
        columns={columns}
        loading={initialLoading || loading}
        pagination={{
          currentPage,
          totalPages,
          pageSize,
          totalItems: filteredData.length,
          onPageChange: setCurrentPage,
          onPageSizeChange: (size) => {
            setPageSize(size);
            setCurrentPage(1);
          },
        }}
        summaryRow={{
          id: <span className="font-bold">{filteredData.length}</span>,
          godownName: "",
          categoryName: <span className="font-semibold">Total</span>,
          productName: "",
          opening: (
            <span className="font-bold">{totals.opening.toLocaleString()}</span>
          ),
          add: (
            <span className="font-bold">{totals.add.toLocaleString()}</span>
          ),
          purchase: (
            <span className="font-bold">{totals.purchase.toLocaleString()}</span>
          ),
          sales: (
            <span className="font-bold">{totals.sales.toLocaleString()}</span>
          ),
          production: (
            <span className="font-bold">
              {totals.production.toLocaleString()}
            </span>
          ),
          productionStocks: (
            <span className="font-bold">
              {totals.productionStocks.toLocaleString()}
            </span>
          ),
          stock: (
            <span className="font-bold">{totals.stock.toLocaleString()}</span>
          ),
          avgPrice: "",
          totalPrice: (
            <span className="font-bold">
              ₦{formatCurrency(totals.totalPrice)}
            </span>
          ),
        }}
      />
    </div>
  );
};

export default GodownStocks;