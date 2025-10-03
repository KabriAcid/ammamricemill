import React, { useState, useEffect } from "react";
import { Plus, Trash2, Printer, BadgeCheck, Info } from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Table } from "../../components/ui/Table";
import { FilterBar } from "../../components/ui/FilterBar";
import { Modal } from "../../components/ui/Modal";
import { SkeletonCard } from "../../components/ui/Skeleton";
import { useToast } from "../../components/ui/Toast";
import { api } from "../../utils/fetcher";
import { Designation } from "../../types";

const DesignationList: React.FC = () => {
  const [designations, setDesignations] = useState<Designation[]>([]);
  const { showToast } = useToast();
  const [initialLoading, setInitialLoading] = useState(true);

  const [selectedDesignations, setSelectedDesignations] = useState<string[]>(
    []
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingDesignation, setEditingDesignation] =
    useState<Designation | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setInitialLoading(true);
      await fetchDesignationData();
      setInitialLoading(false);
    };
    loadData();
  }, []);

  // Add keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        const searchInput = document.querySelector('input[type="search"]');
        if (searchInput instanceof HTMLInputElement) {
          searchInput.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const fetchDesignationData = async () => {
    setLoading(true);
    try {
      const response = await api.get<{ success: boolean; data: Designation[] }>(
        "/hr/designation"
      );

      if (response.success) {
        setDesignations(response.data);
      }
    } catch (error) {
      console.error("Error fetching designation data:", error);
      showToast("Failed to load designation data", "error");
    } finally {
      setLoading(false);
    }
  };

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const filteredDesignations = designations.filter(
    (designation) =>
      designation.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      designation.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredDesignations.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedDesignations = filteredDesignations.slice(
    startIndex,
    startIndex + pageSize
  );

  const columns = [
    { key: "id", label: "#", width: "80px" },
    { key: "name", label: "Designation Name", sortable: true },
    { key: "description", label: "Description" },
  ];

  const handleEdit = (designation: Designation) => {
    setEditingDesignation(designation);
    setFormData({
      name: designation.name,
      description: designation.description || "",
    });
    setShowModal(true);
  };

  const handleDelete = async (designationIds: string[]) => {
    if (
      confirm(
        `Are you sure you want to delete ${designationIds.length} designation(s)?`
      )
    ) {
      setLoading(true);
      try {
        const response = await api.delete<{
          success: boolean;
          message: string;
        }>(`/hr/designation?ids=${designationIds.join(",")}`);

        if (response.success) {
          showToast(response.message, "success");
          await fetchDesignationData();
          setSelectedDesignations([]);
        }
      } catch (error) {
        console.error("Error deleting designations:", error);
        showToast("Failed to delete designations", "error");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSave = async () => {
    if (!formData.name) {
      showToast("Designation name is required", "error");
      return;
    }

    setLoading(true);
    try {
      const response = editingDesignation
        ? await api.put<{
            success: boolean;
            data: Designation;
            message: string;
          }>(`/hr/designation/${editingDesignation.id}`, formData)
        : await api.post<{
            success: boolean;
            data: Designation;
            message: string;
          }>("/hr/designation", formData);

      if (response.success) {
        showToast(response.message, "success");
        await fetchDesignationData();
        setShowModal(false);
        setEditingDesignation(null);
        setFormData({ name: "", description: "" });
      }
    } catch (error) {
      console.error("Error saving designation:", error);
      showToast("Failed to save designation", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleNew = () => {
    setEditingDesignation(null);
    setFormData({ name: "", description: "" });
    setShowModal(true);
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Designation Management
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage employee designations and job roles.
          </p>
        </div>
        <button
          onClick={() => fetchDesignationData()}
          className={`p-2 text-gray-500 hover:text-gray-700 transition-colors ${
            loading ? "animate-spin" : ""
          }`}
          disabled={loading}
          title="Refresh data"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {initialLoading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
            <Card icon={<BadgeCheck size={32} />} hover>
              <div>
                <p className="text-3xl font-bold text-gray-700">
                  {designations.length}
                </p>
                <p className="text-sm text-gray-500">Total Designations</p>
              </div>
            </Card>
            <Card icon={<Info size={32} />} hover>
              <div>
                <p className="text-3xl font-bold text-gray-700">
                  {designations.filter((d) => d.description).length}
                </p>
                <p className="text-sm text-gray-500">With Descriptions</p>
              </div>
            </Card>
          </>
        )}
      </div>

      <FilterBar
        onSearch={setSearchQuery}
        placeholder="Search by designation name or description... (Ctrl+K)"
        value={searchQuery}
      >
        <div className="flex items-center space-x-2">
          <Button onClick={handleNew} icon={Plus} size="sm">
            New Designation
          </Button>
          {selectedDesignations.length > 0 && (
            <Button
              variant="danger"
              size="sm"
              icon={Trash2}
              onClick={() => handleDelete(selectedDesignations)}
              loading={loading}
            >
              Delete ({selectedDesignations.length})
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
        data={paginatedDesignations}
        columns={columns}
        loading={loading}
        pagination={{
          currentPage,
          totalPages,
          pageSize,
          totalItems: filteredDesignations.length,
          onPageChange: setCurrentPage,
          onPageSizeChange: (size) => {
            setPageSize(size);
            setCurrentPage(1);
          },
        }}
        selection={{
          selectedItems: selectedDesignations,
          onSelectionChange: setSelectedDesignations,
        }}
        actions={{
          onEdit: handleEdit,
        }}
      />

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingDesignation ? "Edit Designation" : "New Designation"}
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Designation Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              className="input-base"
              placeholder="Enter designation name"
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
              className="input-base"
              rows={3}
              placeholder="Enter description (optional)"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="outline" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} loading={loading}>
              {editingDesignation ? "Update" : "Save"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default DesignationList;
