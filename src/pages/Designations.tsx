import React, { useState, useEffect } from "react";
import { Users, Plus } from "lucide-react";
import { Breadcrumb } from "../components/Breadcrumb";
import { DataTable } from "../components/DataTable";
import { FormModal } from "../components/FormModal";
import { mockDesignations, MockDesignation } from '../mock.ts';

export const Designations: React.FC = () => {
  const [designations, setDesignations] = useState<MockDesignation[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDesignation, setEditingDesignation] =
    useState<MockDesignation | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "active" as "active" | "inactive",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDesignations();
  }, []);

  const fetchDesignations = async () => {
    try {
      const response = await fetch("/api/designations");
      const data = await response.json();
      setDesignations(data);
    } catch (error) {
      setDesignations(mockDesignations);
    }
  };

  const handleAdd = () => {
    setEditingDesignation(null);
    setFormData({
      name: "",
      description: "",
      status: "active",
    });
    setIsModalOpen(true);
  };

  const handleEdit = (designation: MockDesignation) => {
    setEditingDesignation(designation);
    setFormData({
      name: designation.name,
      description: designation.description,
      status: designation.status,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (designation: MockDesignation) => {
    if (window.confirm("Are you sure you want to delete this designation?")) {
      try {
        await fetch(`/api/designations/${designation.id}`, {
          method: "DELETE",
        });
        await fetchDesignations();
      } catch (error) {
        console.error("Failed to delete designation");
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = editingDesignation
        ? `/api/designations/${editingDesignation.id}`
        : "/api/designations";
      const method = editingDesignation ? "PUT" : "POST";

      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      await fetchDesignations();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to save designation");
    }
    setLoading(false);
  };

  const columns = [
    { key: "name", label: "Designation Name", sortable: true },
    { key: "description", label: "Description", sortable: true },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (value: string) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            value === "active"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </span>
      ),
    },
  ];

  return (
    <div className="p-6">
      <Breadcrumb
        items={[{ label: "Human Resource" }, { label: "Designations" }]}
      />

      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Users className="w-6 h-6 text-[#AF792F]" />
          <h1 className="text-2xl font-bold text-gray-900">Designations</h1>
        </div>
        <p className="text-gray-600">Manage employee designations and roles</p>
      </div>

      <DataTable
        data={designations}
        columns={columns}
        title="All Designations"
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        searchPlaceholder="Search designations..."
        addButtonLabel="Add Designation"
      />

      <FormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingDesignation ? "Edit Designation" : "Add New Designation"}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Designation Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#AF792F] focus:border-transparent"
              required
            />
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
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#AF792F] focus:border-transparent"
              placeholder="Brief description of the designation"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  status: e.target.value as "active" | "inactive",
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#AF792F] focus:border-transparent"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-[#AF792F] hover:bg-[#9A6B28] text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading
                ? "Saving..."
                : editingDesignation
                ? "Update Designation"
                : "Add Designation"}
            </button>
          </div>
        </form>
      </FormModal>
    </div>
  );
};
