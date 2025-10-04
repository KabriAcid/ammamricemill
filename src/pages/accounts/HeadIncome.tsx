import { useEffect, useState, useCallback } from "react";
import { Button } from "../../components/ui/Button";
import { Table } from "../../components/ui/Table";
import { Modal } from "../../components/ui/Modal";
import { Card } from "../../components/ui/Card";
import { FilterBar } from "../../components/ui/FilterBar";
import { Plus, Trash2, ArrowDownCircle, TrendingUp } from "lucide-react";
import { api } from "../../utils/fetcher";
import { useToast } from "../../components/ui/Toast";
import { SkeletonCard } from "../../components/ui/Skeleton";
import { ApiResponse } from "../../types";

type IncomeRow = {
  id: string;
  name: string;
  receives: number;
};

const HeadIncome = () => {
  const { showToast } = useToast();
  const [data, setData] = useState<IncomeRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<IncomeRow | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [formData, setFormData] = useState({ name: "", receives: 0 });

  const fetchIncomeHeads = async () => {
    setLoading(true);
    try {
      const response = await api.get<ApiResponse<IncomeRow[]>>(
        "/accounts/head-income"
      );
      if (response.success && response.data) {
        setData(response.data);
      } else {
        throw new Error("Failed to load income heads");
      }
    } catch (error) {
      console.error("Error fetching income heads:", error);
      showToast("Failed to load income heads", "error");
      setData([]);
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  // Fetch all income heads on component mount
  useEffect(() => {
    fetchIncomeHeads();
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

  // Create new income head
  const handleCreate = async () => {
    if (!formData.name.trim()) {
      showToast("Income head name is required", "error");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post<ApiResponse<IncomeRow>>(
        "/accounts/head-income",
        formData
      );

      if (response.success) {
        showToast(
          response.message || "Income head created successfully",
          "success"
        );
        setModalOpen(false);
        setFormData({ name: "", receives: 0 });
        await fetchIncomeHeads();
      } else {
        throw new Error("Failed to create income head");
      }
    } catch (error) {
      console.error("Error creating income head:", error);
      showToast("Failed to create income head", "error");
    } finally {
      setLoading(false);
    }
  };

  // Update income head
  const handleUpdate = async () => {
    if (!editItem) return;
    if (!formData.name.trim()) {
      showToast("Income head name is required", "error");
      return;
    }

    setLoading(true);
    try {
      const response = await api.put<ApiResponse<IncomeRow>>(
        `/accounts/head-income/${editItem.id}`,
        formData
      );

      if (response.success) {
        showToast(
          response.message || "Income head updated successfully",
          "success"
        );
        setModalOpen(false);
        setEditItem(null);
        setFormData({ name: "", receives: 0 });
        await fetchIncomeHeads();
      } else {
        throw new Error("Failed to update income head");
      }
    } catch (error) {
      console.error("Error updating income head:", error);
      showToast("Failed to update income head", "error");
    } finally {
      setLoading(false);
    }
  };

  // Delete income heads (single or bulk)
  const handleDelete = async (ids: string[]) => {
    setLoading(true);
    try {
      const response = await api.delete<ApiResponse<void>>(
        "/accounts/head-income",
        { ids }
      );

      if (response.success) {
        showToast(
          response.message || "Income head(s) deleted successfully",
          "success"
        );
        setSelectedRows([]);
        await fetchIncomeHeads();
      } else {
        throw new Error("Failed to delete income head(s)");
      }
    } catch (error) {
      console.error("Error deleting income heads:", error);
      showToast("Failed to delete income heads", "error");
    } finally {
      setLoading(false);
    }
  };

  // Table columns
  const columns = [
    { key: "name", label: "Head Name", sortable: true },
    {
      key: "receives",
      label: "Receives",
      render: (value: number | string) => {
        const numValue = typeof value === "string" ? parseFloat(value) : value;
        return `₦${numValue.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`;
      },
    },
  ];

  // Convert all receives values to numbers and calculate total
  const totalReceives = data.reduce((sum, d) => {
    const receiveAmount =
      typeof d.receives === "string" ? parseFloat(d.receives) : d.receives || 0;
    return sum + receiveAmount;
  }, 0);

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Income Head Management
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your income heads and monitor total receives.
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
            <Card icon={<ArrowDownCircle size={32} />} hover>
              <div>
                <p className="text-3xl font-bold text-gray-700">
                  ₦
                  {totalReceives.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
                <p className="text-sm text-gray-500">Total Receives</p>
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
          placeholder="Search by income head name... (Ctrl+F)"
        >
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => {
                setEditItem(null);
                setFormData({ name: "", receives: 0 });
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
              setFormData({ name: row.name, receives: row.receives });
              setModalOpen(true);
            },
          }}
          summaryRow={{
            name: "Total",
            receives: `₦${totalReceives.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`,
          }}
        />
      </Card>
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editItem ? "Edit Income Head" : "New Income Head"}
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Receives (₦) *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                ₦
              </span>
              <input
                type="number"
                value={formData.receives}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    receives: Number(e.target.value),
                  }))
                }
                className="input-base pl-8"
                placeholder="0.00"
                min="0"
                step="0.01"
                required
              />
            </div>
          </div>
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

export default HeadIncome;
