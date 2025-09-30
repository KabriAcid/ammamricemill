import React, { useState } from "react";
import {
  Plus,
  CreditCard as Edit,
  Trash2,
  Printer,
  Warehouse,
  BarChart3,
  Layers,
} from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Table } from "../../components/ui/Table";
import { FilterBar } from "../../components/ui/FilterBar";
import { Modal } from "../../components/ui/Modal";
import { Godown } from "../../types";

const GodownList: React.FC = () => {
  const [godowns, setGodowns] = useState<Godown[]>([
    {
      id: "1",
      name: "Main Godown A",
      capacity: 2000,
      description: "Primary storage for finished rice products",
      createdAt: "2024-01-15T10:00:00Z",
      updatedAt: "2024-01-15T10:00:00Z",
    },
    {
      id: "2",
      name: "Secondary Godown B",
      capacity: 1500,
      description: "Additional storage for packaging materials",
      createdAt: "2024-01-10T10:00:00Z",
      updatedAt: "2024-01-10T10:00:00Z",
    },
  ]);

  const [selectedGodowns, setSelectedGodowns] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingGodown, setEditingGodown] = useState<Godown | null>(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    capacity: 0,
    description: "",
  });

  const filteredGodowns = godowns.filter(
    (godown) =>
      godown.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      godown.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredGodowns.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedGodowns = filteredGodowns.slice(
    startIndex,
    startIndex + pageSize
  );

  const columns = [
    { key: "id", label: "#", width: "80px" },
    { key: "name", label: "Godown Name", sortable: true },
    {
      key: "capacity",
      label: "Godown Capacity (Tons)",
      sortable: true,
      render: (value: number) => value.toLocaleString(),
    },
    { key: "description", label: "Description" },
  ];

  const handleEdit = (godown: Godown) => {
    setEditingGodown(godown);
    setFormData({
      name: godown.name,
      capacity: godown.capacity,
      description: godown.description || "",
    });
    setShowModal(true);
  };

  const handleDelete = async (godownIds: string[]) => {
    if (
      confirm(`Are you sure you want to delete ${godownIds.length} godown(s)?`)
    ) {
      setLoading(true);
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setGodowns((prev) =>
          prev.filter((godown) => !godownIds.includes(godown.id))
        );
        setSelectedGodowns([]);
      } catch (error) {
        console.error("Error deleting godowns:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (editingGodown) {
        setGodowns((prev) =>
          prev.map((godown) =>
            godown.id === editingGodown.id
              ? { ...godown, ...formData, updatedAt: new Date().toISOString() }
              : godown
          )
        );
      } else {
        const newGodown: Godown = {
          id: Date.now().toString(),
          ...formData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setGodowns((prev) => [...prev, newGodown]);
      }

      setShowModal(false);
      setEditingGodown(null);
      setFormData({ name: "", capacity: 0, description: "" });
    } catch (error) {
      console.error("Error saving godown:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNew = () => {
    setEditingGodown(null);
    setFormData({ name: "", capacity: 0, description: "" });
    setShowModal(true);
  };

  const totalCapacity = godowns.reduce(
    (sum, godown) => sum + godown.capacity,
    0
  );
  const avgCapacity = godowns.length > 0 ? totalCapacity / godowns.length : 0;
  const loadingCards = false; // set to true to show skeleton

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Godown Management</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your storage godowns and monitor capacity.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card icon={<Warehouse size={32} />} loading={loadingCards} hover>
          <div>
            <p className="text-3xl font-bold text-gray-700">{godowns.length}</p>
            <p className="text-sm text-gray-500">Total Godowns</p>
          </div>
        </Card>
        <Card icon={<BarChart3 size={32} />} loading={loadingCards} hover>
          <div>
            <p className="text-3xl font-bold text-gray-700">
              {totalCapacity.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500">Total Capacity (Tons)</p>
          </div>
        </Card>
        <Card icon={<Layers size={32} />} loading={loadingCards} hover>
          <div>
            <p className="text-3xl font-bold text-gray-700">
              {Math.round(avgCapacity).toLocaleString()}
            </p>
            <p className="text-sm text-gray-500">Average Capacity (Tons)</p>
          </div>
        </Card>
      </div>

      <FilterBar
        onSearch={setSearchQuery}
        placeholder="Search by godown name or description..."
      >
        <div className="flex items-center space-x-2">
          <Button onClick={handleNew} icon={Plus} size="sm">
            New Godown
          </Button>
          {selectedGodowns.length > 0 && (
            <Button
              variant="danger"
              size="sm"
              icon={Trash2}
              onClick={() => handleDelete(selectedGodowns)}
              loading={loading}
            >
              Delete ({selectedGodowns.length})
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
        data={paginatedGodowns}
        columns={columns}
        loading={loading}
        pagination={{
          currentPage,
          totalPages,
          pageSize,
          totalItems: filteredGodowns.length,
          onPageChange: setCurrentPage,
          onPageSizeChange: (size) => {
            setPageSize(size);
            setCurrentPage(1);
          },
        }}
        selection={{
          selectedItems: selectedGodowns,
          onSelectionChange: setSelectedGodowns,
        }}
        actions={{
          onEdit: handleEdit,
        }}
      />

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingGodown ? "Edit Godown" : "New Godown"}
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Godown Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              className="input-base"
              placeholder="Enter godown name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Capacity (Tons) *
            </label>
            <input
              type="number"
              value={formData.capacity}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  capacity: Number(e.target.value),
                }))
              }
              className="input-base"
              placeholder="Enter capacity in tons"
              min="0"
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
              {editingGodown ? "Update" : "Save"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default GodownList;
