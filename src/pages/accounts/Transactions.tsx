import { useEffect, useState, useCallback } from "react";
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
import { SkeletonCard } from "../../components/ui/Skeleton";
import { useToast } from "../../components/ui/Toast";
import { api } from "../../utils/fetcher";
import { ApiResponse } from "../../types";

// Transaction type
interface TransactionRow {
  id: string;
  date: string;
  party: string;
  voucherType: "receive" | "payment";
  fromHead: string;
  toHead: string;
  description: string;
  amount: number;
  status: "active" | "inactive";
}

interface HeadOption {
  id: string;
  name: string;
}

const Transactions = () => {
  const { showToast } = useToast();
  const [data, setData] = useState<TransactionRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<TransactionRow | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Head options for dropdowns
  const [incomeHeads, setIncomeHeads] = useState<HeadOption[]>([]);
  const [expenseHeads, setExpenseHeads] = useState<HeadOption[]>([]);
  const [bankHeads, setBankHeads] = useState<HeadOption[]>([]);
  const [otherHeads, setOtherHeads] = useState<HeadOption[]>([]);

  const [formData, setFormData] = useState({
    date: "",
    voucherType: "receive" as "receive" | "payment",
    headType: "income" as "income" | "expense" | "bank" | "others",
    headId: "",
    description: "",
    amount: 0,
  });

  // Fetch all transactions from API
  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const response = await api.get<ApiResponse<TransactionRow[]>>(
        "/accounts/transactions"
      );
      if (response.success && response.data) {
        setData(response.data);
      } else {
        throw new Error("Failed to load transactions");
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
      showToast("Failed to load transactions", "error");
      setData([]);
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  // Fetch all head options
  const fetchHeadOptions = async () => {
    try {
      const [income, expense, bank, others] = await Promise.all([
        api.get<ApiResponse<HeadOption[]>>("/accounts/head-income"),
        api.get<ApiResponse<HeadOption[]>>("/accounts/head-expense"),
        api.get<ApiResponse<HeadOption[]>>("/accounts/head-bank"),
        api.get<ApiResponse<HeadOption[]>>("/accounts/head-others"),
      ]);

      if (income.success && income.data) setIncomeHeads(income.data);
      if (expense.success && expense.data) setExpenseHeads(expense.data);
      if (bank.success && bank.data) setBankHeads(bank.data);
      if (others.success && others.data) setOtherHeads(others.data);
    } catch (error) {
      console.error("Error fetching head options:", error);
    }
  };

  useEffect(() => {
    fetchTransactions();
    fetchHeadOptions();
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
  const filteredData = data.filter(
    (item) =>
      (item.description?.toLowerCase() || "").includes(
        searchQuery.toLowerCase()
      ) ||
      (item.fromHead?.toLowerCase() || "").includes(searchQuery.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = filteredData.slice(startIndex, startIndex + pageSize);

  // Create
  const handleCreate = async () => {
    if (
      !formData.date ||
      !formData.voucherType ||
      !formData.amount ||
      !formData.headId ||
      !formData.headType
    ) {
      showToast("Please fill all required fields", "error");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post<ApiResponse<TransactionRow>>(
        "/accounts/transactions",
        formData
      );

      if (response.success) {
        showToast(
          response.message || "Transaction created successfully",
          "success"
        );
        setModalOpen(false);
        setFormData({
          date: "",
          voucherType: "receive",
          headType: "income",
          headId: "",
          description: "",
          amount: 0,
        });
        await fetchTransactions();
      } else {
        throw new Error("Failed to create transaction");
      }
    } catch (error) {
      console.error("Error creating transaction:", error);
      showToast("Failed to create transaction", "error");
    } finally {
      setLoading(false);
    }
  };

  // Update
  const handleUpdate = async () => {
    if (!editItem) return;
    if (!formData.date || !formData.amount) {
      showToast("Please fill all required fields", "error");
      return;
    }

    setLoading(true);
    try {
      const response = await api.put<ApiResponse<TransactionRow>>(
        `/accounts/transactions/${editItem.id}`,
        {
          date: formData.date,
          description: formData.description,
          amount: formData.amount,
        }
      );

      if (response.success) {
        showToast(
          response.message || "Transaction updated successfully",
          "success"
        );
        setModalOpen(false);
        setEditItem(null);
        setFormData({
          date: "",
          voucherType: "receive",
          headType: "income",
          headId: "",
          description: "",
          amount: 0,
        });
        await fetchTransactions();
      } else {
        throw new Error("Failed to update transaction");
      }
    } catch (error) {
      console.error("Error updating transaction:", error);
      showToast("Failed to update transaction", "error");
    } finally {
      setLoading(false);
    }
  };

  // Delete (single or bulk)
  const handleDelete = async (ids: string[]) => {
    setLoading(true);
    try {
      const response = await api.delete<ApiResponse<void>>(
        "/accounts/transactions",
        { ids }
      );

      if (response.success) {
        showToast(
          response.message || "Transaction(s) deleted successfully",
          "success"
        );
        setSelectedRows([]);
        await fetchTransactions();
      } else {
        throw new Error("Failed to delete transaction(s)");
      }
    } catch (error) {
      console.error("Error deleting transactions:", error);
      showToast("Failed to delete transactions", "error");
    } finally {
      setLoading(false);
    }
  };

  // Table columns
  const columns = [
    { key: "date", label: "Date", sortable: true },
    {
      key: "voucherType",
      label: "Voucher Type",
      render: (value: string) => (
        <span className="capitalize font-semibold">{value}</span>
      ),
    },
    { key: "fromHead", label: "Head", sortable: true },
    { key: "description", label: "Description" },
    {
      key: "amount",
      label: "Amount",
      render: (value: number | string) => {
        const amount = typeof value === "string" ? parseFloat(value) : value;
        return `₦${amount.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`;
      },
    },
    {
      key: "status",
      label: "Status",
      render: (value: string) => (
        <span
          className={
            value === "active"
              ? "text-green-700 font-semibold"
              : "text-gray-700 font-semibold"
          }
        >
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </span>
      ),
    },
  ];

  const totalAmount = data.reduce((sum, d) => {
    const amount =
      typeof d.amount === "string" ? parseFloat(d.amount) : d.amount;
    return sum + (amount || 0);
  }, 0);

  // Stat card calculations
  const totalTransactions = data.length;
  const activeCount = data.filter((d) => d.status === "active").length;
  const receiveCount = data.filter((d) => d.voucherType === "receive").length;
  const paymentCount = data.filter((d) => d.voucherType === "payment").length;

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
          {initialLoading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : (
            <>
              <Card icon={<FileText size={32} />} hover>
                <div>
                  <p className="text-3xl font-bold text-gray-700">
                    {totalTransactions}
                  </p>
                  <p className="text-sm text-gray-500">Total</p>
                </div>
              </Card>
              <Card icon={<CheckCircle2 size={32} />} hover>
                <div>
                  <p className="text-3xl font-bold text-gray-700">
                    {receiveCount}
                  </p>
                  <p className="text-sm text-gray-500">Receive</p>
                </div>
              </Card>
              <Card icon={<ArrowUpCircle size={32} />} hover>
                <div>
                  <p className="text-3xl font-bold text-gray-700">
                    {paymentCount}
                  </p>
                  <p className="text-sm text-gray-500">Payment</p>
                </div>
              </Card>
              <Card icon={<XCircle size={32} />} hover>
                <div>
                  <p className="text-3xl font-bold text-gray-700">
                    {activeCount}
                  </p>
                  <p className="text-sm text-gray-500">Active</p>
                </div>
              </Card>
              <Card icon={<Printer size={32} />} hover>
                <div>
                  <p className="text-3xl font-bold text-gray-700">
                    ₦
                    {totalAmount.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                  <p className="text-sm text-gray-500">Total Amount</p>
                </div>
              </Card>
            </>
          )}
        </div>
        <Card>
          <FilterBar
            onSearch={setSearchQuery}
            placeholder="Search by party, description, or head... (Ctrl+F)"
          >
            <div className="flex items-center space-x-2">
              <Button
                onClick={() => {
                  setEditItem(null);
                  setFormData({
                    date: "",
                    voucherType: "receive",
                    headType: "income",
                    headId: "",
                    description: "",
                    amount: 0,
                  });
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
              <Button
                variant="outline"
                size="sm"
                icon={Printer}
                onClick={() => window.print()}
              >
                Print
              </Button>
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
                  date: row.date,
                  voucherType: row.voucherType,
                  headType: "income",
                  headId: "",
                  description: row.description,
                  amount: row.amount,
                });
                setModalOpen(true);
              },
            }}
            summaryRow={{
              date: "Total",
              amount: `₦${totalAmount.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`,
            }}
          />
        </Card>
      </div>
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
                    voucherType: e.target.value as "receive" | "payment",
                  }))
                }
                className="input-base"
                required
              >
                <option value="receive">Receive</option>
                <option value="payment">Payment</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Head Type *
              </label>
              <select
                value={formData.headType}
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    headType: e.target.value as
                      | "income"
                      | "expense"
                      | "bank"
                      | "others",
                    headId: "", // Reset headId when head type changes
                  }));
                }}
                className="input-base"
                required
              >
                <option value="income">Income</option>
                <option value="expense">Expense</option>
                <option value="bank">Bank</option>
                <option value="others">Others</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Head *
            </label>
            <select
              value={formData.headId}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, headId: e.target.value }))
              }
              className="input-base"
              required
            >
              <option value="">-- Select {formData.headType} head --</option>
              {formData.headType === "income" &&
                incomeHeads.map((head) => (
                  <option key={head.id} value={head.id}>
                    {head.name}
                  </option>
                ))}
              {formData.headType === "expense" &&
                expenseHeads.map((head) => (
                  <option key={head.id} value={head.id}>
                    {head.name}
                  </option>
                ))}
              {formData.headType === "bank" &&
                bankHeads.map((head) => (
                  <option key={head.id} value={head.id}>
                    {head.name}
                  </option>
                ))}
              {formData.headType === "others" &&
                otherHeads.map((head) => (
                  <option key={head.id} value={head.id}>
                    {head.name}
                  </option>
                ))}
            </select>
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
              placeholder="Enter transaction description"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount *
            </label>
            <div className="relative">
              <input
                type="number"
                value={formData.amount}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    amount: Number(e.target.value),
                  }))
                }
                className="input-base pl-8"
                placeholder="0.00"
                step="0.01"
                min="0"
                required
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                ₦
              </span>
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

export default Transactions;
