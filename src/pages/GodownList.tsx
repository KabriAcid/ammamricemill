import React, { useEffect, useState } from "react";
import { Edit } from "lucide-react";
import { useToast } from "../ui/Toast";
import { Spinner } from "../ui/Spinner";
import { Button } from "../components/ui/Button";
import { EmptyState } from "../components/EmptyState";

interface Godown {
  id: number;
  name: string;
  capacity: number;
  description: string;
}

const mockGodowns: Godown[] = [
  {
    id: 1,
    name: "REJECT RICE STORE",
    capacity: 10000,
    description: "all reject rice here",
  },
  {
    id: 2,
    name: "PADDY STORE 1",
    capacity: 100000,
    description: "All Paddy Store Here",
  },
  { id: 3, name: "LOADING", capacity: 3, description: "" },
  {
    id: 4,
    name: "HEAD RICE STORE 1",
    capacity: 10000,
    description: "All Rice store here",
  },
  { id: 5, name: "DRIVER DEPOSIT", capacity: 1000, description: "" },
  {
    id: 6,
    name: "Broken Rice Store",
    capacity: 50000,
    description: "all broken rice goes here",
  },
  {
    id: 7,
    name: "Bran Store",
    capacity: 10000,
    description: "All Bran goes here",
  },
];

export const GodownList: React.FC = () => {
  const { showToast } = useToast();
  const [godowns, setGodowns] = useState<Godown[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editGodown, setEditGodown] = useState<Godown | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  // Fetch godowns (mocked)
  useEffect(() => {
    const fetchGodowns = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/settings/godown");
        if (!res.ok) throw new Error();
        const data = await res.json();
        setGodowns(data || mockGodowns);
      } catch {
        setGodowns(mockGodowns);
      } finally {
        setLoading(false);
      }
    };
    fetchGodowns();
  }, []);

  // Filtered godowns
  const filtered = godowns.filter(
    (g) =>
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      g.description.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / pageSize);
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  // Handlers
  const handleSelectAll = (checked: boolean) => {
    setSelected(checked ? paged.map((g) => g.id) : []);
  };
  const handleSelect = (id: number, checked: boolean) => {
    setSelected((prev) =>
      checked ? [...prev, id] : prev.filter((gid) => gid !== id)
    );
  };
  const handleDelete = () => {
    setGodowns((prev) => prev.filter((g) => !selected.includes(g.id)));
    setSelected([]);
    showToast("Deleted selected godowns", "success");
  };
  const openNewModal = () => {
    setEditGodown(null);
    setModalOpen(true);
  };
  const openEditModal = (godown: Godown) => {
    setEditGodown(godown);
    setModalOpen(true);
  };
  const closeModal = () => {
    setModalOpen(false);
    setEditGodown(null);
  };
  const handleSave = (godown: Godown) => {
    if (editGodown) {
      setGodowns((prev) => prev.map((g) => (g.id === godown.id ? godown : g)));
      showToast("Godown updated!", "success");
    } else {
      setGodowns((prev) => [
        ...prev,
        {
          ...godown,
          id: prev.length ? Math.max(...prev.map((g) => g.id)) + 1 : 1,
        },
      ]);
      showToast("Godown created!", "success");
    }
    closeModal();
  };

  return (
    <div className="p-4 sm:p-6">
      {/* Breadcrumbs */}
      <div className="flex items-center text-sm text-gray-500 mb-2">
        <span>Dashboard</span>
        <span className="mx-2">/</span>
        <span>Godown</span>
      </div>
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
        <h1 className="text-2xl font-bold text-gray-900">Godown List</h1>
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
          placeholder="Search godown..."
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
              <th className="px-2 py-2 text-left">Godown Name</th>
              <th className="px-2 py-2 text-left">Godown Capacity</th>
              <th className="px-2 py-2 text-left">Description</th>
              <th className="px-2 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="py-8">
                  <div className="flex justify-center items-center h-full w-full">
                    <Spinner size={28} />
                  </div>
                </td>
              </tr>
            ) : paged.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  <EmptyState
                    message="No godowns found"
                    imageSrc="/img/empty.jpg"
                  />
                </td>
              </tr>
            ) : (
              paged.map((godown, idx) => (
                <tr key={godown.id} className="border-t">
                  <td className="px-2 py-2">
                    <input
                      type="checkbox"
                      checked={selected.includes(godown.id)}
                      onChange={(e) =>
                        handleSelect(godown.id, e.target.checked)
                      }
                      aria-label="Select row"
                    />
                  </td>
                  <td className="px-2 py-2">
                    {(page - 1) * pageSize + idx + 1}
                  </td>
                  <td className="px-2 py-2">{godown.name}</td>
                  <td className="px-2 py-2">{godown.capacity}</td>
                  <td className="px-2 py-2">{godown.description}</td>
                  <td className="px-2 py-2">
                    <button
                      onClick={() => openEditModal(godown)}
                      className="p-1 focus:outline-none text-[#AF792F] hover:text-[#8c5f22] transition"
                      aria-label="Edit"
                    >
                      <Edit size={20} />
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
        <GodownModal
          godown={editGodown}
          onClose={closeModal}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

// Godown Modal Component
interface GodownModalProps {
  godown: Godown | null;
  onClose: () => void;
  onSave: (godown: Godown) => void;
}

const GodownModal: React.FC<GodownModalProps> = ({
  godown,
  onClose,
  onSave,
}) => {
  const [form, setForm] = useState<Godown>(
    godown || { id: 0, name: "", capacity: 0, description: "" }
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
          {godown ? "Edit Godown" : "Create New Godown"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Godown Name
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
              Godown Capacity
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
              {godown ? "Update" : "Save"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
