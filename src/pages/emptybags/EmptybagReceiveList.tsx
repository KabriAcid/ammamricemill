import { useEffect, useState } from "react";
import { Select } from "../../components/ui/Select";
import { Button } from "../../components/ui/Button";
import { Table } from "../../components/ui/Table";
import { Modal } from "../../components/ui/Modal";
import { Card } from "../../components/ui/Card";
import { FilterBar } from "../../components/ui/FilterBar";
import {
  Plus,
  Trash2,
  Printer,
  RefreshCcw,
  PackagePlus,
  Package,
  DollarSign,
} from "lucide-react";
import { SkeletonCard } from "../../components/ui/Skeleton";
import { useToast } from "../../components/ui/Toast";
import { api } from "../../utils/fetcher";
import { formatCurrency, formatNumber } from "../../utils/formatters";
import { ApiResponse } from "../../types";

interface ReceiveOrder {
  id: string;
  date: string;
  invoiceNo: string;
  party: string;
  party_id?: string;
  items: number;
  quantity: number;
  price: number;
  description?: string;
}

interface ReceiveFormData {
  date: string;
  invoiceNo: string;
  party_id: string;
  items: number;
  quantity: number;
  price: number;
  description: string;
}

const EmptybagReceiveList = () => {
  const [data, setData] = useState<ReceiveOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<ReceiveOrder | null>(null);
  const [formData, setFormData] = useState<ReceiveFormData>({
    date: "",
    invoiceNo: "",
    party_id: "",
    items: 0,
    quantity: 0,
    price: 0,
    description: "",
  });

  const [parties, setParties] = useState<{ id: string; name: string }[]>([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const { showToast } = useToast();

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      date: prev.date || new Date().toISOString().split("T")[0],
    }));
  }, []);

  useEffect(() => {
    api
      .get<ApiResponse<{ id: string; name: string }[]>>("/party/parties")
      .then((res) => {
        if (res.success && res.data)
          setParties(res.data.map((p) => ({ id: String(p.id), name: p.name })));
      });
  }, []);

  const fetchReceive = async () => {
    setLoading(true);
    try {
      const res = await api.get<ApiResponse<ReceiveOrder[]>>(
        "/emptybag-receive"
      );
      if (res.success && res.data) {
        setData(
          res.data.map((d) => ({
            ...d,
            id: String(d.id),
            party_id: d.party_id ? String(d.party_id) : "",
          }))
        );
      }
    } catch (err) {
      console.error(err);
      showToast("Failed to load receive orders", "error");
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    fetchReceive();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchReceive();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const filteredData = data.filter((item) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      item.invoiceNo.toLowerCase().includes(q) ||
      item.party.toLowerCase().includes(q) ||
      item.description?.toLowerCase().includes(q) ||
      false
    );
  });

  const totalPages = Math.ceil(filteredData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = filteredData.slice(startIndex, startIndex + pageSize);

  const totalOrders = filteredData.length;
  const totalQuantity = filteredData.reduce((s, d) => s + (d.quantity || 0), 0);
  const totalPrice = filteredData.reduce((s, d) => s + (d.price || 0), 0);

  const handleNew = () => {
    setEditItem(null);
    setFormData({
      date: new Date().toISOString().split("T")[0],
      invoiceNo: "",
      party_id: "",
      items: 0,
      quantity: 0,
      price: 0,
      description: "",
    });
    setModalOpen(true);
  };

  const handleEdit = (row: ReceiveOrder) => {
    setEditItem(row);
    setFormData({
      date: row.date,
      invoiceNo: row.invoiceNo,
      party_id: row.party_id || "",
      items: row.items || 0,
      quantity: row.quantity || 0,
      price: row.price || 0,
      description: row.description || "",
    });
    setModalOpen(true);
  };

  const handleDelete = async (ids: string[]) => {
    if (!confirm(`Are you sure you want to delete ${ids.length} receive(s)?`))
      return;
    setLoading(true);
    try {
      const res = await api.delete<ApiResponse<void>>("/emptybag-receive", {
        ids,
      });
      if (res.success) {
        showToast(res.message || "Deleted", "success");
        await fetchReceive();
        setSelectedRows([]);
      }
    } catch (err) {
      console.error(err);
      showToast("Failed to delete", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // basic validation
    if (!formData.date) {
      showToast("Date is required", "error");
      return;
    }
    if (!formData.invoiceNo.trim()) {
      showToast("Invoice No required", "error");
      return;
    }

    setLoading(true);
    try {
      if (editItem) {
        const res = await api.put<ApiResponse<ReceiveOrder>>(
          `/emptybag-receive/${editItem.id}`,
          formData
        );
        if (res.success) {
          showToast(res.message || "Updated", "success");
          await fetchReceive();
          setModalOpen(false);
        }
      } else {
        const res = await api.post<ApiResponse<ReceiveOrder>>(
          `/emptybag-receive`,
          formData
        );
        if (res.success) {
          showToast(res.message || "Created", "success");
          await fetchReceive();
          setModalOpen(false);
        }
      }
    } catch (err) {
      console.error(err);
      showToast("Failed to save", "error");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: "id", label: "#", width: "60px" },
    {
      key: "date",
      label: "Date",
      render: (v: string) => (v ? new Date(v).toLocaleDateString() : ""),
    },
    { key: "invoiceNo", label: "Invoice No" },
    { key: "party", label: "Party" },
    { key: "items", label: "Items" },
    {
      key: "quantity",
      label: "Quantity",
      render: (v: number) => formatNumber(v, 0),
    },
    {
      key: "price",
      label: "Price",
      render: (v: number) => `₦${formatCurrency(v)}`,
    },
    { key: "description", label: "Description" },
  ];

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Emptybag Receive List
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage received empty bags and inventory entries.
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
              icon={<PackagePlus className="w-8 h-8 text-primary-800" />}
              hover
            >
              <div>
                <p className="text-3xl font-bold text-gray-700">
                  {totalOrders}
                </p>
                <p className="text-sm text-gray-500">Total Receives</p>
              </div>
            </Card>
            <Card icon={<Package className="w-8 h-8 text-blue-600" />} hover>
              <div>
                <p className="text-3xl font-bold text-gray-700">
                  {formatNumber(totalQuantity, 0)}
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
                  ₦{formatCurrency(totalPrice)}
                </p>
                <p className="text-sm text-gray-500">Total Value</p>
              </div>
            </Card>
          </>
        )}
      </div>

      <FilterBar
        onSearch={setSearch}
        placeholder="Search by invoice, party, or description... (Ctrl+K)"
      >
        <div className="flex items-center space-x-2">
          <Button onClick={handleNew} icon={Plus} size="sm">
            New Receive
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
        actions={{ onEdit: handleEdit }}
        summaryRow={{
          id: <span className="font-bold">{filteredData.length}</span>,
          date: <span className="font-semibold">Total</span>,
          invoiceNo: "",
          party: "",
          items: "",
          quantity: (
            <span className="font-bold">{formatNumber(totalQuantity, 0)}</span>
          ),
          price: (
            <span className="font-bold">₦{formatCurrency(totalPrice)}</span>
          ),
          description: "",
        }}
      />

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editItem ? "Edit Receive" : "New Receive"}
        size="lg"
      >
        <form className="space-y-4" onSubmit={handleSubmit}>
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 required">
              Party
            </label>
            <Select
              value={formData.party_id}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, party_id: e.target.value }))
              }
              className="input-base"
              required
            >
              <option value="">Select party</option>
              {parties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price (₦)
              </label>
              <input
                type="number"
                value={formData.price || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    price: Number(e.target.value),
                  }))
                }
                className="input-base"
                placeholder="0"
                min="0"
                step="0.01"
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
              placeholder="Enter notes (optional)"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              type="button"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              {editItem ? "Update" : "Save"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default EmptybagReceiveList;
