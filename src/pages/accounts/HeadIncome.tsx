import { useEffect, useState } from "react";
import { Button } from "../../components/ui/Button";
import { Table } from "../../components/ui/Table";
import { Modal } from "../../components/ui/Modal";
import { Card } from "../../components/ui/Card";
import { Plus, Trash2, ArrowDownCircle } from "lucide-react";
import { api } from "../../utils/fetcher";
import { useToast } from "../../components/ui/Toast";

type IncomeRow = {
  id: string;
  name: string;
  receives: number;
};

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];
const HeadIncome = () => {
  const { showToast } = useToast();
  const [data, setData] = useState<IncomeRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<IncomeRow | null>(null);
  const [formData, setFormData] = useState({ name: "", receives: 0 });

  const fetchIncomeHeads = async () => {
    setLoading(true);
    try {
      const response = await api.get<{ success: boolean; data: IncomeRow[] }>(
        "/accounts/head-income"
      );
      if (response.success) {
        setData(response.data);
      } else {
        showToast("Failed to load income heads", "error");
      }
    } catch (error) {
      console.error("Error fetching income heads:", error);
      showToast("Failed to load income heads", "error");
    } finally {
      setLoading(false);
    }
  };

  // Fetch all income heads on component mount
  useEffect(() => {
    fetchIncomeHeads();
  }, []);

  // Create new income head
  const handleCreate = async () => {
    if (!formData.name.trim()) {
      showToast("Income head name is required", "error");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post<{
        success: boolean;
        data: IncomeRow;
        message: string;
      }>("/accounts/head-income", { name: formData.name });

      if (response.success) {
        showToast(response.message, "success");
        setModalOpen(false);
        setFormData({ name: "", receives: 0 });
        fetchIncomeHeads(); // Refresh the list
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
      const response = await api.put<{
        success: boolean;
        data: IncomeRow;
        message: string;
      }>(`/accounts/head-income/${editItem.id}`, { name: formData.name });

      if (response.success) {
        showToast(response.message, "success");
        setModalOpen(false);
        setEditItem(null);
        setFormData({ name: "", receives: 0 });
        fetchIncomeHeads(); // Refresh the list
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
      const response = await api.delete<{ success: boolean; message: string }>(
        "/accounts/head-income",
        { ids }
      );

      if (response.success) {
        showToast(response.message, "success");
        setSelectedRows([]);
        fetchIncomeHeads(); // Refresh the list
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
    { key: "name", label: "Head Name" },
    {
      key: "receives",
      label: "Receives",
      render: (value: number | string) => {
        const numValue = typeof value === "string" ? parseFloat(value) : value;
        return numValue.toLocaleString("en-IN", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card icon={<ArrowDownCircle className="w-8 h-8 text-primary-800" />}>
          <div>
            <div className="text-xs uppercase text-gray-500 font-semibold">
              Total Receives
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {totalReceives.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
          </div>
        </Card>
        <Card icon={<ArrowDownCircle className="w-8 h-8 text-primary-800" />}>
          <div>
            <div className="text-xs uppercase text-gray-500 font-semibold">
              Total Heads
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {data.length}
            </div>
          </div>
        </Card>
      </div>
      <div className="mb-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
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
            New Income Head
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
      </div>
      <Table
        data={data}
        columns={columns}
        loading={loading}
        pagination={{
          currentPage: 1,
          totalPages: 1,
          pageSize: PAGE_SIZE_OPTIONS[1],
          totalItems: data.length,
          onPageChange: () => {},
          onPageSizeChange: () => {},
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
          receives: totalReceives,
        }}
      />
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
              Receives
            </label>
            <input
              type="number"
              value={formData.receives}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  receives: Number(e.target.value),
                }))
              }
              className="input-base"
              placeholder="Enter receives amount"
              min="0"
              required
            />
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
