import { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  Printer,
  CreditCard,
  Package,
  DollarSign,
  RefreshCcw,
} from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Table } from "../../components/ui/Table";
import { Modal } from "../../components/ui/Modal";
import { FilterBar } from "../../components/ui/FilterBar";
import { SkeletonCard } from "../../components/ui/Skeleton";
import { useToast } from "../../components/ui/Toast";
import { api } from "../../utils/fetcher";
import { ApiResponse } from "../../types";
import { formatCurrency } from "../../utils/formatters";

interface EmptybagPayment {
  id: string;
  date: string;
  invoiceNo: string;
  partyId: string;
  partyName: string;
  items: number;
  quantity: number;
  amount: number;
  paymentMode: string;
  referenceNo: string;
  description: string;
  createdAt: string;
}

interface Party {
  id: string;
  name: string;
}

interface PaymentFormData {
  date: string;
  invoiceNo: string;
  partyId: string;
  items: number;
  quantity: number;
  amount: number;
  paymentMode: string;
  referenceNo: string;
  description: string;
}

const EmptybagPaymentList = () => {
  const [data, setData] = useState<EmptybagPayment[]>([]);
  const [parties, setParties] = useState<Party[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<EmptybagPayment | null>(null);
  const [formData, setFormData] = useState<PaymentFormData>({
    date: "",
    invoiceNo: "",
    partyId: "",
    items: 0,
    quantity: 0,
    amount: 0,
    paymentMode: "cash",
    referenceNo: "",
    description: "",
  });
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const { showToast } = useToast();

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (dateRange.from) params.append("from_date", dateRange.from);
      if (dateRange.to) params.append("to_date", dateRange.to);

      const response = await api.get<ApiResponse<EmptybagPayment[]>>(
        `/emptybags/payments?${params.toString()}`
      );

      if (response.success && response.data) {
        setData(
          response.data.map((item) => ({ ...item, id: String(item.id) }))
        );
      }
    } catch (error) {
      console.error("Error fetching payments:", error);
      showToast("Failed to load payments", "error");
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  const fetchParties = async () => {
    try {
      const response = await api.get<ApiResponse<Party[]>>("/party/parties");
      if (response.success && response.data) {
        setParties(
          response.data.map((p) => ({ id: String(p.id), name: p.name }))
        );
      }
    } catch (error: any) {
      // Log the error and show a toast so the user sees the failure
      console.error("Error fetching parties:", error?.message ?? error);
      showToast("Failed to load parties", "error");
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchPayments();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  useEffect(() => {
    fetchPayments();
    fetchParties();
  }, []);

  useEffect(() => {
    if (!initialLoading) {
      fetchPayments();
    }
  }, [dateRange.from, dateRange.to]);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "k") {
        event.preventDefault();
        document
          .querySelector<HTMLInputElement>('input[type="search"]')
          ?.focus();
      }
      if ((event.ctrlKey || event.metaKey) && event.key === "r") {
        event.preventDefault();
        handleRefresh();
      }
      if ((event.ctrlKey || event.metaKey) && event.key === "p") {
        event.preventDefault();
        handlePrint();
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const filteredData = data.filter((item) => {
    const query = search.toLowerCase().trim();
    if (!query) return true;

    return (
      item.invoiceNo?.toLowerCase().includes(query) ||
      item.partyName?.toLowerCase().includes(query) ||
      item.referenceNo?.toLowerCase().includes(query) ||
      item.description?.toLowerCase().includes(query) ||
      false
    );
  });

  const totalPages = Math.ceil(filteredData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = filteredData.slice(startIndex, startIndex + pageSize);

  const totalPayments = filteredData.length;
  const totalQuantity = filteredData.reduce((sum, s) => sum + s.quantity, 0);
  const totalAmount = filteredData.reduce((sum, s) => sum + s.amount, 0);

  const totals = {
    quantity: filteredData.reduce((sum, s) => sum + s.quantity, 0),
    amount: filteredData.reduce((sum, s) => sum + s.amount, 0),
  };

  const handleCreate = async () => {
    if (!formData.date.trim()) {
      showToast("Date is required", "error");
      return;
    }

    if (!formData.invoiceNo.trim()) {
      showToast("Invoice number is required", "error");
      return;
    }

    if (!formData.partyId) {
      showToast("Party is required", "error");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post<ApiResponse<EmptybagPayment>>(
        "/emptybags/payments",
        formData
      );

      if (response.success) {
        showToast(
          response.message || "Payment created successfully",
          "success"
        );
        await fetchPayments();
        handleModalClose();
      }
    } catch (error) {
      console.error("Error creating payment:", error);
      showToast("Failed to create payment", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!editItem) return;

    if (!formData.date.trim()) {
      showToast("Date is required", "error");
      return;
    }

    if (!formData.invoiceNo.trim()) {
      showToast("Invoice number is required", "error");
      return;
    }

    if (!formData.partyId) {
      showToast("Party is required", "error");
      return;
    }

    setLoading(true);
    try {
      const response = await api.put<ApiResponse<EmptybagPayment>>(
        `/emptybags/payments/${editItem.id}`,
        formData
      );

      if (response.success) {
        showToast(
          response.message || "Payment updated successfully",
          "success"
        );
        await fetchPayments();
        handleModalClose();
      }
    } catch (error) {
      console.error("Error updating payment:", error);
      showToast("Failed to update payment", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (ids: string[]) => {
    if (!confirm(`Are you sure you want to delete ${ids.length} payment(s)?`)) {
      return;
    }

    setLoading(true);
    try {
      const response = await api.delete<ApiResponse<void>>(
        "/emptybags/payments",
        {
          ids,
        }
      );

      if (response.success) {
        showToast(
          response.message || "Payments deleted successfully",
          "success"
        );
        await fetchPayments();
        setSelectedRows([]);
      }
    } catch (error) {
      console.error("Error deleting payments:", error);
      showToast("Failed to delete payments", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleNewPayment = () => {
    setEditItem(null);
    setFormData({
      date: "",
      invoiceNo: "",
      partyId: "",
      items: 0,
      quantity: 0,
      amount: 0,
      paymentMode: "cash",
      referenceNo: "",
      description: "",
    });
    setModalOpen(true);
  };

  const handleEdit = (row: EmptybagPayment) => {
    setEditItem(row);
    setFormData({
      date: row.date,
      invoiceNo: row.invoiceNo,
      partyId: row.partyId,
      items: row.items || 0,
      quantity: row.quantity || 0,
      amount: row.amount || 0,
      paymentMode: row.paymentMode || "cash",
      referenceNo: row.referenceNo || "",
      description: row.description || "",
    });
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setEditItem(null);
    setFormData({
      date: "",
      invoiceNo: "",
      partyId: "",
      items: 0,
      quantity: 0,
      amount: 0,
      paymentMode: "cash",
      referenceNo: "",
      description: "",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    editItem ? handleUpdate() : handleCreate();
  };

  const handlePrint = () => {
    window.print();
  };

  const columns = [
    { key: "id", label: "#", width: "60px" },
    {
      key: "date",
      label: "Date",
      sortable: true,
      render: (value: string) =>
        new Date(value).toLocaleDateString("en-NG", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
    },
    { key: "invoiceNo", label: "Invoice No", sortable: true },
    { key: "partyName", label: "Party", sortable: true },
    {
      key: "items",
      label: "Items",
      render: (value: number) => value.toLocaleString(),
    },
    {
      key: "quantity",
      label: "Quantity",
      render: (value: number) => value.toLocaleString(),
    },
    {
      key: "amount",
      label: "Amount",
      render: (value: number) => `₦${formatCurrency(value)}`,
    },
    { key: "paymentMode", label: "Mode" },
  ];

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Empty Bag Payments
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage empty bag payment records and transactions.
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className={`p-2 text-gray-500 hover:text-gray-700 transition-colors ${
            isRefreshing ? "animate-spin" : ""
          }`}
          title="Refresh data (Ctrl+R)"
        >
          <RefreshCcw className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
        {initialLoading ? (
          <>
            <SkeletonCard variant="stat" />
            <SkeletonCard variant="stat" />
            <SkeletonCard variant="stat" />
          </>
        ) : (
          <>
            <Card
              icon={<CreditCard className="w-8 h-8 text-primary-800" />}
              hover
            >
              <div>
                <p className="text-3xl font-bold text-gray-700">
                  {totalPayments}
                </p>
                <p className="text-sm text-gray-500">Total Payments</p>
              </div>
            </Card>
            <Card icon={<Package className="w-8 h-8 text-blue-600" />} hover>
              <div>
                <p className="text-3xl font-bold text-gray-700">
                  {totalQuantity.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">Total Quantity</p>
              </div>
            </Card>
            <Card
              icon={<DollarSign className="w-8 h-8 text-green-600" />}
              hover
            >
              <div>
                <p className="text-3xl font-bold text-gray-700">
                  ₦{formatCurrency(totalAmount)}
                </p>
                <p className="text-sm text-gray-500">Total Amount</p>
              </div>
            </Card>
          </>
        )}
      </div>

      <FilterBar
        onSearch={setSearch}
        placeholder="Search by invoice, party, reference, or description... (Ctrl+K)"
      >
        <div className="flex items-center space-x-2">
          <input
            type="date"
            value={dateRange.from}
            onChange={(e) =>
              setDateRange((prev) => ({ ...prev, from: e.target.value }))
            }
            className="input-base h-9"
            placeholder="From"
          />
          <input
            type="date"
            value={dateRange.to}
            onChange={(e) =>
              setDateRange((prev) => ({ ...prev, to: e.target.value }))
            }
            className="input-base h-9"
            placeholder="To"
          />
          <Button onClick={handleNewPayment} icon={Plus} size="sm">
            New Payment
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
            onClick={handlePrint}
          >
            Print
          </Button>
        </div>
      </FilterBar>

      <Table
        data={paginatedData}
        columns={columns}
        loading={initialLoading || loading}
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
          onEdit: handleEdit,
        }}
        summaryRow={{
          id: <span className="font-bold">{filteredData.length}</span>,
          date: "",
          invoiceNo: <span className="font-semibold">Total</span>,
          partyName: "",
          items: "",
          quantity: (
            <span className="font-bold">
              {totals.quantity.toLocaleString()}
            </span>
          ),
          amount: (
            <span className="font-bold">₦{formatCurrency(totals.amount)}</span>
          ),
          paymentMode: "",
        }}
      />

      <Modal
        isOpen={modalOpen}
        onClose={handleModalClose}
        title={editItem ? "Edit Payment" : "New Payment"}
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 required">
                Date
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, date: e.target.value }))
                }
                className="input-base"
                required
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 required">
                Invoice No
              </label>
              <input
                type="text"
                value={formData.invoiceNo}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    invoiceNo: e.target.value,
                  }))
                }
                className="input-base"
                placeholder="Enter invoice number"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 required">
                Party
              </label>
              <select
                value={formData.partyId}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, partyId: e.target.value }))
                }
                className="input-base"
                required
              >
                <option value="" disabled>
                  Select party
                </option>
                {parties.map((party) => (
                  <option key={party.id} value={party.id}>
                    {party.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Items
              </label>
              <input
                type="number"
                value={formData.items || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    items: Number(e.target.value),
                  }))
                }
                className="input-base"
                placeholder="0"
                min="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity
              </label>
              <input
                type="number"
                value={formData.quantity || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    quantity: Number(e.target.value),
                  }))
                }
                className="input-base"
                placeholder="0"
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount (₦)
              </label>
              <input
                type="number"
                value={formData.amount || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    amount: Number(e.target.value),
                  }))
                }
                className="input-base"
                placeholder="0"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Mode
              </label>
              <select
                value={formData.paymentMode}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    paymentMode: e.target.value,
                  }))
                }
                className="input-base"
              >
                <option value="cash">Cash</option>
                <option value="bank">Bank</option>
                <option value="upi">UPI</option>
                <option value="cheque">Cheque</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reference No
              </label>
              <input
                type="text"
                value={formData.referenceNo}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    referenceNo: e.target.value,
                  }))
                }
                className="input-base"
                placeholder="Enter reference number"
              />
            </div>
          </div>

          <div>
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
              className="input-base"
              rows={3}
              placeholder="Enter description"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="outline" onClick={handleModalClose}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} loading={loading}>
              {editItem ? "Update" : "Save"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default EmptybagPaymentList;
