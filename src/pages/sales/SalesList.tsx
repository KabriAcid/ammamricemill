import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Button } from "../../components/ui/Button";
import { Table } from "../../components/ui/Table";
import { Card } from "../../components/ui/Card";
import { FilterBar } from "../../components/ui/FilterBar";
import {
  Plus,
  Trash2,
  ShoppingCart,
  Package,
  DollarSign,
  CreditCard,
  RefreshCcw,
  Printer,
} from "lucide-react";
import { SkeletonCard } from "../../components/ui/Skeleton";
import { useToast } from "../../components/ui/Toast";
import { api } from "../../utils/fetcher";
import { ApiResponse } from "../../types";

// TypeScript Interfaces
export interface SaleItem {
  id: string;
  categoryId: string;
  productId: string;
  godownId: string;
  quantity: number;
  netWeight: number;
  rate: number;
  totalPrice: number;
}

export interface Sale {
  id: string;
  invoiceNo: string;
  date: string;
  challanNo: string;
  partyId: string;
  partyName?: string;
  transportInfo: string;
  notes: string;
  items: SaleItem[];
  totalQuantity: number;
  totalNetWeight: number;
  invoiceAmount: number;
  discount: number;
  totalAmount: number;
  previousBalance: number;
  netPayable: number;
  paidAmount: number;
  currentBalance: number;
  createdAt: string;
  updatedAt: string;
}

interface SaleFormData {
  invoiceNo: string;
  date: string;
  challanNo: string;
  partyId: string;
  transportInfo: string;
  notes: string;
  items: SaleItem[];
  discount: number;
  paidAmount: number;
}

const SalesList = () => {
  // State Management
  const [data, setData] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [dateRange, setDateRange] = useState({ from: "", to: "" });

  const { showToast } = useToast();
  const navigate = useNavigate();

  // Fetch sales function
  const fetchSales = async () => {
    setLoading(true);
    try {
      const response = await api.get<ApiResponse<Sale[]>>("/sales");

      if (response.success && response.data) {
        setData(
          response.data.map((item) => ({ ...item, id: String(item.id) }))
        );
      }
    } catch (error) {
      console.error("Error fetching sales:", error);
      showToast("Failed to load sales", "error");
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  // Refresh with animation
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchSales();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // Initial data load
  useEffect(() => {
    fetchSales();
  }, []);

  // Keyboard shortcuts
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
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, []);

  // Reset pagination when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, dateRange]);

  // Live search filtering
  const filteredData = data.filter((sale) => {
    const query = search.toLowerCase().trim();
    const matchesSearch =
      !query ||
      sale.invoiceNo.toLowerCase().includes(query) ||
      sale.challanNo?.toLowerCase().includes(query) ||
      sale.partyId?.toLowerCase().includes(query) ||
      sale.partyName?.toLowerCase().includes(query) ||
      false;

    const matchesDateRange =
      (!dateRange.from || sale.date >= dateRange.from) &&
      (!dateRange.to || sale.date <= dateRange.to);

    return matchesSearch && matchesDateRange;
  });

  // Pagination
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = filteredData.slice(startIndex, startIndex + pageSize);

  // Calculate stats from filtered data
  const stats = {
    totalSales: filteredData.length,
    totalQuantity: filteredData.reduce((sum, s) => sum + s.totalQuantity, 0),
    totalAmount: filteredData.reduce((sum, s) => sum + s.totalAmount, 0),
    totalBalance: filteredData.reduce((sum, s) => sum + s.currentBalance, 0),
  };

  // CRUD Operations
  const handleDelete = async (ids: string[]) => {
    if (!confirm(`Are you sure you want to delete ${ids.length} sale(s)?`)) {
      return;
    }

    setLoading(true);
    try {
      const response = await api.delete<ApiResponse<void>>("/sales", { ids });

      if (response.success) {
        showToast(response.message || "Sales deleted successfully", "success");
        await fetchSales();
        setSelectedRows([]);
      }
    } catch (error) {
      console.error("Error deleting sales:", error);
      showToast("Failed to delete sales", "error");
    } finally {
      setLoading(false);
    }
  };

  // Handlers
  const handleNew = () => {
    navigate("/sales/new");
  };

  const handleEdit = (row: Sale) => {
    navigate(`/sales/edit/${row.id}`);
  };

  const handleView = (row: Sale) => {
    navigate(`/sales/${row.id}`);
  };

  const handlePrint = () => {
    window.print();
  };

  // Table columns
  const columns = [
    { key: "id", label: "#", width: "60px" },
    {
      key: "date",
      label: "Date",
      sortable: true,
      render: (value: string) => format(new Date(value), "dd/MM/yyyy"),
    },
    { key: "invoiceNo", label: "Invoice No", sortable: true },
    { key: "challanNo", label: "Challan No" },
    { key: "partyName", label: "Party", sortable: true },
    {
      key: "totalQuantity",
      label: "Quantity",
      render: (value: number) => `${value.toLocaleString()} Bags`,
    },
    {
      key: "totalNetWeight",
      label: "Net Weight",
      render: (value: number) => `${value.toLocaleString()} Kg`,
    },
    {
      key: "totalAmount",
      label: "Total",
      render: (value: number) => `₦${value.toLocaleString()}`,
    },
    {
      key: "paidAmount",
      label: "Paid",
      render: (value: number) => `₦${value.toLocaleString()}`,
    },
    {
      key: "currentBalance",
      label: "Balance",
      render: (value: number) => (
        <span
          className={`font-medium ${
            value > 0 ? "text-red-600" : "text-green-600"
          }`}
        >
          ₦{value.toLocaleString()}
        </span>
      ),
    },
  ];

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sales Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage and track all sales transactions
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-6">
        {initialLoading ? (
          <>
            <SkeletonCard variant="stat" />
            <SkeletonCard variant="stat" />
            <SkeletonCard variant="stat" />
            <SkeletonCard variant="stat" />
          </>
        ) : (
          <>
            <Card
              icon={<ShoppingCart className="w-8 h-8 text-primary-800" />}
              hover
            >
              <div>
                <p className="text-3xl font-bold text-gray-700">
                  {stats.totalSales}
                </p>
                <p className="text-sm text-gray-500">Total Sales</p>
              </div>
            </Card>
            <Card icon={<Package className="w-8 h-8 text-blue-600" />} hover>
              <div>
                <p className="text-3xl font-bold text-gray-700">
                  {stats.totalQuantity.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">Total Quantity (Bags)</p>
              </div>
            </Card>
            <Card
              icon={<DollarSign className="w-8 h-8 text-green-600" />}
              hover
            >
              <div>
                <p className="text-3xl font-bold text-gray-700">
                  ₦{stats.totalAmount.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">Total Amount</p>
              </div>
            </Card>
            <Card
              icon={<CreditCard className="w-8 h-8 text-orange-600" />}
              hover
            >
              <div>
                <p className="text-3xl font-bold text-gray-700">
                  ₦{stats.totalBalance.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">Total Balance</p>
              </div>
            </Card>
          </>
        )}
      </div>

      {/* Filter Bar */}
      <FilterBar
        onSearch={setSearch}
        placeholder="Search by invoice, challan, or party... (Ctrl+K)"
        value={search}
      >
        <div className="flex items-center space-x-2">
          <input
            type="date"
            value={dateRange.from}
            onChange={(e) =>
              setDateRange((prev) => ({ ...prev, from: e.target.value }))
            }
            className="input-base"
            placeholder="From Date"
          />
          <input
            type="date"
            value={dateRange.to}
            onChange={(e) =>
              setDateRange((prev) => ({ ...prev, to: e.target.value }))
            }
            className="input-base"
            placeholder="To Date"
          />
          <Button onClick={handleNew} icon={Plus} size="sm">
            New Sale
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

      {/* Table */}
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
        actions={{
          onEdit: handleEdit,
          onView: handleView,
        }}
      />
    </div>
  );
};

export default SalesList;
