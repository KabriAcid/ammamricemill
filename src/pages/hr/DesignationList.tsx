import React, { useState } from "react";
import {
  Plus,
  Trash2,
  Printer,
  BadgeCheck,
  Info,
} from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Table } from "../../components/ui/Table";
import { FilterBar } from "../../components/ui/FilterBar";
import { Modal } from "../../components/ui/Modal";
import { Designation } from "../../types";

const DesignationList: React.FC = () => {
  const [designations, setDesignations] = useState<Designation[]>([
    {
      id: "1",
      name: "Mill Manager",
      description: "Overall management of mill operations",
      createdAt: "2024-01-15T10:00:00Z",
      updatedAt: "2024-01-15T10:00:00Z",
    },
    {
      id: "2",
      name: "Production Supervisor",
      description: "Supervises daily production activities",
      createdAt: "2024-01-10T10:00:00Z",
      updatedAt: "2024-01-10T10:00:00Z",
    },
    {
      id: "3",
      name: "Quality Controller",
      description: "Ensures product quality standards",
      createdAt: "2024-01-08T10:00:00Z",
      updatedAt: "2024-01-08T10:00:00Z",
    },
  ]);

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
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setDesignations((prev) =>
          prev.filter((designation) => !designationIds.includes(designation.id))
        );
        setSelectedDesignations([]);
      } catch (error) {
        console.error("Error deleting designations:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (editingDesignation) {
        setDesignations((prev) =>
          prev.map((designation) =>
            designation.id === editingDesignation.id
              ? {
                  ...designation,
                  ...formData,
                  updatedAt: new Date().toISOString(),
                }
              : designation
          )
        );
      } else {
        const newDesignation: Designation = {
          id: Date.now().toString(),
          ...formData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setDesignations((prev) => [...prev, newDesignation]);
      }

      setShowModal(false);
      setEditingDesignation(null);
      setFormData({ name: "", description: "" });
    } catch (error) {
      console.error("Error saving designation:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNew = () => {
    setEditingDesignation(null);
    setFormData({ name: "", description: "" });
    setShowModal(true);
  };

  const loadingCards = false; // set to true to show skeleton

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Designation Management
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage employee designations and job roles.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card icon={<BadgeCheck size={32} />} loading={loadingCards} hover>
          <div>
            <p className="text-3xl font-bold text-gray-700">
              {designations.length}
            </p>
            <p className="text-sm text-gray-500">Total Designations</p>
          </div>
        </Card>
        <Card icon={<Info size={32} />} loading={loadingCards} hover>
          <div>
            <p className="text-3xl font-bold text-gray-700">
              {designations.filter((d) => d.description).length}
            </p>
            <p className="text-sm text-gray-500">With Descriptions</p>
          </div>
        </Card>
      </div>

      <FilterBar
        onSearch={setSearchQuery}
        placeholder="Search by designation name or description..."
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
