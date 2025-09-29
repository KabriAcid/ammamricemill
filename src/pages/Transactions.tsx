import React, { useState, useEffect } from "react";
import { Receipt, Plus, Filter } from "lucide-react";
import { Breadcrumb } from "../components/Breadcrumb";
import { DataTable } from "../components/DataTable";
import { FormModal } from "../components/FormModal";
import {
  mockTransactions,
  mockIncomeHeads,
  mockExpenseHeads,
  MockTransaction,
} from from '../mock.ts';

export const Transactions: React.FC = () => {
  const [transactions, setTransactions] = useState<MockTransaction[]>([]);
  const [incomeHeads, setIncomeHeads] = useState(mockIncomeHeads);
  const [expenseHeads, setExpenseHeads] = useState(mockExpenseHeads);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<MockTransaction | null>(null);
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">(
    "all"
  );
  const [formData, setFormData] = useState({
    date: "",
    type: "income" as "income" | "expense",
    head: "",
    amount: 0,
    description: "",
    party: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await fetch("/api/transactions");
      const data = await response.json();
      setTransactions(data);
    } catch (error) {
      setTransactions(mockTransactions);
    }
  };

  const handleAdd = () => {
    setEditingTransaction(null);
    setFormData({
      date: new Date().toISOString().split("T")[0],
      type: "income",
      head: "",
      amount: 0,
      description: "",
      party: "",
    });
    setIsModalOpen(true);
  };

  const handleEdit = (transaction: MockTransaction) => {
    setEditingTransaction(transaction);
    setFormData({
      date: transaction.date,
      type: transaction.type,
      head: transaction.head,
      amount: transaction.amount,
      description: transaction.description,
      party: transaction.party || "",
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (transaction: MockTransaction) => {
    if (window.confirm("Are you sure you want to delete this transaction?")) {
      try {
        await fetch(`/api/transactions/${transaction.id}`, {
          method: "DELETE",
        });
        await fetchTransactions();
      } catch (error) {
        console.error("Failed to delete transaction");
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = editingTransaction
        ? `/api/transactions/${editingTransaction.id}`
        : "/api/transactions";
      const method = editingTransaction ? "PUT" : "POST";

      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      await fetchTransactions();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to save transaction");
    }
    setLoading(false);
  };

  const filteredTransactions =
    filterType === "all"
      ? transactions
      : transactions.filter((t) => t.type === filterType);

  const columns = [
    { key: "date", label: "Date", sortable: true },
    {
      key: "type",
      label: "Type",
      sortable: true,
      render: (value: string) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            value === "income"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </span>
      ),
    },
    { key: "head", label: "Head", sortable: true },
    {
      key: "amount",
      label: "Amount",
      sortable: true,
      render: (value: number, row: MockTransaction) => (
        <span
          className={`font-medium ${
            row.type === "income" ? "text-green-600" : "text-red-600"
          }`}
        >
          ৳{value.toLocaleString()}
        </span>
      ),
    },
    { key: "description", label: "Description", sortable: true },
    { key: "party", label: "Party", sortable: true },
  ];

  // Calculate summary stats
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((acc, t) => acc + t.amount, 0);

  const netAmount = totalIncome - totalExpense;

  return (
    <div className="p-6">
      <Breadcrumb
        items={[{ label: "Accounts" }, { label: "All Transactions" }]}
      />

      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Receipt className="w-6 h-6 text-[#AF792F]" />
          <h1 className="text-2xl font-bold text-gray-900">All Transactions</h1>
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <p className="text-gray-600">
            Track all income and expense transactions
          </p>
          <div className="flex items-center gap-3">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#AF792F] focus:border-transparent"
            >
              <option value="all">All Transactions</option>
              <option value="income">Income Only</option>
              <option value="expense">Expense Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-sm font-medium text-gray-500">
            Total Transactions
          </h3>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {filteredTransactions.length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Income</h3>
          <p className="text-2xl font-bold text-green-600 mt-2">
            ৳{totalIncome.toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Expense</h3>
          <p className="text-2xl font-bold text-red-600 mt-2">
            ৳{totalExpense.toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-sm font-medium text-gray-500">Net Amount</h3>
          <p
            className={`text-2xl font-bold mt-2 ${
              netAmount >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            ৳{Math.abs(netAmount).toLocaleString()}
          </p>
        </div>
      </div>

      <DataTable
        data={filteredTransactions}
        columns={columns}
        title={`${
          filterType === "all"
            ? "All"
            : filterType.charAt(0).toUpperCase() + filterType.slice(1)
        } Transactions`}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        searchPlaceholder="Search transactions..."
        addButtonLabel="Add Transaction"
      />

      <FormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTransaction ? "Edit Transaction" : "Add New Transaction"}
        size="lg"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, date: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#AF792F] focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transaction Type
              </label>
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    type: e.target.value as "income" | "expense",
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#AF792F] focus:border-transparent"
                required
              >
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Account Head
              </label>
              <select
                value={formData.head}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, head: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#AF792F] focus:border-transparent"
                required
              >
                <option value="">Select Head</option>
                {(formData.type === "income" ? incomeHeads : expenseHeads).map(
                  (head) => (
                    <option key={head.id} value={head.name}>
                      {head.name}
                    </option>
                  )
                )}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount (BDT)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.amount}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    amount: parseFloat(e.target.value),
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#AF792F] focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Party (Optional)
              </label>
              <input
                type="text"
                value={formData.party}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, party: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#AF792F] focus:border-transparent"
                placeholder="Party name"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#AF792F] focus:border-transparent"
                placeholder="Transaction description"
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-[#AF792F] hover:bg-[#9A6B28] text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading
                ? "Saving..."
                : editingTransaction
                ? "Update Transaction"
                : "Add Transaction"}
            </button>
          </div>
        </form>
      </FormModal>
    </div>
  );
};
