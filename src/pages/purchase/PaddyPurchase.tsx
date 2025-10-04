import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Trash2,
  Printer,
  ShoppingBag,
  PackageCheck,
  DollarSign,
  ArrowDownCircle,
} from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Table } from "../../components/ui/Table";
import { FilterBar } from "../../components/ui/FilterBar";

import { Purchase } from "../../types/purchase";
import { format } from "date-fns";
import { fetcher } from "../../utils/fetcher";
import { useToast } from "../../components/ui/Toast";
import PaddyPurchaseForm from "./PaddyPurchaseForm";

const PaddyPurchase: React.FC = () => {
  const { showToast } = useToast();

  // State management
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [selectedPurchases, setSelectedPurchases] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalPurchases: 0,
    totalQuantity: 0,
    totalAmount: 0,
    totalBalance: 0,
  });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState<Purchase | null>(null);
  const navigate = useNavigate();

  // Fetch purchases
  const fetchPurchases = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (dateRange.from) queryParams.append("fromDate", dateRange.from);
      if (dateRange.to) queryParams.append("toDate", dateRange.to);

      const url = `/purchase/paddy${
        queryParams.toString() ? `?${queryParams.toString()}` : ""
      }`;

      const response = (await fetcher(url)) as any;

      if (response.success && response.data) {
        setPurchases(response.data);
        showToast("Purchases loaded successfully", "success");
      } else {
        throw new Error(response.error || "Failed to fetch purchases");
      }
    } catch (error) {
      console.error("Error fetching purchases:", error);
      showToast("Failed to load purchases", "error");
    } finally {
      setLoading(false);
    }
  };

  // Fetch statistics
  const fetchStats = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (dateRange.from) queryParams.append("fromDate", dateRange.from);
      if (dateRange.to) queryParams.append("toDate", dateRange.to);

      const url = `/purchase/paddy/statistics/summary${
        queryParams.toString() ? `?${queryParams.toString()}` : ""
      }`;

      const response = (await fetcher(url)) as any;

      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  useEffect(() => {
    fetchPurchases();
    fetchStats();
  }, [dateRange]);

  // Filtering logic
  const filteredPurchases = purchases.filter((purchase) => {
    const matchesSearch = purchase.invoiceNo
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesDateRange =
      (!dateRange.from || purchase.date >= dateRange.from) &&
      (!dateRange.to || purchase.date <= dateRange.to);
    return matchesSearch && matchesDateRange;
  });

  // Pagination
  const totalPages = Math.ceil(filteredPurchases.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedPurchases = filteredPurchases.slice(
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
    { key: "partyName", label: "Party", sortable: true },
    {
      key: "totalQuantity",
      label: "Quantity",
      render: (value: number) => value?.toLocaleString() || "0",
    },
    {
      key: "totalNetWeight",
      label: "Weight (kg)",
      render: (value: number) => value?.toLocaleString() || "0",
    },
    {
      key: "totalAmount",
      label: "Total",
      render: (value: number) => `₦${value?.toLocaleString() || "0"}`,
    },
    {
      key: "paidAmount",
      label: "Paid",
      render: (value: number) => `₦${value?.toLocaleString() || "0"}`,
    },
    {
      key: "currentBalance",
      label: "Balance",
      render: (value: number) => `₦${value?.toLocaleString() || "0"}`,
    },
    {
      key: "status",
      label: "Status",
      render: (value: string) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            value === "completed"
              ? "bg-green-100 text-green-700"
              : value === "cancelled"
              ? "bg-red-100 text-red-700"
              : "bg-yellow-100 text-yellow-700"
          }`}
        >
          {value || "pending"}
        </span>
      ),
    },
  ];

  // Action handlers
  const handleDelete = async (purchaseIds: string[]) => {
    if (
      confirm(
        `Are you sure you want to delete ${purchaseIds.length} purchase(s)?`
      )
    ) {
      setLoading(true);
      try {
        const response = (await fetcher(`/purchase/paddy`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids: purchaseIds }),
        })) as any;

        if (response.success) {
          setPurchases((prev) =>
            prev.filter((purchase) => !purchaseIds.includes(purchase.id))
          );
          setSelectedPurchases([]);
          showToast(
            response.message || "Purchases deleted successfully",
            "success"
          );
        } else {
          throw new Error(response.error || "Failed to delete purchases");
        }
      } catch (error) {
        console.error("Error deleting purchases:", error);
        showToast("Failed to delete purchases", "error");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleView = (purchase: Purchase) => {
    navigate(`/purchases/${purchase.id}`);
  };

  const handleNewPurchase = () => {
    setEditingPurchase(null);
    setIsFormOpen(true);
  };

  const handleEditPurchase = (purchase: Purchase) => {
    setEditingPurchase(purchase);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingPurchase(null);
  };

  const handleSavePurchase = async (data: Partial<Purchase>) => {
    try {
      if (editingPurchase) {
        // Update existing purchase
        const response = (await fetcher(
          `/purchase/paddy/${editingPurchase.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          }
        )) as any;

        if (response.success) {
          showToast(
            response.message || "Purchase updated successfully",
            "success"
          );
          fetchPurchases(); // Refresh the list
          handleCloseForm();
        } else {
          throw new Error(response.error || "Failed to update purchase");
        }
      } else {
        // Create new purchase
        const response = (await fetcher(`/purchase/paddy`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        })) as any;

        if (response.success) {
          showToast(
            response.message || "Purchase created successfully",
            "success"
          );
          fetchPurchases(); // Refresh the list
          handleCloseForm();
        } else {
          throw new Error(response.error || "Failed to create purchase");
        }
      }
    } catch (error) {
      console.error("Error saving purchase:", error);
      showToast("Failed to save purchase", "error");
    }
  };

  const loadingCards = loading && !purchases.length;

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Purchase Management
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage purchase orders and transactions.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card icon={<ShoppingBag size={32} />} loading={loadingCards} hover>
          <div>
            <p className="text-3xl font-bold text-gray-700">
              {stats.totalPurchases}
            </p>
            <p className="text-sm text-gray-500">Total Purchases</p>
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
        <Card icon={<DollarSign size={32} />} loading={loadingCards} hover>
          <div>
            <p className="text-3xl font-bold text-gray-700">
              ₦{stats.totalAmount.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500">Total Amount</p>
          </div>
        </Card>
        <Card icon={<ArrowDownCircle size={32} />} loading={loadingCards} hover>
          <div>
            <p className="text-3xl font-bold text-gray-700">
              ₦{stats.totalBalance.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500">Total Balance</p>
          </div>
        </Card>
      </div>

      {/* Filter Bar */}
      <FilterBar
        onSearch={setSearchQuery}
        placeholder="Search by invoice number..."
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
          <Button onClick={handleNewPurchase} icon={Plus} size="sm">
            New Purchase
          </Button>
          {selectedPurchases.length > 0 && (
            <Button
              variant="danger"
              size="sm"
              icon={Trash2}
              onClick={() => handleDelete(selectedPurchases)}
              loading={loading}
            >
              Delete ({selectedPurchases.length})
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
        data={paginatedPurchases}
        columns={columns}
        loading={loading}
        pagination={{
          currentPage,
          totalPages,
          pageSize,
          totalItems: filteredPurchases.length,
          onPageChange: setCurrentPage,
          onPageSizeChange: (size) => {
            setPageSize(size);
            setCurrentPage(1);
          },
        }}
        selection={{
          selectedItems: selectedPurchases,
          onSelectionChange: setSelectedPurchases,
        }}
        actions={{
          onView: handleView,
          onEdit: handleEditPurchase,
        }}
      />

      {/* Purchase Form Modal */}
      <PaddyPurchaseForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSave={handleSavePurchase}
        item={editingPurchase}
      />
    </div>
  );
};

export default PaddyPurchase;
