import { useEffect, useState } from "react";
import { Button } from "../../components/ui/Button";
import { Table } from "../../components/ui/Table";
import { Modal } from "../../components/ui/Modal";
import { Card } from "../../components/ui/Card";
import { FilterBar } from "../../components/ui/FilterBar";
import { Plus, Trash2, CreditCard, Printer, BookOpen } from "lucide-react";

// Party Payment entity type for this page
export interface PartyPayment {
  id: string;
  date: string;
  type: string;
  head: string;
  party: string;
  description: string;
  createdBy: string;
  amount: number;
}

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

const PartyPayments = () => {
  const [data, setData] = useState<PartyPayment[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<PartyPayment | null>(null);
  const [formData, setFormData] = useState({
    date: "",
    type: "",
    head: "",
    party: "",
    description: "",
    amount: 0,
  });
  const [search, setSearch] = useState("");
  const [partyFilter, setPartyFilter] = useState("");
  const [voucherTypeFilter, setVoucherTypeFilter] = useState("");

  // Fetch all (GET)
  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (partyFilter) params.append("party", partyFilter);
    if (voucherTypeFilter) params.append("type", voucherTypeFilter);
    fetch(`/api/party-payments?${params.toString()}`)
      .then((res) => res.json())
      .then((res) =>
        setData(res.map((item: any) => ({ ...item, id: String(item.id) })))
      )
      .finally(() => setLoading(false));
  }, [search, partyFilter, voucherTypeFilter]);

  // Create
  const handleCreate = () => {
    setLoading(true);
    fetch("/api/party-payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    })
      .then((res) => res.json())
      .then((created) =>
        setData((prev) => [{ ...created, id: String(created.id) }, ...prev])
      )
      .finally(() => {
        setModalOpen(false);
        setFormData({
          date: "",
          type: "",
          head: "",
          party: "",
          description: "",
          amount: 0,
        });
        setLoading(false);
      });
  };

  // Update
  const handleUpdate = () => {
    if (!editItem) return;
    setLoading(true);
    fetch(`/api/party-payments/${editItem.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    })
      .then((res) => res.json())
      .then((updated) =>
        setData((prev) =>
          prev.map((row) =>
            row.id === String(updated.id)
              ? { ...updated, id: String(updated.id) }
              : row
          )
        )
      )
      .finally(() => {
        setModalOpen(false);
        setEditItem(null);
        setFormData({
          date: "",
          type: "",
          head: "",
          party: "",
          description: "",
          amount: 0,
        });
        setLoading(false);
      });
  };

  // Delete (single or bulk)
  const handleDelete = (ids: string[]) => {
    setLoading(true);
    Promise.all(
      ids.map((id) => fetch(`/api/party-payments/${id}`, { method: "DELETE" }))
    )
      .then(() =>
        setData((prev) => prev.filter((row) => !ids.includes(row.id)))
      )
      .finally(() => {
        setSelectedRows([]);
        setLoading(false);
      });
  };

  // Table columns
  const columns = [
    { key: "id", label: "#" },
    { key: "date", label: "Date" },
    { key: "type", label: "Type" },
    { key: "head", label: "Head" },
    { key: "party", label: "Party" },
    { key: "description", label: "Description" },
    { key: "createdBy", label: "Created By" },
    {
      key: "amount",
      label: "Amount",
      render: (value: number) => value.toLocaleString(),
    },
  ];

  // Stat card
  const totalPayments = data.length;
  const totalAmount = data.reduce((sum, d) => sum + (d.amount || 0), 0);

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Party Payments</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage all party payments, filter by party or voucher type, and print
          vouchers.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <Card icon={<CreditCard className="w-8 h-8 text-primary-800" />}>
          <div>
            <div className="text-xs uppercase text-gray-500 font-semibold">
              Total Payments
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {totalPayments}
            </div>
          </div>
        </Card>
        <Card icon={<BookOpen className="w-8 h-8 text-primary-800" />}>
          <div>
            <div className="text-xs uppercase text-gray-500 font-semibold">
              Total Amount
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {totalAmount.toLocaleString()}
            </div>
          </div>
        </Card>
        <Card icon={<Plus className="w-8 h-8 text-blue-700" />}>
          <div>
            <div className="text-xs uppercase text-gray-500 font-semibold">
              New Payments
            </div>
            <div className="text-2xl font-bold text-gray-900">0</div>
          </div>
        </Card>
      </div>
      <div className="mb-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => {
              setEditItem(null);
              setFormData({
                date: "",
                type: "",
                head: "",
                party: "",
                description: "",
                amount: 0,
              });
              setModalOpen(true);
            }}
            icon={Plus}
            size="sm"
          >
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
          <Button variant="outline" size="sm" icon={Printer} onClick={() => {}}>
            Print
          </Button>
        </div>
      </div>
      <FilterBar
        onSearch={(val) => setSearch(val)}
        placeholder="Search by party, head, or description"
      >
        {/* Party filter dropdown (optional, can be replaced with shared Select) */}
        <select
          className="input-base ml-2"
          value={partyFilter}
          onChange={(e) => setPartyFilter(e.target.value)}
        >
          <option value="">All Parties</option>
          {/* TODO: Dynamically load parties from API if needed */}
          <option value="Supplier">Supplier</option>
          <option value="Customer">Customer</option>
        </select>
        {/* Voucher type filter dropdown */}
        <select
          className="input-base ml-2"
          value={voucherTypeFilter}
          onChange={(e) => setVoucherTypeFilter(e.target.value)}
        >
          <option value="">All Types</option>
          <option value="Receive">Receive</option>
          <option value="Payment">Payment</option>
        </select>
      </FilterBar>
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
              date: row.date,
              type: row.type,
              head: row.head,
              party: row.party,
              description: row.description,
              amount: row.amount,
            });
            setModalOpen(true);
          },
        }}
        summaryRow={{
          id: <span className="font-semibold">Total</span>,
          date: "",
          type: "",
          head: "",
          party: "",
          description: "",
          createdBy: "",
          amount: (
            <span className="font-bold">{totalAmount.toLocaleString()}</span>
          ),
        }}
      />
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editItem ? "Edit Payment" : "New Payment"}
        size="md"
      >
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            editItem ? handleUpdate() : handleCreate();
          }}
        >
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
              Type *
            </label>
            <input
              type="text"
              value={formData.type}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, type: e.target.value }))
              }
              className="input-base"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Head *
            </label>
            <input
              type="text"
              value={formData.head}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, head: e.target.value }))
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
            <Button type="submit" loading={loading}>
              {editItem ? "Update" : "Save"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default PartyPayments;
