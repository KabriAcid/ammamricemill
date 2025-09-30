import React, { useState, useEffect } from "react";
import { Edit } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Spinner } from "../ui/Spinner";
import { EmptyState } from "../components/EmptyState";

interface Designation {
  id: number;
  name: string;
  description: string;
}

const mockDesignations: Designation[] = [
  { id: 1, name: "Accountant", description: "" },
  { id: 2, name: "ADMIN OFFICER", description: "ADMIN" },
  { id: 3, name: "BAGGING OPERATOR", description: "PRODUCTION" },
  { id: 4, name: "BOILER OPERATOR", description: "PRODUCTION" },
  { id: 5, name: "CHECKER", description: "PRODUCTION" },
  { id: 6, name: "CHIEF SECURITY OFFICER", description: "" },
  { id: 7, name: "CLEANER", description: "ADMIN" },
  { id: 8, name: "Computer Operator", description: "" },
];

export const DesignationList: React.FC = () => {
  const [designations, setDesignations] = useState<Designation[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editDesignation, setEditDesignation] = useState<Designation | null>(
    null
  );
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setDesignations(mockDesignations);
      setLoading(false);
    }, 500);
  }, []);

  const filtered = designations.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.description.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / pageSize);
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  const handleSelectAll = (checked: boolean) => {
    setSelected(checked ? paged.map((d) => d.id) : []);
  };
  const handleSelect = (id: number, checked: boolean) => {
    setSelected((prev) =>
      checked ? [...prev, id] : prev.filter((did) => did !== id)
    );
  };
  const handleDelete = () => {
    setDesignations((prev) => prev.filter((d) => !selected.includes(d.id)));
    setSelected([]);
  };
  const openNewModal = () => {
    setEditDesignation(null);
    setModalOpen(true);
  };
  const openEditModal = (designation: Designation) => {
    setEditDesignation(designation);
    setModalOpen(true);
  };
  const closeModal = () => {
    setModalOpen(false);
    setEditDesignation(null);
  };
  const handleSave = (designation: Designation) => {
    if (editDesignation) {
      setDesignations((prev) =>
        prev.map((d) => (d.id === designation.id ? designation : d))
      );
    } else {
      setDesignations((prev) => [
        ...prev,
        {
          ...designation,
          id: prev.length ? Math.max(...prev.map((d) => d.id)) + 1 : 1,
        },
      ]);
    }
    closeModal();
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="flex items-center text-sm text-gray-500 mb-2">
        <span>Dashboard</span>
        <span className="mx-2">/</span>
        <span>Designation</span>
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
        <h1 className="text-2xl font-bold text-gray-900">Designation List</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleDelete}
            disabled={selected.length === 0}
          >
            Delete
          </Button>
          <Button onClick={openNewModal}>+ New</Button>
        </div>
      </div>
      <div className="mb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <input
          type="text"
          placeholder="Search designation..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-64 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#AF792F] focus:border-transparent"
        />
      </div>
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
              <th className="px-2 py-2 text-left">Designation Name</th>
              <th className="px-2 py-2 text-left">Description</th>
              <th className="px-2 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="py-8">
                  <div className="flex justify-center items-center h-full w-full">
                    <Spinner size={28} />
                  </div>
                </td>
              </tr>
            ) : paged.length === 0 ? (
              <tr>
                <td colSpan={5}>
                  <EmptyState
                    message="No designations found"
                    imageSrc="/img/empty.jpg"
                  />
                </td>
              </tr>
            ) : (
              paged.map((designation, idx) => (
                <tr key={designation.id} className="border-t">
                  <td className="px-2 py-2">
                    <input
                      type="checkbox"
                      checked={selected.includes(designation.id)}
                      onChange={(e) =>
                        handleSelect(designation.id, e.target.checked)
                      }
                      aria-label="Select row"
                    />
                  </td>
                  <td className="px-2 py-2">
                    {(page - 1) * pageSize + idx + 1}
                  </td>
                  <td className="px-2 py-2">{designation.name}</td>
                  <td className="px-2 py-2">{designation.description}</td>
                  <td className="px-2 py-2">
                    <button
                      onClick={() => openEditModal(designation)}
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
      {modalOpen && (
        <DesignationModal
          designation={editDesignation}
          onClose={closeModal}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

interface DesignationModalProps {
  designation: Designation | null;
  onClose: () => void;
  onSave: (designation: Designation) => void;
}

const DesignationModal: React.FC<DesignationModalProps> = ({
  designation,
  onClose,
  onSave,
}) => {
  const [form, setForm] = useState<Designation>(
    designation || { id: 0, name: "", description: "" }
  );
  const [saving, setSaving] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
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
          {designation ? "Edit Designation" : "Create New Designation"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Designation Name
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
              Designation Description
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
              {designation ? "Update" : "Save"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
