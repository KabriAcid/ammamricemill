import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Trash2,
  Printer,
  Package,
  PackageCheck,
  Scale,
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

interface AddStock {
  id: string;
  date: string;
  productId: string;
  productName: string;
  godownId: string;
  godownName: string;
  quantity: number;
  netWeight: number;
  rate: number;
  totalPrice: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

interface Product {
  id: string;
  name: string;
}

const AddStocksList = () => {
  const [data, setData] = useState<AddStock[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [productFilter, setProductFilter] = useState("");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const { showToast } = useToast();
  const navigate = useNavigate();

  const fetchAddStocks = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (productFilter) params.append("product_id", productFilter);
      if (dateRange.from) params.append("from_date", dateRange.from);
      if (dateRange.to) params.append("to_date", dateRange.to);

      const response = await api.get<ApiResponse<AddStock[]>>(
        `/stocks/add-stocks?${params.toString()}`
      );

      if (response.success && response.data) {
        setData(
          response.data.map((item) => ({ ...item, id: String(item.id) }))
        );
      }
    } catch (error) {
      console.error("Error fetching add stocks:", error);
      showToast("Failed to load add stocks", "error");
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

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchAddStocks();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  useEffect(() => {
    fetchAddStocks();
    fetchProducts();
  }, []);

  useEffect(() => {
    if (!initialLoading) {
      fetchAddStocks();
    }
  }, [productFilter, dateRange.from, dateRange.to]);

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
      item.godownName?.toLowerCase().includes(query) ||
      item.notes?.toLowerCase().includes(query) ||
      false
    );
  });

  const totalPages = Math.ceil(filteredData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = filteredData.slice(startIndex, startIndex + pageSize);

  const totalEntries = filteredData.length;
  const totalQuantity = filteredData.reduce((sum, s) => sum + s.quantity, 0);
  const totalWeight = filteredData.reduce((sum, s) => sum + s.netWeight, 0);
  const totalValue = filteredData.reduce((sum, s) => sum + s.totalPrice, 0);

  const totals = {
    quantity: filteredData.reduce((sum, s) => sum + s.quantity, 0),
    netWeight: filteredData.reduce((sum, s) => sum + s.netWeight, 0),
    totalPrice: filteredData.reduce((sum, s) => sum + s.totalPrice, 0),
  };

  const handleDelete = async (ids: string[]) => {
    if (
      !confirm(
        `Are you sure you want to delete ${ids.length} stock entry(ies)?`
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      const response = await api.delete<ApiResponse<void>>(
        "/stocks/add-stocks",
        {
          ids,
        }
      );

      if (response.success) {
        showToast(
          response.message || "Stock entries deleted successfully",
          "success"
        );
        await fetchAddStocks();
        setSelectedRows([]);
      }
    } catch (error) {
      console.error("Error deleting add stocks:", error);
      showToast("Failed to delete stock entries", "error");
    } finally {
      setLoading(false);
    }
  };

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
    { key: "productName", label: "Product", sortable: true },
    { key: "godownName", label: "Godown" },
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
          <h1 className="text-3xl font-bold text-gray-900">Add Stocks List</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage manual stock additions and adjustments.  
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
                  {totalEntries}
                </p>
                <p className="text-sm text-gray-500">Total Entries</p>
              </div>
            </Card>
            <Card
              icon={<PackageCheck className="w-8 h-8 text-blue-600" />}
              hover
            >
              <div>
                <p className="text-3xl font-bold text-gray-700">
                  {totalQuantity.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">Total Quantity</p>
              </div>
            </Card>
            <Card icon={<Scale className="w-8 h-8 text-orange-600" />} hover>
              <div>
                <p className="text-3xl font-bold text-gray-700">
                  {totalWeight.toLocaleString()} Kg
                </p>
                <p className="text-sm text-gray-500">Total Weight</p>
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
          </>
        )}
      </div>

      <FilterBar
        onSearch={setSearch}
        placeholder="Search by product, godown, or notes... (Ctrl+K)"
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
            onClick={() => navigate("/stocks/add-stocks/new")}
            icon={Plus}
            size="sm"
          >
            New Stock
          </Button>
          {selectedRows.length > 0 && (
            <Button
              variant="danger"
              size="sm"
              icon={Trash2}
              onClick={() => handleDelete(selectedRows)}
              loading={loading}
            >
              Delete ({selectedRows.length})
            </Button>
          )}
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
        selection={{
          selectedItems: selectedRows,
          onSelectionChange: setSelectedRows,
        }}
        summaryRow={{
          id: <span className="font-bold">{filteredData.length}</span>,
          date: "",
          productName: <span className="font-semibold">Total</span>,
          godownName: "",
          quantity: (
            <span className="font-bold">
              {totals.quantity.toLocaleString()}
            </span>
          ),
          netWeight: (
            <span className="font-bold">
              {totals.netWeight.toLocaleString()}
            </span>
          ),
          rate: "",
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

export default AddStocksList;
