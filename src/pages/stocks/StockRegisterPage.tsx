import { useState, useEffect } from "react";
import { Printer, FileText, TrendingUp, TrendingDown, Package, RefreshCcw } from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Table } from "../../components/ui/Table";
import { FilterBar } from "../../components/ui/FilterBar";
import { SkeletonCard } from "../../components/ui/Skeleton";
import { useToast } from "../../components/ui/Toast";
import { api } from "../../utils/fetcher";
import { ApiResponse } from "../../types";

interface StockRegisterEntry {
  id: string;
  date: string;
  transactionType: string;
  referenceNo: string;
  productId: string;
  productName: string;
  categoryId: string;
  categoryName: string;
  inQuantity: number;
  outQuantity: number;
  balanceQuantity: number;
  inWeight: number;
  outWeight: number;
  balanceWeight: number;
  rate: number;
  remarks: string;
}

interface Product {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
}

const StockRegister = () => {
  const [data, setData] = useState<StockRegisterEntry[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [productFilter, setProductFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const { showToast } = useToast();

  const fetchStockRegister = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (productFilter) params.append("product_id", productFilter);
      if (categoryFilter) params.append("category_id", categoryFilter);
      if (dateRange.from) params.append("from_date", dateRange.from);
      if (dateRange.to) params.append("to_date", dateRange.to);

      const response = await api.get<ApiResponse<StockRegisterEntry[]>>(
        `/stocks/register?${params.toString()}`
      );

      if (response.success && response.data) {
        setData(
          response.data.map((item) => ({ ...item, id: String(item.id) }))
        );
      }
    } catch (error) {
      console.error("Error fetching stock register:", error);
      showToast("Failed to load stock register", "error");
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await api.get<ApiResponse<Product[]>>("/products");
      if (response.success && response.data) {
        setProducts(
          response.data.map((p) => ({ id: String(p.id), name: p.name }))
        );
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get<ApiResponse<Category[]>>("/categories");
      if (response.success && response.data) {
        setCategories(
          response.data.map((c) => ({ id: String(c.id), name: c.name }))
        );
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchStockRegister();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  useEffect(() => {
    fetchStockRegister();
    fetchProducts();
    fetchCategories();
  }, []);

  useEffect(() => {
    if (!initialLoading) {
      fetchStockRegister();
    }
  }, [productFilter, categoryFilter, dateRange.from, dateRange.to]);

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
      item.referenceNo?.toLowerCase().includes(query) ||
      item.productName?.toLowerCase().includes(query) ||
      item.categoryName?.toLowerCase().includes(query) ||
      item.transactionType?.toLowerCase().includes(query) ||
      false
    );
  });

  const totalPages = Math.ceil(filteredData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = filteredData.slice(startIndex, startIndex + pageSize);

  const totalEntries = filteredData.length;
  const totalIn = filteredData.reduce((sum, s) => sum + s.inQuantity, 0);
  const totalOut = filteredData.reduce((sum, s) => sum + s.outQuantity, 0);
  const currentBalance = filteredData.length > 0 ? filteredData[filteredData.length - 1].balanceQuantity : 0;

  const handlePrint = () => {
    window.print();
  };

  const columns = [
    { key: "id", label: "#", width: "60px" },
    {
      key: "date",
      label: "Date",
      sortable: true,
      render: (value: string) =>
        new Date(value).toLocaleDateString("en-NG", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
    },
    { key: "transactionType", label: "Type", sortable: true },
    { key: "referenceNo", label: "Reference No" },
    { key: "productName", label: "Product", sortable: true },
    { key: "categoryName", label: "Category" },
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

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Stock Register</h1>
          <p className="mt-1 text-sm text-gray-500">
            View detailed stock movement history and transactions.
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
            <Card icon={<FileText className="w-8 h-8 text-primary-800" />} hover>
              <div>
                <p className="text-3xl font-bold text-gray-700">
                  {totalEntries}
                </p>
                <p className="text-sm text-gray-500">Total Entries</p>
              </div>
            </Card>
            <Card icon={<TrendingUp className="w-8 h-8 text-blue-600" />} hover>
              <div>
                <p className="text-3xl font-bold text-gray-700">
                  {totalIn.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">Total In</p>
              </div>
            </Card>
            <Card icon={<TrendingDown className="w-8 h-8 text-orange-600" />} hover>
              <div>
                <p className="text-3xl font-bold text-gray-700">
                  {totalOut.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">Total Out</p>
              </div>
            </Card>
            <Card icon={<Package className="w-8 h-8 text-green-600" />} hover>
              <div>
                <p className="text-3xl font-bold text-gray-700">
                  {currentBalance.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">Current Balance</p>
              </div>
            </Card>
          </>
        )}
      </div>

      <FilterBar
        onSearch={setSearch}
        placeholder="Search by reference, product, category, or type... (Ctrl+K)"
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
            placeholder="From"
          />
          <input
            type="date"
            value={dateRange.to}
            onChange={(e) =>
              setDateRange((prev) => ({ ...prev, to: e.target.value }))
            }
            className="input-base h-9"
            placeholder="To"
          />
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
      />
    </div>
  );
};

export default StockRegister;