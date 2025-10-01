import { useEffect, useState } from "react";
import { Button } from "../../components/ui/Button";
import { Table } from "../../components/ui/Table";
import { Modal } from "../../components/ui/Modal";
import { Card } from "../../components/ui/Card";
import { FilterBar } from "../../components/ui/FilterBar";
import { Plus, Trash2, Badge } from "lucide-react";
import { PartyType as PartyTypeBase } from "../../types/entities";

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

type PartyType = Omit<PartyTypeBase, "id"> & { id: string };
const PartyTypes = () => {
  const [data, setData] = useState<PartyType[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<PartyType | null>(null);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [search, setSearch] = useState("");

  // Fetch all (GET)
  useEffect(() => {
    setLoading(true);
    fetch(`/api/party-types?search=${encodeURIComponent(search)}`)
      .then((res) => res.json())
      .then((res) =>
        setData(
          res.map((item: PartyTypeBase) => ({ ...item, id: String(item.id) }))
        )
      )
      .finally(() => setLoading(false));
  }, [search]);

  // Create
  const handleCreate = () => {
    setLoading(true);
    fetch("/api/party-types", {
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
        setFormData({ name: "", description: "" });
        setLoading(false);
      });
  };

  // Update
  const handleUpdate = () => {
    if (!editItem) return;
    setLoading(true);
    fetch(`/api/party-types/${editItem.id}`, {
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
        setFormData({ name: "", description: "" });
        setLoading(false);
      });
  };

  // Delete (single or bulk)
  const handleDelete = (ids: string[]) => {
    setLoading(true);
    Promise.all(
      ids.map((id) => fetch(`/api/party-types/${id}`, { method: "DELETE" }))
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
    { key: "description", label: "Description" },
  ];

  // Stat card
  const totalTypes = data.length;

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Party Types</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage all party types for classification and reporting.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <Card icon={<Badge className="w-8 h-8 text-primary-800" />}>
          <div>
            <div className="text-xs uppercase text-gray-500 font-semibold">
              Total Types
            </div>
            <div className="text-2xl font-bold text-gray-900">{totalTypes}</div>
          </div>
        </Card>
      </div>
      <div className="mb-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => {
              setEditItem(null);
              setFormData({ name: "", description: "" });
              setModalOpen(true);
            }}
            icon={Plus}
            size="sm"
          >
            New Party Type
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
      </div>
      <FilterBar
        onSearch={(val) => setSearch(val)}
        placeholder="Search by name or description"
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
            setFormData({ name: row.name, description: row.description });
            setModalOpen(true);
          },
        }}
        summaryRow={{
          name: <span className="font-semibold">Total</span>,
          description: "",
          id: <span className="font-bold">{totalTypes}</span>,
        }}
      />
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editItem ? "Edit Party Type" : "New Party Type"}
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

export default PartyTypes;
