import { useEffect, useState, useCallback } from "react";
import { Button } from "../../components/ui/Button";
import { Table } from "../../components/ui/Table";
import { Modal } from "../../components/ui/Modal";
import { Card } from "../../components/ui/Card";
import { FilterBar } from "../../components/ui/FilterBar";
import {
  Plus,
  Trash2,
  ArrowDownCircle,
  ArrowUpCircle,
  Banknote,
  TrendingUp,
} from "lucide-react";
import { api } from "../../utils/fetcher";
import { useToast } from "../../components/ui/Toast";
import { SkeletonCard } from "../../components/ui/Skeleton";
import { ApiResponse } from "../../types";

type OthersRow = {
  id: string;
  name: string;
  receive: number;
  payment: number;
  balance: number;
};

const HeadOthers = () => {
  const { showToast } = useToast();
  const [data, setData] = useState<OthersRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<OthersRow | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [formData, setFormData] = useState({
    name: "",
    receive: 0,
    payment: 0,
    balance: 0,
  });

  const fetchOtherHeads = async () => {
    setLoading(true);
    try {
      const response = await api.get<ApiResponse<OthersRow[]>>(
        "/accounts/head-others"
      );
      if (response.success && response.data) {
        setData(response.data);
      } else {
        throw new Error("Failed to load other heads");
      }
    } catch (error) {
      console.error("Error fetching other heads:", error);
      showToast("Failed to load other heads", "error");
      setData([]);
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    fetchOtherHeads();
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

  // Create new other head
  const handleCreate = async () => {
    if (!formData.name.trim()) {
      showToast("Other head name is required", "error");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post<ApiResponse<OthersRow>>(
        "/accounts/head-others",
        { name: formData.name }
      );

      if (response.success) {
        showToast(
          response.message || "Other head created successfully",
          "success"
        );
        setModalOpen(false);
        setFormData({ name: "", receive: 0, payment: 0, balance: 0 });
        await fetchOtherHeads();
      } else {
        throw new Error("Failed to create other head");
      }
    } catch (error) {
      console.error("Error creating other head:", error);
      showToast("Failed to create other head", "error");
    } finally {
      setLoading(false);
    }
  };

  // Update other head
  const handleUpdate = async () => {
    if (!editItem) return;
    if (!formData.name.trim()) {
      showToast("Other head name is required", "error");
      return;
    }

    setLoading(true);
    try {
      const response = await api.put<ApiResponse<OthersRow>>(
        `/accounts/head-others/${editItem.id}`,
        { name: formData.name }
      );

      if (response.success) {
        showToast(
          response.message || "Other head updated successfully",
          "success"
        );
        setModalOpen(false);
        setEditItem(null);
        setFormData({ name: "", receive: 0, payment: 0, balance: 0 });
        await fetchOtherHeads();
      } else {
        throw new Error("Failed to update other head");
      }
    } catch (error) {
      console.error("Error updating other head:", error);
      showToast("Failed to update other head", "error");
    } finally {
      setLoading(false);
    }
  };

  // Delete other heads (single or bulk)
  const handleDelete = async (ids: string[]) => {
    setLoading(true);
    try {
      const response = await api.delete<ApiResponse<void>>(
        "/accounts/head-others",
        { ids }
      );

      if (response.success) {
        showToast(
          response.message || "Other head(s) deleted successfully",
          "success"
        );
        setSelectedRows([]);
        await fetchOtherHeads();
      } else {
        throw new Error("Failed to delete other head(s)");
      }
    } catch (error) {
      console.error("Error deleting other heads:", error);
      showToast("Failed to delete other heads", "error");
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
      render: (value: number) => `₦${value.toLocaleString()}`,
    },
    {
      key: "payment",
      label: "Payment",
      render: (value: number) => `₦${value.toLocaleString()}`,
    },
    {
      key: "balance",
      label: "Balance",
      render: (value: number) => `₦${value.toLocaleString()}`,
    },
  ];

  const totalReceive = data.reduce((sum, d) => sum + (d.receive || 0), 0);
  const totalPayment = data.reduce((sum, d) => sum + (d.payment || 0), 0);
  const totalBalance = data.reduce((sum, d) => sum + (d.balance || 0), 0);

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Others Head Management
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your other heads and monitor receive, payment, and balance.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        {initialLoading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
            <Card icon={<ArrowDownCircle size={32} />} hover>
              <div>
                <p className="text-3xl font-bold text-gray-700">
                  ₦{totalReceive.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">Total Receive</p>
              </div>
            </Card>
            <Card icon={<ArrowUpCircle size={32} />} hover>
              <div>
                <p className="text-3xl font-bold text-gray-700">
                  ₦{totalPayment.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">Total Payment</p>
              </div>
            </Card>
            <Card icon={<Banknote size={32} />} hover>
              <div>
                <p className="text-3xl font-bold text-gray-700">
                  ₦{totalBalance.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">Total Balance</p>
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
          placeholder="Search by head name... (Ctrl+F)"
        >
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => {
                setEditItem(null);
                setFormData({ name: "", receive: 0, payment: 0, balance: 0 });
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
                receive: row.receive,
                payment: row.payment,
                balance: row.balance,
              });
              setModalOpen(true);
            },
          }}
          summaryRow={{
            name: "Total",
            receive: `₦${totalReceive.toLocaleString()}`,
            payment: `₦${totalPayment.toLocaleString()}`,
            balance: `₦${totalBalance.toLocaleString()}`,
          }}
        />
      </Card>
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editItem ? "Edit Others Head" : "New Others Head"}
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
          <p className="text-sm text-gray-500">
            Note: Receive, Payment, and Balance values are automatically
            calculated based on transactions.
          </p>
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

export default HeadOthers;
