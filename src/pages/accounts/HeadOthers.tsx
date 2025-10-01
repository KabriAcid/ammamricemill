import { useEffect, useState } from "react";
import { Button } from "../../components/ui/Button";
import { Table } from "../../components/ui/Table";
import { Modal } from "../../components/ui/Modal";
import { Plus, Trash2 } from "lucide-react";

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

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setData([
        {
          id: "1",
          name: "Other A",
          receive: 10000,
          payment: 2000,
          balance: 8000,
        },
        {
          id: "2",
          name: "Other B",
          receive: 5000,
          payment: 1000,
          balance: 4000,
        },
        {
          id: "3",
          name: "Other C",
          receive: 3000,
          payment: 500,
          balance: 2500,
        },
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
      setFormData({ name: "", receive: 0, payment: 0, balance: 0 });
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
      setFormData({ name: "", receive: 0, payment: 0, balance: 0 });
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
        <div className="flex flex-col sm:flex-row sm:gap-6 gap-2 text-gray-700 font-semibold">
          <span>
            Receive:{" "}
            <span className="text-primary-700">
              {totalReceive.toLocaleString()}
            </span>
          </span>
          <span>
            Payment:{" "}
            <span className="text-primary-700">
              {totalPayment.toLocaleString()}
            </span>
          </span>
          <span>
            Balance:{" "}
            <span className="text-primary-700">
              {totalBalance.toLocaleString()}
            </span>
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
            setFormData({
              name: row.name,
              receive: row.receive,
              payment: row.payment,
              balance: row.balance,
            });
            setModalOpen(true);
          },
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
