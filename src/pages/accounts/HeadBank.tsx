import { useEffect, useState, useCallback } from "react";
import { Button } from "../../components/ui/Button";
import { Table } from "../../components/ui/Table";
import { Modal } from "../../components/ui/Modal";
import { Card } from "../../components/ui/Card";
import { FilterBar } from "../../components/ui/FilterBar";
import { useToast } from "../../components/ui/Toast";
import { SkeletonCard } from "../../components/ui/Skeleton";
import { api } from "../../utils/fetcher";
import { ApiResponse } from "../../types";
import {
  Plus,
  Trash2,
  ArrowDownCircle,
  ArrowUpCircle,
  Banknote,
} from "lucide-react";

type BankRow = {
  id: string;
  name: string;
  receive: number;
  payment: number;
  balance: number;
};

const HeadBank = () => {
  const [data, setData] = useState<BankRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<BankRow | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [formData, setFormData] = useState({
    name: "",
  });
  const { showToast } = useToast();

  // Fetch data from API
  const fetchBankHeads = async () => {
    setLoading(true);
    try {
      const response = await api.get<ApiResponse<BankRow[]>>(
        "/accounts/head-bank"
      );

      if (response.success && response.data) {
        setData(response.data);
      } else {
        throw new Error("Failed to fetch bank heads");
      }
    } catch (error) {
      console.error("Error fetching bank heads:", error);
      showToast("Failed to load bank heads", "error");
      setData([]);
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchBankHeads();
  }, []);

  // Keyboard shortcuts
  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    if ((event.ctrlKey || event.metaKey) && event.key === "f") {
      event.preventDefault();
      document.querySelector<HTMLInputElement>('input[type="search"]')?.focus();
    }
    if ((event.ctrlKey || event.metaKey) && event.key === "r") {
      event.preventDefault();
      fetchBankHeads();
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
      showToast("Bank head name is required", "error");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post<ApiResponse<BankRow>>(
        "/accounts/head-bank",
        formData
      );

      if (response.success) {
        showToast(
          response.message || "Bank head created successfully",
          "success"
        );
        await fetchBankHeads();
        setModalOpen(false);
        setFormData({ name: "" });
      } else {
        throw new Error("Failed to create bank head");
      }
    } catch (error) {
      console.error("Error creating bank head:", error);
      showToast("Failed to create bank head", "error");
    } finally {
      setLoading(false);
    }
  };

  // Update
  const handleUpdate = async () => {
    if (!editItem) return;

    if (!formData.name.trim()) {
      showToast("Bank head name is required", "error");
      return;
    }

    setLoading(true);
    try {
      const response = await api.put<ApiResponse<BankRow>>(
        `/accounts/head-bank/${editItem.id}`,
        formData
      );

      if (response.success) {
        showToast(
          response.message || "Bank head updated successfully",
          "success"
        );
        await fetchBankHeads();
        setModalOpen(false);
        setEditItem(null);
        setFormData({ name: "" });
      } else {
        throw new Error("Failed to update bank head");
      }
    } catch (error) {
      console.error("Error updating bank head:", error);
      showToast("Failed to update bank head", "error");
    } finally {
      setLoading(false);
    }
  };

  // Delete (single or bulk)
  const handleDelete = async (ids: string[]) => {
    setLoading(true);
    try {
      const response = await api.delete<ApiResponse<void>>(
        "/accounts/head-bank",
        { ids }
      );

      if (response.success) {
        showToast(
          response.message || "Bank head(s) deleted successfully",
          "success"
        );
        await fetchBankHeads();
        setSelectedRows([]);
      } else {
        throw new Error("Failed to delete bank head(s)");
      }
    } catch (error) {
      console.error("Error deleting bank head(s):", error);
      showToast("Failed to delete bank head(s)", "error");
    } finally {
      setLoading(false);
    }
  };

  // Table columns
  const columns = [
    { key: "name", label: "Head Name", sortable: true },
    {
      key: "receive",
      label: "Receive",
      render: (value: number | string) => {
        const amount = typeof value === "string" ? parseFloat(value) : value;
        return `₦${amount.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`;
      },
    },
    {
      key: "payment",
      label: "Payment",
      render: (value: number | string) => {
        const amount = typeof value === "string" ? parseFloat(value) : value;
        return `₦${amount.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`;
      },
    },
    {
      key: "balance",
      label: "Balance",
      render: (value: number | string) => {
        const amount = typeof value === "string" ? parseFloat(value) : value;
        return (
          <span className="font-semibold">
            ₦
            {amount.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        );
      },
    },
  ];

  const totalReceive = data.reduce((sum, d) => {
    const amount =
      typeof d.receive === "string" ? parseFloat(d.receive) : d.receive;
    return sum + (amount || 0);
  }, 0);
  const totalPayment = data.reduce((sum, d) => {
    const amount =
      typeof d.payment === "string" ? parseFloat(d.payment) : d.payment;
    return sum + (amount || 0);
  }, 0);
  const totalBalance = data.reduce((sum, d) => {
    const amount =
      typeof d.balance === "string" ? parseFloat(d.balance) : d.balance;
    return sum + (amount || 0);
  }, 0);

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Bank Head Management
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your bank heads and monitor receive, payment, and balance.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {initialLoading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
            <Card icon={<ArrowDownCircle size={32} />} hover>
              <div>
                <p className="text-3xl font-bold text-gray-700">
                  ₦
                  {totalReceive.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
                <p className="text-sm text-gray-500">Total Receive</p>
              </div>
            </Card>
            <Card icon={<ArrowUpCircle size={32} />} hover>
              <div>
                <p className="text-3xl font-bold text-gray-700">
                  ₦
                  {totalPayment.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
                <p className="text-sm text-gray-500">Total Payment</p>
              </div>
            </Card>
            <Card icon={<Banknote size={32} />} hover>
              <div>
                <p className="text-3xl font-bold text-gray-700">
                  ₦
                  {totalBalance.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
                <p className="text-sm text-gray-500">Total Balance</p>
              </div>
            </Card>
          </>
        )}
      </div>
      <Card>
        <FilterBar
          onSearch={setSearchQuery}
          placeholder="Search by bank head name... (Ctrl+F)"
        >
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => {
                setEditItem(null);
                setFormData({ name: ""});
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
              setFormData({
                name: row.name,
              });
              setModalOpen(true);
            },
          }}
          summaryRow={{
            name: "Total",
            receive: `₦${totalReceive.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`,
            payment: `₦${totalPayment.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`,
            balance: `₦${totalBalance.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`,
          }}
        />
      </Card>
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editItem ? "Edit Bank Head" : "New Bank Head"}
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
          {/* Receive, Payment, and Balance inputs removed: these are calculated from transactions, not user input */}
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

export default HeadBank;
