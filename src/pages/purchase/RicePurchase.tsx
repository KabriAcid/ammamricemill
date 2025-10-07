import { useEffect, useState, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { FilterBar } from "../../components/ui/FilterBar";
import {
  Plus,
  Trash2,
  ShoppingBag,
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
import { formatCurrency, formatNumber } from "../../utils/formatters";
import PaddyPurchaseForm from "./PaddyPurchaseForm";

// TypeScript Interfaces
interface PurchaseItem {
  id: string;
  categoryId: string;
  productId: string;
  godownId: string;
  quantity: number;
  netWeight: number;
  rate: number;
  totalPrice: number;
}

export interface Purchase {
  id: string;
  invoiceNo: string;
  date: string;
  challanNo: string;
  partyId: string;
  partyName?: string;
  transportInfo: string;
  notes: string;
  items: PurchaseItem[];
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

type Column = {
  key: keyof Purchase | string;
  label: string;
  width?: string;
  sortable?: boolean;
  render?: (value: any, row?: Purchase) => ReactNode;
};

const RicePurchase = () => {
  // State Management
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState<Purchase | null>(null);
  const [data, setData] = useState<Purchase[]>([]);
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

  // Fetch rice purchases
  const fetchPurchases = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (dateRange.from) params.append("from", dateRange.from);
      if (dateRange.to) params.append("to", dateRange.to);

      const response = await api.get<ApiResponse<Purchase[]>>(
        `/purchase/rice?${params}`
      );

      if (response.success && response.data) {
        setData(
          response.data.map((item) => ({ ...item, id: String(item.id) }))
        );
      }
    } catch (error) {
      console.error("Error fetching rice purchases:", error);
      showToast("Failed to load rice purchases", "error");
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  // Refresh with animation
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchPurchases();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // Initial data load
  useEffect(() => {
    fetchPurchases();
  }, []);

  // Reload when date range changes
  useEffect(() => {
    if (!initialLoading) {
      fetchPurchases();
    }
  }, [dateRange]);

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
  const filteredData = data.filter((purchase) => {
    const query = search.toLowerCase().trim();
    const matchesSearch =
      !query ||
      purchase.invoiceNo.toLowerCase().includes(query) ||
      purchase.challanNo?.toLowerCase().includes(query) ||
      purchase.partyName?.toLowerCase().includes(query) ||
      purchase.partyId?.toLowerCase().includes(query) ||
      false;

    const matchesDateRange =
      (!dateRange.from || purchase.date >= dateRange.from) &&
      (!dateRange.to || purchase.date <= dateRange.to);

    return matchesSearch && matchesDateRange;
  });

  // Pagination
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = filteredData.slice(startIndex, startIndex + pageSize);

  // Calculate stats from filtered data
  const stats = {
    totalPurchases: filteredData.length,
    totalQuantity: filteredData.reduce((sum, p) => sum + p.totalQuantity, 0),
    totalAmount: filteredData.reduce((sum, p) => sum + p.totalAmount, 0),
    totalBalance: filteredData.reduce((sum, p) => sum + p.currentBalance, 0),
  };

  // CRUD Operations
  const handleDelete = async (ids: string[]) => {
    if (
      !confirm(`Are you sure you want to delete ${ids.length} purchase(s)?`)
    ) {
      return;
    }

    setLoading(true);
    try {
      const response = await api.delete<ApiResponse<void>>("/purchase/rice", {
        ids,
      });

      if (response.success) {
        showToast(
          response.message || "Purchases deleted successfully",
          "success"
        );
        await fetchPurchases();
        setSelectedRows([]);
      }
    } catch (error) {
      console.error("Error deleting purchases:", error);
      showToast("Failed to delete purchases", "error");
    } finally {
      setLoading(false);
    }
  };

  // Handlers
  const handleNew = () => {
    setEditingPurchase(null);
    setIsFormOpen(true);
  };

  const handleEdit = (row: Purchase) => {
    setEditingPurchase(row);
    setIsFormOpen(true);
  };

  const handleView = (row: Purchase) => {
    navigate(`/purchase/rice-purchase/${row.id}`);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingPurchase(null);
  };

  const handleSavePurchase = async (payload: Partial<Purchase>) => {
    try {
      if (editingPurchase) {
        const response = await api.put<ApiResponse<Purchase>>(
          `/purchase/rice/${editingPurchase.id}`,
          payload
        );
        if (response.success) {
          showToast(
            response.message || "Purchase updated successfully",
            "success"
          );
          await fetchPurchases();
          handleCloseForm();
        } else {
          throw new Error(response.error || "Failed to update purchase");
        }
      } else {
        const response = await api.post<ApiResponse<Purchase>>(
          `/purchase/rice`,
          payload
        );
        if (response.success) {
          showToast(
            response.message || "Purchase created successfully",
            "success"
          );
          await fetchPurchases();
          handleCloseForm();
        } else {
          throw new Error(response.error || "Failed to create purchase");
        }
      }
    } catch (err) {
      console.error("Error saving purchase:", err);
      showToast("Failed to save purchase", "error");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Table columns
  const columns: Column[] = [
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
      render: (value: number) => `${formatNumber(value || 0, 0)} Bags`,
    },
    {
      key: "totalNetWeight",
      label: "Net Weight",
      render: (value: number) => `${formatNumber(value || 0, 2)} Kg`,
    },
    {
      key: "totalAmount",
      label: "Total",
      render: (value: number) => `₦${formatCurrency(value || 0)}`,
    },
    {
      key: "paidAmount",
      label: "Paid",
      render: (value: number) => `₦${formatCurrency(value || 0)}`,
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
          ₦{formatCurrency(value || 0)}
        </span>
      ),
    },
  ];

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Rice Purchase Management
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage and track all rice purchases
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
              icon={<ShoppingBag className="w-8 h-8 text-primary-800" />}
              hover
            >
              <div>
                <p className="text-3xl font-bold text-gray-700">
                  {stats.totalPurchases}
                </p>
                <p className="text-sm text-gray-500">Total Purchases</p>
              </div>
            </Card>
            <Card icon={<Package className="w-8 h-8 text-blue-600" />} hover>
              <div>
                <p className="text-3xl font-bold text-gray-700">
                  {formatNumber(stats.totalQuantity, 0)}
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
                  ₦{formatCurrency(stats.totalAmount)}
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
                  ₦{formatCurrency(stats.totalBalance)}
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
            New Purchase
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
      <PaddyPurchaseForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSave={handleSavePurchase}
        item={editingPurchase}
      />

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={
                      selectedRows.length === paginatedData.length &&
                      paginatedData.length > 0
                    }
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedRows(paginatedData.map((item) => item.id));
                      } else {
                        setSelectedRows([]);
                      }
                    }}
                    className="rounded border-gray-300"
                  />
                </th>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    style={{ width: col.width }}
                  >
                    {col.label}
                  </th>
                ))}
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {initialLoading || loading ? (
                <tr>
                  <td
                    colSpan={columns.length + 2}
                    className="px-3 py-8 text-center"
                  >
                    <div className="flex items-center justify-center">
                      <RefreshCcw className="w-6 h-6 animate-spin text-gray-400" />
                      <span className="ml-2 text-sm text-gray-500">
                        Loading purchases...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + 2}
                    className="px-3 py-8 text-center"
                  >
                    <p className="text-sm text-gray-500">No purchases found</p>
                  </td>
                </tr>
              ) : (
                paginatedData.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50">
                    <td className="px-3 py-4">
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(row.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedRows([...selectedRows, row.id]);
                          } else {
                            setSelectedRows(
                              selectedRows.filter((id) => id !== row.id)
                            );
                          }
                        }}
                        className="rounded border-gray-300"
                      />
                    </td>
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className="px-3 py-4 whitespace-nowrap text-sm text-gray-900"
                      >
                        {col.render
                          ? col.render((row as any)[col.key], row)
                          : (row as any)[col.key] || "-"}
                      </td>
                    ))}
                    <td className="px-3 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleView(row)}
                          className="text-primary-600 hover:text-primary-900"
                          title="View"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleEdit(row)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Edit"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!initialLoading && !loading && paginatedData.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {startIndex + 1} to{" "}
              {Math.min(startIndex + pageSize, filteredData.length)} of{" "}
              {filteredData.length} entries
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="input-base text-sm"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RicePurchase;
