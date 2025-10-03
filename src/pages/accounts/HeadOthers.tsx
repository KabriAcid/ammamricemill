import { useEffect, useState } from "react";
import { Button } from "../../components/ui/Button";
import { Table } from "../../components/ui/Table";
import { Modal } from "../../components/ui/Modal";
import { Card } from "../../components/ui/Card";
import {
  Plus,
  Trash2,
  ArrowDownCircle,
  ArrowUpCircle,
  Banknote,
} from "lucide-react";
import { api } from "../../utils/fetcher";
import { useToast } from "../../components/ui/Toast";

type OthersRow = {
  id: string;
  name: string;
  receive: number;
  payment: number;
  balance: number;
};

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

const HeadOthers = () => {
  const [data, setData] = useState<OthersRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<OthersRow | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    receive: 0,
    payment: 0,
    balance: 0,
  });

  const { showToast } = useToast();

  const fetchOtherHeads = async () => {
    setLoading(true);
    try {
      const response = await api.get<{ success: boolean; data: OthersRow[] }>(
        "/accounts/head-others"
      );
      if (response.success) {
        setData(response.data);
      } else {
        showToast("Failed to load other heads", "error");
      }
    } catch (error) {
      console.error("Error fetching other heads:", error);
      showToast("Failed to load other heads", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOtherHeads();
  }, []);

  // Create new other head
  const handleCreate = async () => {
    if (!formData.name.trim()) {
      showToast("Other head name is required", "error");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post<{
        success: boolean;
        data: OthersRow;
        message: string;
      }>("/accounts/head-others", { name: formData.name });

      if (response.success) {
        showToast(response.message, "success");
        setModalOpen(false);
        setFormData({ name: "", receive: 0, payment: 0, balance: 0 });
        fetchOtherHeads(); // Refresh the list
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
      const response = await api.put<{
        success: boolean;
        data: OthersRow;
        message: string;
      }>(`/accounts/head-others/${editItem.id}`, { name: formData.name });

      if (response.success) {
        showToast(response.message, "success");
        setModalOpen(false);
        setEditItem(null);
        setFormData({ name: "", receive: 0, payment: 0, balance: 0 });
        fetchOtherHeads(); // Refresh the list
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
      const response = await api.delete<{ success: boolean; message: string }>(
        "/accounts/head-others",
        { ids }
      );

      if (response.success) {
        showToast(response.message, "success");
        setSelectedRows([]);
        fetchOtherHeads(); // Refresh the list
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
    { key: "name", label: "Head Name" },
    {
      key: "receive",
      label: "Receive",
      render: (value: number) => value.toLocaleString(),
    },
    {
      key: "payment",
      label: "Payment",
      render: (value: number) => value.toLocaleString(),
    },
    {
      key: "balance",
      label: "Balance",
      render: (value: number) => value.toLocaleString(),
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card icon={<ArrowDownCircle className="w-8 h-8 text-primary-800" />}>
          <div>
            <div className="text-xs uppercase text-gray-500 font-semibold">
              Total Receive
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {totalReceive.toLocaleString()}
            </div>
          </div>
        </Card>
        <Card icon={<ArrowUpCircle className="w-8 h-8 text-primary-800" />}>
          <div>
            <div className="text-xs uppercase text-gray-500 font-semibold">
              Total Payment
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {totalPayment.toLocaleString()}
            </div>
          </div>
        </Card>
        <Card icon={<Banknote className="w-8 h-8 text-primary-800" />}>
          <div>
            <div className="text-xs uppercase text-gray-500 font-semibold">
              Total Balance
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {totalBalance.toLocaleString()}
            </div>
          </div>
        </Card>
      </div>
      <div className="mb-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
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
            New Others Head
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
          receive: totalReceive.toLocaleString(),
          payment: totalPayment.toLocaleString(),
          balance: totalBalance.toLocaleString(),
        }}
      />
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Receive
              </label>
              <input
                type="number"
                value={formData.receive}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    receive: Number(e.target.value),
                  }))
                }
                className="input-base"
                placeholder="Enter receive amount"
                min="0"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment
              </label>
              <input
                type="number"
                value={formData.payment}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    payment: Number(e.target.value),
                  }))
                }
                className="input-base"
                placeholder="Enter payment amount"
                min="0"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Balance
              </label>
              <input
                type="number"
                value={formData.balance}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    balance: Number(e.target.value),
                  }))
                }
                className="input-base"
                placeholder="Enter balance"
                min="0"
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

export default HeadOthers;
