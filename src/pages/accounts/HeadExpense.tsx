import { useEffect, useState, useCallback } from "react";
import { Button } from "../../components/ui/Button";
import { Table } from "../../components/ui/Table";
import { Modal } from "../../components/ui/Modal";
import { Card } from "../../components/ui/Card";
import { FilterBar } from "../../components/ui/FilterBar";
import { Plus, Trash2, ArrowUpCircle, TrendingUp } from "lucide-react";
import { useToast } from "../../components/ui/Toast";
import { SkeletonCard } from "../../components/ui/Skeleton";
import { api } from "../../utils/fetcher";
import { ApiResponse } from "../../types";

type ExpenseRow = {
  id: string;
  name: string;
  payments: number;
};

const HeadExpense = () => {
  const { showToast } = useToast();
  const [data, setData] = useState<ExpenseRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<ExpenseRow | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [formData, setFormData] = useState({ name: "" });

  const fetchExpenseHeads = async () => {
    setLoading(true);
    try {
      const response = await api.get<ApiResponse<ExpenseRow[]>>(
        "/accounts/head-expense"
      );
      if (response.success && response.data) {
        setData(response.data);
      } else {
        throw new Error("Failed to load expense heads");
      }
    } catch (error) {
      console.error("Error fetching expense heads:", error);
      showToast("Failed to load expense heads", "error");
      setData([]);
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenseHeads();
  }, []);

  // Keyboard shortcuts
  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    if ((event.ctrlKey || event.metaKey) && event.key === "f") {
      event.preventDefault();
      document.querySelector<HTMLInputElement>('input[type="search"]')?.focus();
    }
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [handleKeyPress]);

  // Filter data
  const filteredData = data.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = filteredData.slice(startIndex, startIndex + pageSize);

  // Create
  const handleCreate = async () => {
    if (!formData.name.trim()) {
      showToast("Expense head name is required", "error");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post<ApiResponse<ExpenseRow>>(
        "/accounts/head-expense",
        formData
      );

      if (response.success) {
        showToast(
          response.message || "Expense head created successfully",
          "success"
        );
        setModalOpen(false);
        setFormData({ name: "" });
        await fetchExpenseHeads();
      } else {
        throw new Error("Failed to create expense head");
      }
    } catch (error) {
      console.error("Error creating expense head:", error);
      showToast("Failed to create expense head", "error");
    } finally {
      setLoading(false);
    }
  };

  // Update
  const handleUpdate = async () => {
    if (!editItem) return;
    if (!formData.name.trim()) {
      showToast("Expense head name is required", "error");
      return;
    }

    setLoading(true);
    try {
      const response = await api.put<ApiResponse<ExpenseRow>>(
        `/accounts/head-expense/${editItem.id}`,
        formData
      );

      if (response.success) {
        showToast(
          response.message || "Expense head updated successfully",
          "success"
        );
        setModalOpen(false);
        setEditItem(null);
        setFormData({ name: "" });
        await fetchExpenseHeads();
      } else {
        throw new Error("Failed to update expense head");
      }
    } catch (error) {
      console.error("Error updating expense head:", error);
      showToast("Failed to update expense head", "error");
    } finally {
      setLoading(false);
    }
  };

  // Delete (single or bulk)
  const handleDelete = async (ids: string[]) => {
    setLoading(true);
    try {
      const response = await api.delete<ApiResponse<void>>(
        "/accounts/head-expense",
        { ids }
      );

      if (response.success) {
        showToast(
          response.message || "Expense head(s) deleted successfully",
          "success"
        );
        setSelectedRows([]);
        await fetchExpenseHeads();
      } else {
        throw new Error("Failed to delete expense head(s)");
      }
    } catch (error) {
      console.error("Error deleting expense heads:", error);
      showToast("Failed to delete expense heads", "error");
    } finally {
      setLoading(false);
    }
  };

  // Table columns
  const columns = [
    { key: "name", label: "Head Name", sortable: true },
    {
      key: "payments",
      label: "Payments",
      render: (value: number | string) => {
        const amount = typeof value === "string" ? parseFloat(value) : value;
        return `₦${amount.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`;
      },
    },
  ];

  const totalPayments = data.reduce((sum, d) => {
    const amount =
      typeof d.payments === "string" ? parseFloat(d.payments) : d.payments;
    return sum + (amount || 0);
  }, 0);

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Expense Head Management
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your expense heads and monitor total payments.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {initialLoading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
            <Card icon={<ArrowUpCircle size={32} />} hover>
              <div>
                <p className="text-3xl font-bold text-gray-700">
                  ₦
                  {totalPayments.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
                <p className="text-sm text-gray-500">Total Payments</p>
              </div>
            </Card>
            <Card icon={<TrendingUp size={32} />} hover>
              <div>
                <p className="text-3xl font-bold text-gray-700">
                  {data.length}
                </p>
                <p className="text-sm text-gray-500">Total Heads</p>
              </div>
            </Card>
          </>
        )}
      </div>
      <Card>
        <FilterBar
          onSearch={setSearchQuery}
          placeholder="Search by expense head name... (Ctrl+F)"
        >
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => {
                setEditItem(null);
                setFormData({ name: "" });
                setModalOpen(true);
              }}
              icon={Plus}
              size="sm"
            >
              New
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
          </div>
        </FilterBar>

        <Table
          data={paginatedData}
          columns={columns}
          loading={loading}
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
            onEdit: (row) => {
              setEditItem(row);
              setFormData({ name: row.name });
              setModalOpen(true);
            },
          }}
          summaryRow={{
            name: "Total",
            payments: `₦${totalPayments.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`,
          }}
        />
      </Card>
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editItem ? "Edit Expense Head" : "New Expense Head"}
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Head Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              className="input-base"
              placeholder="Enter head name"
              required
            />
          </div>
          {/* Payments input removed: payments are calculated from transactions, not user input */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={editItem ? handleUpdate : handleCreate}
              loading={loading}
            >
              {editItem ? "Update" : "Save"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default HeadExpense;
