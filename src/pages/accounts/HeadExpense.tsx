import { useEffect, useState } from "react";
import { Button } from "../../components/ui/Button";
import { Table } from "../../components/ui/Table";
import { Modal } from "../../components/ui/Modal";
import { Plus, Trash2 } from "lucide-react";

type ExpenseRow = {
  id: string;
  name: string;
  payments: number;
};

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

const HeadExpense = () => {
  const [data, setData] = useState<ExpenseRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<ExpenseRow | null>(null);
  const [formData, setFormData] = useState({ name: "", payments: 0 });

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setData([
        { id: "1", name: "Raw Material", payments: 90000 },
        { id: "2", name: "Utilities", payments: 12000 },
        { id: "3", name: "Maintenance", payments: 3500 },
      ]);
      setLoading(false);
    }, 400);
  }, []);

  // Create
  const handleCreate = () => {
    setLoading(true);
    setTimeout(() => {
      setData((prev) => [{ id: Date.now().toString(), ...formData }, ...prev]);
      setModalOpen(false);
      setFormData({ name: "", payments: 0 });
      setLoading(false);
    }, 400);
  };

  // Update
  const handleUpdate = () => {
    if (!editItem) return;
    setLoading(true);
    setTimeout(() => {
      setData((prev) =>
        prev.map((row) =>
          row.id === editItem.id ? { ...row, ...formData } : row
        )
      );
      setModalOpen(false);
      setEditItem(null);
      setFormData({ name: "", payments: 0 });
      setLoading(false);
    }, 400);
  };

  // Delete (single or bulk)
  const handleDelete = (ids: string[]) => {
    setLoading(true);
    setTimeout(() => {
      setData((prev) => prev.filter((row) => !ids.includes(row.id)));
      setSelectedRows([]);
      setLoading(false);
    }, 400);
  };

  // Table columns
  const columns = [
    { key: "name", label: "Head Name" },
    {
      key: "payments",
      label: "Payments",
      render: (value: number) => value.toLocaleString(),
    },
  ];

  const totalPayments = data.reduce((sum, d) => sum + (d.payments || 0), 0);

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
      <div className="mb-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => {
              setEditItem(null);
              setFormData({ name: "", payments: 0 });
              setModalOpen(true);
            }}
            icon={Plus}
            size="sm"
          >
            New Expense Head
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
        <div className="text-gray-700 font-semibold">
          Total Payments:{" "}
          <span className="text-primary-700">
            {totalPayments.toLocaleString()}
          </span>
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
            setFormData({ name: row.name, payments: row.payments });
            setModalOpen(true);
          },
        }}
      />
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payments
            </label>
            <input
              type="number"
              value={formData.payments}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  payments: Number(e.target.value),
                }))
              }
              className="input-base"
              placeholder="Enter payments amount"
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

export default HeadExpense;
