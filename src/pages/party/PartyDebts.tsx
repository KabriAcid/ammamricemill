import { useEffect, useState } from "react";
import { Button } from "../../components/ui/Button";
import { Table } from "../../components/ui/Table";
import { Modal } from "../../components/ui/Modal";
import { Card } from "../../components/ui/Card";
import { FilterBar } from "../../components/ui/FilterBar";
import { AlertTriangle, Trash2, Printer, BookOpen, Plus } from "lucide-react";

// Party Debts entity type for this page
export interface PartyDebts {
  id: string;
  name: string;
  company: string;
  mobile: string;
  address: string;
  debts: number;
}

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

const PartyDebts = () => {
  const [data, setData] = useState<PartyDebts[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<PartyDebts | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    mobile: "",
    address: "",
    debts: 0,
  });
  const [search, setSearch] = useState("");

  // Fetch all (GET)
  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    fetch(`/api/party-debts?${params.toString()}`)
      .then((res) => res.json())
      .then((res) =>
        setData(res.map((item: any) => ({ ...item, id: String(item.id) })))
      )
      .finally(() => setLoading(false));
  }, [search]);

  // Create
  const handleCreate = () => {
    setLoading(true);
    fetch("/api/party-debts", {
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
          name: "",
          company: "",
          mobile: "",
          address: "",
          debts: 0,
        });
        setLoading(false);
      });
  };

  // Update
  const handleUpdate = () => {
    if (!editItem) return;
    setLoading(true);
    fetch(`/api/party-debts/${editItem.id}`, {
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
          name: "",
          company: "",
          mobile: "",
          address: "",
          debts: 0,
        });
        setLoading(false);
      });
  };

  // Delete (single or bulk)
  const handleDelete = (ids: string[]) => {
    setLoading(true);
    Promise.all(
      ids.map((id) => fetch(`/api/party-debts/${id}`, { method: "DELETE" }))
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
    { key: "name", label: "Name" },
    { key: "company", label: "Company Name" },
    { key: "mobile", label: "Mobile" },
    { key: "address", label: "Address" },
    {
      key: "debts",
      label: "Debts",
      render: (value: number) => value.toLocaleString(),
    },
  ];

  // Stat card
  const totalDebts = data.reduce((sum, d) => sum + (d.debts || 0), 0);

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Party Debts</h1>
        <p className="mt-1 text-sm text-gray-500">
          View and manage all party debts. Print and filter as needed.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-1 gap-4 mb-6">
        <Card icon={<AlertTriangle className="w-8 h-8 text-primary-800" />}>
          <div>
            <div className="text-xs uppercase text-gray-500 font-semibold">
              Total Debts
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {totalDebts.toLocaleString()}
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
                name: "",
                company: "",
                mobile: "",
                address: "",
                debts: 0,
              });
              setModalOpen(true);
            }}
            icon={Plus}
            size="sm"
          >
            New Debts
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
        placeholder="Search by name, company, mobile, or address"
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
            setFormData({
              name: row.name,
              company: row.company,
              mobile: row.mobile,
              address: row.address,
              debts: row.debts,
            });
            setModalOpen(true);
          },
        }}
        summaryRow={{
          id: <span className="font-semibold">Total</span>,
          name: "",
          company: "",
          mobile: "",
          address: "",
          debts: (
            <span className="font-bold">{totalDebts.toLocaleString()}</span>
          ),
        }}
      />
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editItem ? "Edit Debts" : "New Debts"}
        size="md"
      >
        <div className="space-y-4">
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Debts *
            </label>
            <input
              type="number"
              value={formData.debts}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  debts: Number(e.target.value),
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

export default PartyDebts;
