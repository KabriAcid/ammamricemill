import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
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
  ArrowDownCircle,
  ArrowUpCircle,
  Eye,
  Receipt,
  Send,
  FileInvoice,
} from "lucide-react";
import { Card } from "../../components/ui/Card";
import { SkeletonCard } from "../../components/ui/Skeleton";
import { useToast } from "../../components/ui/Toast";
import { api } from "../../utils/fetcher";
import { ApiResponse } from "../../types";
import { format } from "date-fns";

// Transaction types
interface TransactionRow {
  id: string;
  voucherNumber: string;
  date: string;
  partyName: string;
  partyId: string;
  voucherType: "receive" | "payment" | "sales_voucher" | "purchase_voucher" | "journal" | "contra";
  fromHead: string;
  fromHeadId: string;
  fromHeadType: string;
  toHead: string;
  toHeadId: string;
  toHeadType: string;
  description: string;
  amount: number;
  status: "active" | "inactive";
  createdBy: string;
  createdAt: string;
}

interface StatsData {
  totalTransactions: number;
  totalReceive: number;
  totalPayment: number;
  totalAmount: number;
  activeCount: number;
  inactiveCount: number;
}

interface HeadOption {
  id: string;
  name: string;
}

interface PartyOption {
  id: string;
  name: string;
}

const Transactions = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [data, setData] = useState<TransactionRow[]>([]);
  const [stats, setStats] = useState<StatsData>({
    totalTransactions: 0,
    totalReceive: 0,
    totalPayment: 0,
    totalAmount: 0,
    activeCount: 0,
    inactiveCount: 0,
  });
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<TransactionRow | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Filter states
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [voucherTypeFilter, setVoucherTypeFilter] = useState("");
  const [headTypeFilter, setHeadTypeFilter] = useState("");
  const [partyFilter, setPartyFilter] = useState("");

  // Head and party options
  const [incomeHeads, setIncomeHeads] = useState<HeadOption[]>([]);
  const [expenseHeads, setExpenseHeads] = useState<HeadOption[]>([]);
  const [bankHeads, setBankHeads] = useState<HeadOption[]>([]);
  const [otherHeads, setOtherHeads] = useState<HeadOption[]>([]);
  const [parties, setParties] = useState<PartyOption[]>([]);

  const [formData, setFormData] = useState({
    date: "",
    voucherType: "receive" as "receive" | "payment" | "sales_voucher" | "purchase_voucher" | "journal" | "contra",
    partyId: "",
    fromHeadType: "income" as "income" | "expense" | "bank" | "others",
    fromHeadId: "",
    toHeadType: "" as "" | "income" | "expense" | "bank" | "others",
    toHeadId: "",
    description: "",
    amount: 0,
  });

  // Fetch transactions with filters
  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (fromDate) params.append("fromDate", fromDate);
      if (toDate) params.append("toDate", toDate);
      if (voucherTypeFilter) params.append("voucherType", voucherTypeFilter);
      if (headTypeFilter) params.append("headType", headTypeFilter);
      if (partyFilter) params.append("partyId", partyFilter);

      const response = await api.get<ApiResponse<TransactionRow[], { stats: StatsData }>>(
        `/accounts/transactions/v2?${params.toString()}`
      );
      
      if (response.success && response.data) {
        setData(response.data);
        if (response.stats) {
          setStats(response.stats);
        }
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

  // Fetch head options
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

  // Fetch parties
  const fetchParties = async () => {
    try {
      const response = await api.get<ApiResponse<PartyOption[]>>("/party/parties");
      if (response.success && response.data) {
        setParties(response.data);
      }
    } catch (error) {
      console.error("Error fetching parties:", error);
    }
  };

  useEffect(() => {
    fetchTransactions();
    fetchHeadOptions();
    fetchParties();
  }, [fromDate, toDate, voucherTypeFilter, headTypeFilter, partyFilter]);

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

  // Filter data by search
  const filteredData = data.filter(
    (item) =>
      (item.description?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (item.fromHead?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (item.toHead?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (item.partyName?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (item.voucherNumber?.toLowerCase() || "").includes(searchQuery.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = filteredData.slice(startIndex, startIndex + pageSize);

  // Create transaction
  const handleCreate = async () => {
    if (!formData.date || !formData.voucherType || !formData.amount || !formData.fromHeadId) {
      showToast("Please fill all required fields", "error");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post<ApiResponse<TransactionRow>>(
        "/accounts/transactions/v2",
        formData
      );

      if (response.success) {
        showToast(response.message || "Transaction created successfully", "success");
        setModalOpen(false);
        resetForm();
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

  // Update transaction
  const handleUpdate = async () => {
    if (!editItem) return;
    if (!formData.date || !formData.amount) {
      showToast("Please fill all required fields", "error");
      return;
    }

    setLoading(true);
    try {
      const response = await api.put<ApiResponse<TransactionRow>>(
        `/accounts/transactions/v2/${editItem.id}`,
        {
          date: formData.date,
          description: formData.description,
          amount: formData.amount,
          partyId: formData.partyId || null,
        }
      );

      if (response.success) {
        showToast(response.message || "Transaction updated successfully", "success");
        setModalOpen(false);
        setEditItem(null);
        resetForm();
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

  // Delete transactions
  const handleDelete = async () => {
    if (selectedRows.length === 0) {
      showToast("Please select at least one transaction to delete", "error");
      return;
    }

    if (!confirm(`Are you sure you want to delete ${selectedRows.length} transaction(s)?`)) {
      return;
    }

    setLoading(true);
    try {
      const response = await api.delete<ApiResponse<{ deletedCount: number }>>(
        "/accounts/transactions/v2",
        { ids: selectedRows }
      );

      if (response.success) {
        showToast(response.message || `${selectedRows.length} transaction(s) deleted successfully`, "success");
        setSelectedRows([]);
        await fetchTransactions();
      } else {
        throw new Error("Failed to delete transactions");
      }
    } catch (error) {
      console.error("Error deleting transactions:", error);
      showToast("Failed to delete transactions", "error");
    } finally {
      setLoading(false);
    }
  };

  // Helper functions
  const resetForm = () => {
    setFormData({
      date: "",
      voucherType: "receive",
      partyId: "",
      fromHeadType: "income",
      fromHeadId: "",
      toHeadType: "",
      toHeadId: "",
      description: "",
      amount: 0,
    });
  };

  const openEditModal = (item: TransactionRow) => {
    setEditItem(item);
    setFormData({
      date: item.date,
      voucherType: item.voucherType,
      partyId: item.partyId || "",
      fromHeadType: item.fromHeadType as any,
      fromHeadId: item.fromHeadId,
      toHeadType: item.toHeadType as any,
      toHeadId: item.toHeadId || "",
      description: item.description || "",
      amount: typeof item.amount === 'string' ? parseFloat(item.amount) : item.amount,
    });
    setModalOpen(true);
  };

  const openCreateModal = (type: "receive" | "payment" | "sales_voucher") => {
    setEditItem(null);
    resetForm();
    setFormData(prev => ({ ...prev, voucherType: type }));
    setModalOpen(true);
  };

  const getHeadOptions = (headType: string) => {
    switch (headType) {
      case "income": return incomeHeads;
      case "expense": return expenseHeads;
      case "bank": return bankHeads;
      case "others": return otherHeads;
      default: return [];
    }
  };

  const getVoucherTypeColor = (type: string) => {
    switch (type) {
      case "receive": return "text-green-600 bg-green-50";
      case "payment": return "text-red-600 bg-red-50";
      case "sales_voucher": return "text-blue-600 bg-blue-50";
      case "purchase_voucher": return "text-purple-600 bg-purple-50";
      case "journal": return "text-yellow-600 bg-yellow-50";
      case "contra": return "text-gray-600 bg-gray-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  const getVoucherTypeLabel = (type: string) => {
    switch (type) {
      case "receive": return "Receipt";
      case "payment": return "Payment";
      case "sales_voucher": return "Sales";
      case "purchase_voucher": return "Purchase";
      case "journal": return "Journal";
      case "contra": return "Contra";
      default: return type;
    }
  };

  // Table columns
  const columns = [
    {
      key: "voucherNumber",
      label: "Voucher #",
      render: (value: string) => (
        <span className="font-mono text-sm">{value}</span>
      ),
    },
    {
      key: "date",
      label: "Date",
      render: (value: string) => format(new Date(value), "dd/MM/yyyy"),
    },
    {
      key: "voucherType",
      label: "Type",
      render: (value: string) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getVoucherTypeColor(value)}`}>
          {getVoucherTypeLabel(value)}
        </span>
      ),
    },
    {
      key: "partyName",
      label: "Party",
      render: (value: string) => value || "N/A",
    },
    {
      key: "fromHead",
      label: "From Account",
      render: (value: string) => (
        <span className="text-sm truncate max-w-xs">{value}</span>
      ),
    },
    {
      key: "toHead",
      label: "To Account",
      render: (value: string) => (
        <span className="text-sm truncate max-w-xs">{value || "—"}</span>
      ),
    },
    {
      key: "amount",
      label: "Amount",
      render: (value: number | string) => {
        const amount = typeof value === 'string' ? parseFloat(value) : value;
        return (
          <span className="font-semibold">
            ₦{amount.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
          </span>
        );
      },
    },
    {
      key: "status",
      label: "Status",
      render: (value: string) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
        }`}>
          {value.toUpperCase()}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (_: any, row: TransactionRow) => (
        <Button
          size="sm"
          variant="outline"
          icon={Eye}
          onClick={() => navigate(`/accounts/transactions/${row.id}`)}
        >
          View
        </Button>
      ),
    },
  ];

  const loadingCards = loading && initialLoading;

  // Calculate total amounts for current filtered view
  const viewTotalReceive = filteredData
    .filter(t => t.voucherType === 'receive')
    .reduce((sum, t) => {
      const amount = typeof t.amount === 'string' ? parseFloat(t.amount) : t.amount;
      return sum + amount;
    }, 0);

  const viewTotalPayment = filteredData
    .filter(t => t.voucherType === 'payment')
    .reduce((sum, t) => {
      const amount = typeof t.amount === 'string' ? parseFloat(t.amount) : t.amount;
      return sum + amount;
    }, 0);

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage all financial transactions and vouchers
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card icon={<FileText size={32} />} loading={loadingCards} hover>
          <div>
            <p className="text-3xl font-bold text-gray-700">
              {stats.totalTransactions}
            </p>
            <p className="text-sm text-gray-500">Total Transactions</p>
          </div>
        </Card>
        <Card icon={<ArrowDownCircle size={32} className="text-green-600" />} loading={loadingCards} hover>
          <div>
            <p className="text-3xl font-bold text-green-700">
              ₦{(typeof stats.totalReceive === 'string' ? parseFloat(stats.totalReceive) : stats.totalReceive).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
            </p>
            <p className="text-sm text-gray-500">Total Receipts</p>
          </div>
        </Card>
        <Card icon={<ArrowUpCircle size={32} className="text-red-600" />} loading={loadingCards} hover>
          <div>
            <p className="text-3xl font-bold text-red-700">
              ₦{(typeof stats.totalPayment === 'string' ? parseFloat(stats.totalPayment) : stats.totalPayment).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
            </p>
            <p className="text-sm text-gray-500">Total Payments</p>
          </div>
        </Card>
        <Card icon={<CheckCircle2 size={32} className="text-blue-600" />} loading={loadingCards} hover>
          <div>
            <p className="text-3xl font-bold text-blue-700">
              {stats.activeCount}
            </p>
            <p className="text-sm text-gray-500">Active Transactions</p>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              From Date
            </label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="input-base"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              To Date
            </label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="input-base"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Voucher Type
            </label>
            <select
              value={voucherTypeFilter}
              onChange={(e) => setVoucherTypeFilter(e.target.value)}
              className="input-base"
            >
              <option value="">All Types</option>
              <option value="receive">Receipt</option>
              <option value="payment">Payment</option>
              <option value="sales_voucher">Sales Voucher</option>
              <option value="purchase_voucher">Purchase Voucher</option>
              <option value="journal">Journal Entry</option>
              <option value="contra">Contra Entry</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Head Type
            </label>
            <select
              value={headTypeFilter}
              onChange={(e) => setHeadTypeFilter(e.target.value)}
              className="input-base"
            >
              <option value="">All Heads</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
              <option value="bank">Bank</option>
              <option value="others">Others</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Party
            </label>
            <select
              value={partyFilter}
              onChange={(e) => setPartyFilter(e.target.value)}
              className="input-base"
            >
              <option value="">All Parties</option>
              {parties.map((party) => (
                <option key={party.id} value={party.id}>
                  {party.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <FilterBar onSearch={setSearchQuery} placeholder="Search transactions...">
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => openCreateModal("receive")}
            icon={ArrowDownCircle}
            size="sm"
            className="bg-green-600 hover:bg-green-700"
          >
            Receive
          </Button>
          <Button
            onClick={() => openCreateModal("payment")}
            icon={ArrowUpCircle}
            size="sm"
            className="bg-red-600 hover:bg-red-700"
          >
            Payment
          </Button>
          <Button
            onClick={() => openCreateModal("sales_voucher")}
            icon={FileInvoice}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700"
          >
            Invoice
          </Button>
          {selectedRows.length > 0 && (
            <Button
              onClick={handleDelete}
              icon={Trash2}
              variant="outline"
              size="sm"
              className="text-red-600 hover:text-red-700 hover:border-red-600"
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

      {/* Summary Row */}
      {filteredData.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 flex justify-between items-center">
          <div>
            <span className="text-sm font-medium text-blue-900">
              Showing {filteredData.length} transaction(s)
            </span>
          </div>
          <div className="flex space-x-6">
            <div className="text-right">
              <p className="text-xs text-blue-600">Total Receipts</p>
              <p className="text-lg font-bold text-green-700">
                ₦{viewTotalReceive.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-blue-600">Total Payments</p>
              <p className="text-lg font-bold text-red-700">
                ₦{viewTotalPayment.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-blue-600">Net Balance</p>
              <p className={`text-lg font-bold ${(viewTotalReceive - viewTotalPayment) >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                ₦{(viewTotalReceive - viewTotalPayment).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <Table
        data={paginatedData}
        columns={columns}
        loading={loading}
        selectedRows={selectedRows}
        onSelectionChange={setSelectedRows}
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
      />

      {/* Create/Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditItem(null);
          resetForm();
        }}
        title={editItem ? "Edit Transaction" : "Create Transaction"}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="input-base"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Voucher Type <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.voucherType}
                onChange={(e) => setFormData({ ...formData, voucherType: e.target.value as any })}
                className="input-base"
                disabled={loading || !!editItem}
              >
                <option value="receive">Receipt</option>
                <option value="payment">Payment</option>
                <option value="sales_voucher">Sales Voucher</option>
                <option value="purchase_voucher">Purchase Voucher</option>
                <option value="journal">Journal Entry</option>
                <option value="contra">Contra Entry</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Party
            </label>
            <select
              value={formData.partyId}
              onChange={(e) => setFormData({ ...formData, partyId: e.target.value })}
              className="input-base"
              disabled={loading || !!editItem}
            >
              <option value="">Select Party (Optional)</option>
              {parties.map((party) => (
                <option key={party.id} value={party.id}>
                  {party.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                From Head Type <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.fromHeadType}
                onChange={(e) => setFormData({ ...formData, fromHeadType: e.target.value as any, fromHeadId: "" })}
                className="input-base"
                disabled={loading || !!editItem}
              >
                <option value="income">Income</option>
                <option value="expense">Expense</option>
                <option value="bank">Bank</option>
                <option value="others">Others</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                From Head <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.fromHeadId}
                onChange={(e) => setFormData({ ...formData, fromHeadId: e.target.value })}
                className="input-base"
                disabled={loading || !!editItem}
              >
                <option value="">Select Head</option>
                {getHeadOptions(formData.fromHeadType).map((head) => (
                  <option key={head.id} value={head.id}>
                    {head.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                To Head Type
              </label>
              <select
                value={formData.toHeadType}
                onChange={(e) => setFormData({ ...formData, toHeadType: e.target.value as any, toHeadId: "" })}
                className="input-base"
                disabled={loading || !!editItem}
              >
                <option value="">None (Optional)</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
                <option value="bank">Bank</option>
                <option value="others">Others</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                To Head
              </label>
              <select
                value={formData.toHeadId}
                onChange={(e) => setFormData({ ...formData, toHeadId: e.target.value })}
                className="input-base"
                disabled={loading || !formData.toHeadType || !!editItem}
              >
                <option value="">Select Head (Optional)</option>
                {formData.toHeadType && getHeadOptions(formData.toHeadType).map((head) => (
                  <option key={head.id} value={head.id}>
                    {head.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
              className="input-base"
              placeholder="0.00"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input-base"
              rows={3}
              placeholder="Enter transaction details..."
              disabled={loading}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setModalOpen(false);
                setEditItem(null);
                resetForm();
              }}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={editItem ? handleUpdate : handleCreate}
              loading={loading}
            >
              {editItem ? "Update" : "Create"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Transactions;
