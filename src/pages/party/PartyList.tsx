import { useEffect, useState } from "react";
import { Button } from "../../components/ui/Button";
import { Table } from "../../components/ui/Table";
import { Modal } from "../../components/ui/Modal";
import { Card } from "../../components/ui/Card";
import { FilterBar } from "../../components/ui/FilterBar";
import { Plus, Trash2, Users, Printer, BookOpen } from "lucide-react";

// Party entity type for this page
export interface Party {
  id: string;
  type: string;
  name: string;
  company: string;
  bankAccountNo: string;
  mobile: string;
  address: string;
  balance: number;
}

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

const PartyList = () => {
  const [data, setData] = useState<Party[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Party | null>(null);
  const [formData, setFormData] = useState({
    type: "",
    name: "",
    company: "",
    bankAccountNo: "",
    mobile: "",
    address: "",
  });
  const [search, setSearch] = useState("");
  const [partyTypeFilter, setPartyTypeFilter] = useState("");

  // Fetch all (GET)
  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (partyTypeFilter) params.append("type", partyTypeFilter);
    fetch(`/api/parties?${params.toString()}`)
      .then((res) => res.json())
      .then((res) =>
        setData(res.map((item: any) => ({ ...item, id: String(item.id) })))
      )
      .finally(() => setLoading(false));
  }, [search, partyTypeFilter]);

  // Create
  const handleCreate = () => {
    setLoading(true);
    fetch("/api/parties", {
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
          type: "",
          name: "",
          company: "",
          bankAccountNo: "",
          mobile: "",
          address: "",
        });
        setLoading(false);
      });
  };

  // Update
  const handleUpdate = () => {
    if (!editItem) return;
    setLoading(true);
    fetch(`/api/parties/${editItem.id}`, {
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
          type: "",
          name: "",
          company: "",
          bankAccountNo: "",
          mobile: "",
          address: "",
        });
        setLoading(false);
      });
  };

  // Delete (single or bulk)
  const handleDelete = (ids: string[]) => {
    setLoading(true);
    Promise.all(
      ids.map((id) => fetch(`/api/parties/${id}`, { method: "DELETE" }))
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
    { key: "type", label: "Type" },
    { key: "name", label: "Name" },
    { key: "company", label: "Company" },
    { key: "bankAccountNo", label: "Bank Account No" },
    { key: "mobile", label: "Mobile" },
    { key: "address", label: "Address" },
    {
      key: "balance",
      label: "Balance",
      render: (value: number) => value.toLocaleString(),
    },
  ];

  // Stat card
  const totalParties = data.length;
  const totalBalance = data.reduce((sum, d) => sum + (d.balance || 0), 0);

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Party List</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage all parties, their balances, and details.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <Card icon={<Users className="w-8 h-8 text-primary-800" />}>
          <div>
            <div className="text-xs uppercase text-gray-500 font-semibold">
              Total Parties
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {totalParties}
            </div>
          </div>
        </Card>
        <Card icon={<BookOpen className="w-8 h-8 text-primary-800" />}>
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
              setFormData({
                type: "",
                name: "",
                company: "",
                bankAccountNo: "",
                mobile: "",
                address: "",
              });
              setModalOpen(true);
            }}
            icon={Plus}
            size="sm"
          >
            New Party
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
        placeholder="Search by name, mobile, or address"
      >
        {/* Party type filter dropdown (optional, can be replaced with shared Select) */}
        <select
          className="input-base ml-2"
          value={partyTypeFilter}
          onChange={(e) => setPartyTypeFilter(e.target.value)}
        >
          <option value="">All Types</option>
          {/* TODO: Dynamically load party types from API if needed */}
          <option value="Supplier">Supplier</option>
          <option value="Customer">Customer</option>
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
              type: row.type,
              name: row.name,
              company: row.company,
              bankAccountNo: row.bankAccountNo,
              mobile: row.mobile,
              address: row.address,
            });
            setModalOpen(true);
          },
        }}
        summaryRow={{
          id: <span className="font-semibold">Total</span>,
          type: "",
          name: "",
          company: "",
          bankAccountNo: "",
          mobile: "",
          address: "",
          balance: (
            <span className="font-bold">{totalBalance.toLocaleString()}</span>
          ),
        }}
      />
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editItem ? "Edit Party" : "New Party"}
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Party Type *
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
              Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              className="input-base"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company Name
            </label>
            <input
              type="text"
              value={formData.company}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, company: e.target.value }))
              }
              className="input-base"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bank Account No
            </label>
            <input
              type="text"
              value={formData.bankAccountNo}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  bankAccountNo: e.target.value,
                }))
              }
              className="input-base"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mobile
            </label>
            <input
              type="text"
              value={formData.mobile}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, mobile: e.target.value }))
              }
              className="input-base"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, address: e.target.value }))
              }
              className="input-base"
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

export default PartyList;
