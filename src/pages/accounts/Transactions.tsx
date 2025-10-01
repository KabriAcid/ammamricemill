import { useEffect, useState } from "react";
import { Button } from "../../components/ui/Button";
import { Table } from "../../components/ui/Table";
import { Modal } from "../../components/ui/Modal";
import { FilterBar } from "../../components/ui/FilterBar";
import {
  Plus,
  Trash2,
  FileText,
  CheckCircle2,
  XCircle,
  Printer,
  ArrowUpCircle,
} from "lucide-react";

import { Card } from "../../components/ui/Card";

// Transaction type
interface TransactionRow {
  id: string;
  date: string;
  party: string;
  voucherType: "receive" | "payment" | "invoice";
  fromHead: string;
  toHead: string;
  description: string;
  amount: number;
  status: "pending" | "completed" | "cancelled";
}

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

const Transactions = () => {
  const [data, setData] = useState<TransactionRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<TransactionRow | null>(null);
  const [formData, setFormData] = useState({
    date: "",
    party: "",
    voucherType: "receive" as TransactionRow["voucherType"],
    fromHead: "",
    toHead: "",
    description: "",
    amount: 0,
    status: "pending" as TransactionRow["status"],
  });

  // Fetch all (GET)
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setData([
        {
          id: "1",
          date: "2025-09-30",
          party: "ABC Traders",
          voucherType: "receive",
          fromHead: "Bank",
          toHead: "Sales",
          description: "Payment received for invoice #1234",
          amount: 50000,
          status: "completed",
        },
        {
          id: "2",
          date: "2025-09-29",
          party: "XYZ Suppliers",
          voucherType: "payment",
          fromHead: "Purchase",
          toHead: "Bank",
          description: "Payment for raw materials",
          amount: 30000,
          status: "pending",
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
      setFormData({
        date: "",
        party: "",
        voucherType: "receive",
        fromHead: "",
        toHead: "",
        description: "",
        amount: 0,
        status: "pending",
      });
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
      setFormData({
        date: "",
        party: "",
        voucherType: "receive",
        fromHead: "",
        toHead: "",
        description: "",
        amount: 0,
        status: "pending",
      });
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
    { key: "date", label: "Date" },
    { key: "party", label: "Party" },
    {
      key: "voucherType",
      label: "Voucher Type",
      render: (value: string) => (
        <span className="capitalize font-semibold">{value}</span>
      ),
    },
    { key: "fromHead", label: "From Head" },
    { key: "toHead", label: "To Head" },
    { key: "description", label: "Description" },
    {
      key: "amount",
      label: "Amount",
      render: (value: number) => value.toLocaleString(),
    },
    {
      key: "status",
      label: "Status",
      render: (value: string) => (
        <span
          className={
            value === "completed"
              ? "text-green-700 font-semibold"
              : value === "pending"
              ? "text-yellow-700 font-semibold"
              : "text-red-700 font-semibold"
          }
        >
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </span>
      ),
    },
  ];

  const totalAmount = data.reduce((sum, d) => sum + (d.amount || 0), 0);

  // Stat card calculations
  const totalTransactions = data.length;
  const completedCount = data.filter((d) => d.status === "completed").length;
  const pendingCount = data.filter((d) => d.status === "pending").length;
  const cancelledCount = data.filter((d) => d.status === "cancelled").length;

  return (
    <div className="animate-fade-in">
      <div>
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage all account transactions, receipts, and payments.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 mb-6">
          <Card icon={<FileText className="w-8 h-8 text-primary-800" />}>
            <div>
              <div className="text-xs uppercase text-gray-500 font-semibold">
                Total
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {totalTransactions}
              </div>
            </div>
          </Card>
          <Card icon={<CheckCircle2 className="w-8 h-8 text-green-700" />}>
            <div>
              <div className="text-xs uppercase text-gray-500 font-semibold">
                Completed
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {completedCount}
              </div>
            </div>
          </Card>
          <Card icon={<XCircle className="w-8 h-8 text-red-700" />}>
            <div>
              <div className="text-xs uppercase text-gray-500 font-semibold">
                Cancelled
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {cancelledCount}
              </div>
            </div>
          </Card>
          <Card icon={<ArrowUpCircle className="w-8 h-8 text-yellow-700" />}>
            <div>
              <div className="text-xs uppercase text-gray-500 font-semibold">
                Pending
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {pendingCount}
              </div>
            </div>
          </Card>
          <Card icon={<Printer className="w-8 h-8 text-primary-800" />}>
            <div>
              <div className="text-xs uppercase text-gray-500 font-semibold">
                Total Amount
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {totalAmount.toLocaleString()}
              </div>
            </div>
          </Card>
        </div>
        {/* FilterBar, Table, Modal, etc. remain unchanged below */}
      </div>
      <div className="mb-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => {
              setEditItem(null);
              setFormData({
                date: "",
                party: "",
                voucherType: "receive",
                fromHead: "",
                toHead: "",
                description: "",
                amount: 0,
                status: "pending",
              });
              setModalOpen(true);
            }}
            icon={Plus}
            size="sm"
          >
            New Transaction
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
          <Button variant="outline" size="sm" icon={Printer} onClick={() => {}}>
            Print
          </Button>
        </div>
      </div>
      <FilterBar
        onSearch={() => {}}
        onDateRange={() => {}}
        onFilterChange={() => {}}
      />
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
            setFormData({ ...row });
            setModalOpen(true);
          },
        }}
        summaryRow={{
          date: <span className="font-semibold">Total</span>,
          amount: (
            <span className="font-bold">{totalAmount.toLocaleString()}</span>
          ),
        }}
      />
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editItem ? "Edit Transaction" : "New Transaction"}
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date *
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, date: e.target.value }))
              }
              className="input-base"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Party *
            </label>
            <input
              type="text"
              value={formData.party}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, party: e.target.value }))
              }
              className="input-base"
              required
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Voucher Type *
              </label>
              <select
                value={formData.voucherType}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    voucherType: e.target
                      .value as TransactionRow["voucherType"],
                  }))
                }
                className="input-base"
                required
              >
                <option value="receive">Receive</option>
                <option value="payment">Payment</option>
                <option value="invoice">Invoice</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status *
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    status: e.target.value as TransactionRow["status"],
                  }))
                }
                className="input-base"
                required
              >
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                From Head *
              </label>
              <input
                type="text"
                value={formData.fromHead}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, fromHead: e.target.value }))
                }
                className="input-base"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                To Head *
              </label>
              <input
                type="text"
                value={formData.toHead}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, toHead: e.target.value }))
                }
                className="input-base"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              className="input-base"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount *
            </label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  amount: Number(e.target.value),
                }))
              }
              className="input-base"
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

export default Transactions;
