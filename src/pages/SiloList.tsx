import React, { useEffect, useState } from "react";
import { Edit } from "lucide-react";
import { useToast } from "../ui/Toast";
import { Spinner } from "../ui/Spinner";
import { Button } from "../components/ui/Button";
import { EmptyState } from "../components/EmptyState";

interface Silo {
  id: number;
  name: string;
  capacity: number;
  description: string;
}

const mockSilos: Silo[] = [
  { id: 1, name: "1 No Silo", capacity: 5000, description: "something" },
  { id: 2, name: "4 No Silo", capacity: 50000, description: "something" },
];

export const SiloList: React.FC = () => {
  const { showToast } = useToast();
  const [silos, setSilos] = useState<Silo[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editSilo, setEditSilo] = useState<Silo | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  // Fetch silos (mocked)
  useEffect(() => {
    const fetchSilos = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/settings/silo");
        if (!res.ok) throw new Error();
        const data = await res.json();
        setSilos(data || mockSilos);
      } catch {
        setSilos(mockSilos);
      } finally {
        setLoading(false);
      }
    };
    fetchSilos();
  }, []);

  // Filtered silos
  const filtered = silos.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / pageSize);
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  // Handlers
  const handleSelectAll = (checked: boolean) => {
    setSelected(checked ? paged.map((s) => s.id) : []);
  };
  const handleSelect = (id: number, checked: boolean) => {
    setSelected((prev) =>
      checked ? [...prev, id] : prev.filter((sid) => sid !== id)
    );
  };
  const handleDelete = () => {
    setSilos((prev) => prev.filter((s) => !selected.includes(s.id)));
    setSelected([]);
    showToast("Deleted selected silos", "info");
  };
  const openNewModal = () => {
    setEditSilo(null);
    setModalOpen(true);
  };
  const openEditModal = (silo: Silo) => {
    setEditSilo(silo);
    setModalOpen(true);
  };
  const closeModal = () => {
    setModalOpen(false);
    setEditSilo(null);
  };
  const handleSave = (silo: Silo) => {
    if (editSilo) {
      setSilos((prev) => prev.map((s) => (s.id === silo.id ? silo : s)));
      showToast("Silo updated!", "info");
    } else {
      setSilos((prev) => [
        ...prev,
        {
          ...silo,
          id: prev.length ? Math.max(...prev.map((s) => s.id)) + 1 : 1,
        },
      ]);
      showToast("Silo created!", "info");
    }
    closeModal();
  };

  return (
    <div className="p-4 sm:p-6">
      {/* Breadcrumbs */}
      <div className="flex items-center text-sm text-gray-500 mb-2">
        <span>Dashboard</span>
        <span className="mx-2">/</span>
        <span>Silo</span>
      </div>
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
        <h1 className="text-2xl font-bold text-gray-900">Silo List</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleDelete}
            disabled={selected.length === 0}
          >
            Delete
          </Button>
          <Button onClick={openNewModal}>+ New</Button>
          <Button variant="outline" onClick={() => window.print()}>
            Print
          </Button>
        </div>
      </div>
      {/* Search */}
      <div className="mb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <input
          type="text"
          placeholder="Search silo..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-64 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#AF792F] focus:border-transparent"
        />
      </div>
      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow-card-hover border border-gray-200 scrollbar-hide">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-2 py-2 text-left">
                <input
                  type="checkbox"
                  checked={paged.length > 0 && selected.length === paged.length}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  aria-label="Select all"
                />
              </th>
              <th className="px-2 py-2 text-left">#</th>
              <th className="px-2 py-2 text-left">Silo Name</th>
              <th className="px-2 py-2 text-left">Silo Capacity</th>
              <th className="px-2 py-2 text-left">Description</th>
              <th className="px-2 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-8">
                  <Spinner size={28} />
                </td>
              </tr>
            ) : paged.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  <EmptyState
                    message="No silos found"
                    imageSrc="/img/empty.jpg"
                  />
                </td>
              </tr>
            ) : (
              paged.map((silo, idx) => (
                <tr key={silo.id} className="border-t">
                  <td className="px-2 py-2">
                    <input
                      type="checkbox"
                      checked={selected.includes(silo.id)}
                      onChange={(e) => handleSelect(silo.id, e.target.checked)}
                      aria-label="Select row"
                    />
                  </td>
                  <td className="px-2 py-2">
                    {(page - 1) * pageSize + idx + 1}
                  </td>
                  <td className="px-2 py-2">{silo.name}</td>
                  <td className="px-2 py-2">{silo.capacity}</td>
                  <td className="px-2 py-2">{silo.description}</td>
                  <td className="px-2 py-2">
                    <button
                      onClick={() => openEditModal(silo)}
                      className="p-1 focus:outline-none text-[#AF792F] hover:text-[#8c5f22] transition"
                      aria-label="Edit"
                    >
                      <Edit size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Pagination & Page Size */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-4 gap-2">
        <div className="flex items-center gap-2">
          <span>Rows per page:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
            className="border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-[#AF792F] focus:border-transparent"
          >
            {[10, 25, 50, 100].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Prev
          </Button>
          <span>
            Page {page} of {totalPages || 1}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || totalPages === 0}
          >
            Next
          </Button>
        </div>
      </div>
      {/* Modal for New/Edit */}
      {modalOpen && (
        <SiloModal silo={editSilo} onClose={closeModal} onSave={handleSave} />
      )}
    </div>
  );
};

// Silo Modal Component
interface SiloModalProps {
  silo: Silo | null;
  onClose: () => void;
  onSave: (silo: Silo) => void;
}

const SiloModal: React.FC<SiloModalProps> = ({ silo, onClose, onSave }) => {
  const [form, setForm] = useState<Silo>(
    silo || { id: 0, name: "", capacity: 0, description: "" }
  );
  const [saving, setSaving] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "capacity" ? Number(value) : value,
    }));
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      onSave(form);
    }, 900);
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-2 p-6 relative">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-700"
          onClick={onClose}
          aria-label="Close"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        <h2 className="text-xl font-semibold mb-4 text-gray-900">
          {silo ? "Edit Silo" : "Create New Silo"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Silo Name
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#AF792F] focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Silo Capacity
            </label>
            <input
              name="capacity"
              type="number"
              min={0}
              value={form.capacity}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#AF792F] focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#AF792F] focus:border-transparent"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              {silo ? "Update" : "Save"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
