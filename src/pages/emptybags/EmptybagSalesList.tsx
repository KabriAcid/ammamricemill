import { useEffect, useState } from "react";
import { Button } from "../../components/ui/Button";
import { Table } from "../../components/ui/Table";
import { Modal } from "../../components/ui/Modal";
import { Card } from "../../components/ui/Card";
import { FilterBar } from "../../components/ui/FilterBar";
import {
  Plus,
  Trash2,
  PackageCheck,
  Printer,
  RefreshCcw,
  Package,
  DollarSign,
} from "lucide-react";
import { SkeletonCard } from "../../components/ui/Skeleton";
import { useToast } from "../../components/ui/Toast";
import { api } from "../../utils/fetcher";
import { ApiResponse } from "../../types";

// TypeScript Interfaces
export interface EmptybagSale {
  id: string;
  date: string;
  invoiceNo: string;
  party: string;
  items: number;
  quantity: number;
  price: number;
  description: string;
}

interface EmptybagSaleFormData {
  date: string;
  invoiceNo: string;
  party: string;
  items: number;
  quantity: number;
  price: number;
  description: string;
}

const EmptybagSalesList = () => {
  // State Management
  const [data, setData] = useState<EmptybagSale[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<EmptybagSale | null>(null);
  const [formData, setFormData] = useState<EmptybagSaleFormData>({
    date: "",
    invoiceNo: "",
    party: "",
    items: 0,
    quantity: 0,
    price: 0,
    description: "",
  });
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const { showToast } = useToast();

  // Fetch emptybag sales
  const fetchSales = async () => {
    setLoading(true);
    try {
      const response = await api.get<ApiResponse<EmptybagSale[]>>(
        "/emptybag-sales"
      );

      if (response.success && response.data) {
        setData(
          response.data.map((item) => ({ ...item, id: String(item.id) }))
        );
      }
    } catch (error) {
      console.error("Error fetching emptybag sales:", error);
      showToast("Failed to load emptybag sales", "error");
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
  }, [search]);

  // Live search filtering
  const filteredData = data.filter((item) => {
    const query = search.toLowerCase().trim();
    if (!query) return true;

    return (
      item.invoiceNo.toLowerCase().includes(query) ||
      item.party.toLowerCase().includes(query) ||
      item.description?.toLowerCase().includes(query) ||
      false
    );
  });

  // Pagination
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = filteredData.slice(startIndex, startIndex + pageSize);

  // Calculate stats from filtered data
  const totalSales = filteredData.length;
  const totalQuantity = filteredData.reduce(
    (sum, d) => sum + (d.quantity || 0),
    0
  );
  const totalPrice = filteredData.reduce((sum, d) => sum + (d.price || 0), 0);

  // CRUD Operations
  const handleCreate = async () => {
    // Validation
    if (!formData.date) {
      showToast("Date is required", "error");
      return;
    }

    if (!formData.invoiceNo.trim()) {
      showToast("Invoice number is required", "error");
      return;
    }

    if (!formData.party.trim()) {
      showToast("Party is required", "error");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post<ApiResponse<EmptybagSale>>(
        "/emptybag-sales",
        formData
      );

      if (response.success) {
        showToast(response.message || "Sale created successfully", "success");
        await fetchSales();
        handleModalClose();
      }
    } catch (error) {
      console.error("Error creating sale:", error);
      showToast("Failed to create sale", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!editItem) return;

    // Validation
    if (!formData.date) {
      showToast("Date is required", "error");
      return;
    }

    if (!formData.invoiceNo.trim()) {
      showToast("Invoice number is required", "error");
      return;
    }

    if (!formData.party.trim()) {
      showToast("Party is required", "error");
      return;
    }

    setLoading(true);
    try {
      const response = await api.put<ApiResponse<EmptybagSale>>(
        `/emptybag-sales/${editItem.id}`,
        formData
      );

      if (response.success) {
        showToast(response.message || "Sale updated successfully", "success");
        await fetchSales();
        handleModalClose();
      }
    } catch (error) {
      console.error("Error updating sale:", error);
      showToast("Failed to update sale", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (ids: string[]) => {
    if (!confirm(`Are you sure you want to delete ${ids.length} sale(s)?`)) {
      return;
    }

    setLoading(true);
    try {
      const response = await api.delete<ApiResponse<void>>("/emptybag-sales", {
        ids,
      });

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
  const handleNewSale = () => {
    setEditItem(null);
    setFormData({
      date: new Date().toISOString().split("T")[0], // Today's date
      invoiceNo: "",
      party: "",
      items: 0,
      quantity: 0,
      price: 0,
      description: "",
    });
    setModalOpen(true);
  };

  const handleEdit = (row: EmptybagSale) => {
    setEditItem(row);
    setFormData({
      date: row.date,
      invoiceNo: row.invoiceNo,
      party: row.party,
      items: row.items || 0,
      quantity: row.quantity || 0,
      price: row.price || 0,
      description: row.description || "",
    });
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setEditItem(null);
    setFormData({
      date: "",
      invoiceNo: "",
      party: "",
      items: 0,
      quantity: 0,
      price: 0,
      description: "",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    editItem ? handleUpdate() : handleCreate();
  };

  const handlePrint = () => {
    window.print();
  };

  // Table columns
  const columns = [
    { key: "id", label: "#", width: "60px" },
    { key: "date", label: "Date", sortable: true },
    { key: "invoiceNo", label: "Invoice No", sortable: true },
    { key: "party", label: "Party", sortable: true },
    { key: "items", label: "Items" },
    { key: "quantity", label: "Quantity" },
    {
      key: "price",
      label: "Price",
      sortable: true,
      render: (value: number) => `₦${value.toLocaleString()}`,
    },
    { key: "description", label: "Description" },
  ];

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Empty Bag Sales List
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage empty bag sales, track quantities and revenue.
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
        {initialLoading ? (
          <>
            <SkeletonCard variant="stat" />
            <SkeletonCard variant="stat" />
            <SkeletonCard variant="stat" />
          </>
        ) : (
          <>
            <Card
              icon={<PackageCheck className="w-8 h-8 text-primary-800" />}
              hover
            >
              <div>
                <p className="text-3xl font-bold text-gray-700">{totalSales}</p>
                <p className="text-sm text-gray-500">Total Sales</p>
              </div>
            </Card>
            <Card icon={<Package className="w-8 h-8 text-blue-600" />} hover>
              <div>
                <p className="text-3xl font-bold text-gray-700">
                  {totalQuantity.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">Total Quantity</p>
              </div>
            </Card>
            <Card
              icon={<DollarSign className="w-8 h-8 text-green-600" />}
              hover
            >
              <div>
                <p className="text-3xl font-bold text-gray-700">
                  ₦{totalPrice.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">Total Revenue</p>
              </div>
            </Card>
          </>
        )}
      </div>

      {/* Filter Bar */}
      <FilterBar
        onSearch={setSearch}
        placeholder="Search by invoice no, party, or description... (Ctrl+K)"
      >
        <div className="flex items-center space-x-2">
          <Button onClick={handleNewSale} icon={Plus} size="sm">
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
        }}
        summaryRow={{
          id: <span className="font-bold">{filteredData.length}</span>,
          date: <span className="font-semibold">Total</span>,
          invoiceNo: "",
          party: "",
          items: "",
          quantity: (
            <span className="font-bold">{totalQuantity.toLocaleString()}</span>
          ),
          price: (
            <span className="font-bold">₦{totalPrice.toLocaleString()}</span>
          ),
          description: "",
        }}
      />

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={handleModalClose}
        title={editItem ? "Edit Sale" : "New Sale"}
        size="lg"
      >
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 required">
                Date
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, date: e.target.value }))
                }
                className="input-base"
                required
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 required">
                Invoice No
              </label>
              <input
                type="text"
                value={formData.invoiceNo}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    invoiceNo: e.target.value,
                  }))
                }
                className="input-base"
                placeholder="Enter invoice number"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 required">
              Party
            </label>
            <input
              type="text"
              value={formData.party}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, party: e.target.value }))
              }
              className="input-base"
              placeholder="Enter party name"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Items
              </label>
              <input
                type="number"
                value={formData.items || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    items: Number(e.target.value),
                  }))
                }
                className="input-base"
                placeholder="0"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity
              </label>
              <input
                type="number"
                value={formData.quantity || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    quantity: Number(e.target.value),
                  }))
                }
                className="input-base"
                placeholder="0"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price (₦)
              </label>
              <input
                type="number"
                value={formData.price || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    price: Number(e.target.value),
                  }))
                }
                className="input-base"
                placeholder="0"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              className="input-base"
              rows={3}
              placeholder="Enter description (optional)"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="outline" onClick={handleModalClose} type="button">
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              {editItem ? "Update" : "Save"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default EmptybagSalesList;
