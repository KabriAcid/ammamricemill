import React, { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  Printer,
  Warehouse,
  BarChart3,
  Layers,
} from "lucide-react";
import { SkeletonCard } from "../../components/ui/Skeleton";
import { useToast } from "../../components/ui/Toast";
import { api } from "../../utils/fetcher";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Table } from "../../components/ui/Table";
import { FilterBar } from "../../components/ui/FilterBar";
import { Modal } from "../../components/ui/Modal";
import { Godown } from "../../types/entities";

const GodownList: React.FC = () => {
  const [godowns, setGodowns] = useState<Godown[]>([]);
  const [stats, setStats] = useState({
    totalGodowns: 0,
    totalCapacity: 0,
    avgCapacity: 0,
    lowStock: 0,
  });

  const { showToast } = useToast();

  const [selectedGodowns, setSelectedGodowns] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingGodown, setEditingGodown] = useState<Godown | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setInitialLoading(true);
      await fetchGodownData();
      setInitialLoading(false);
    };
    loadData();
  }, []);

  const fetchGodownData = async () => {
    setLoading(true);
    try {
      const [godownsData, statsData] = await Promise.all([
        api.get<{ success: boolean; data: Godown[] }>("/settings/godown"),
        api.get<{ success: boolean; data: typeof stats }>(
          "/settings/godown/stats"
        ),
      ]);

      if (godownsData.success && statsData.success) {
        setGodowns(godownsData.data);
        setStats(statsData.data);
      }
    } catch (error) {
      console.error("Error fetching godown data:", error);
      showToast("Failed to load godown data", "error");
    } finally {
      setLoading(false);
    }
  };

  const [formData, setFormData] = useState({
    name: "",
    capacity: 0,
    unit: "tons",
    location: "",
    manager: "",
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
      label: "Capacity",
      sortable: true,
      render: (value: number, row: Godown) =>
        `${value.toLocaleString()} ${row.unit || "tons"}`,
    },
    {
      key: "currentStock",
      label: "Current Stock",
      sortable: true,
      render: (value: number, row: Godown) =>
        `${value?.toLocaleString() || 0} ${row.unit || "tons"}`,
    },
    { key: "location", label: "Location" },
    { key: "manager", label: "Manager" },
    {
      key: "status",
      label: "Status",
      render: (value: string) => (
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            value === "active"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {value}
        </span>
      ),
    },
    { key: "description", label: "Description" },
  ];

  const handleEdit = (godown: Godown) => {
    setEditingGodown(godown);
    setFormData({
      name: godown.name,
      capacity: godown.capacity,
      unit: godown.unit,
      location: godown.location || "",
      manager: godown.manager || "",
      description: godown.description || "",
    });
    setShowModal(true);
  };

  const handleDelete = async (godownIds: string[]) => {
    setLoading(true);
    try {
      const response = await api.delete<{
        success: boolean;
        message: string;
      }>(`/settings/godown?ids=${godownIds.join(",")}`);

      if (response.success) {
        showToast(response.message, "success");
        await fetchGodownData();
        setSelectedGodowns([]);
      }
    } catch (error) {
      console.error("Error deleting godowns:", error);
      showToast("Failed to delete godowns", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.capacity) {
      showToast("Name and capacity are required", "error");
      return;
    }

    setLoading(true);
    try {
      const response = editingGodown
        ? await api.put<{ success: boolean; data: Godown; message: string }>(
            `/settings/godown/${editingGodown.id}`,
            formData
          )
        : await api.post<{ success: boolean; data: Godown; message: string }>(
            "/settings/godown",
            formData
          );

      if (response.success) {
        showToast(response.message, "success");
        await fetchGodownData();
        setShowModal(false);
        setEditingGodown(null);
        setFormData({
          name: "",
          capacity: 0,
          unit: "tons",
          location: "",
          manager: "",
          description: "",
        });
      }
    } catch (error) {
      console.error("Error saving godown:", error);
      showToast("Failed to save godown", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleNew = () => {
    setEditingGodown(null);
    setFormData({
      name: "",
      capacity: 0,
      unit: "tons",
      location: "",
      manager: "",
      description: "",
    });
    setShowModal(true);
  };

  const loadingCards = initialLoading; // show skeleton when initially loading

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
              {stats.totalCapacity.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500">
              Total Capacity (Tons)
              {stats.lowStock > 0 && (
                <span className="text-red-500 ml-1">
                  ({stats.lowStock} low)
                </span>
              )}
            </p>
          </div>
        </Card>
        <Card icon={<Layers size={32} />} loading={loadingCards} hover>
          <div>
            <p className="text-3xl font-bold text-gray-700">
              {Math.round(stats.avgCapacity).toLocaleString()}
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
              Unit *
            </label>
            <input
              type="text"
              value={formData.unit}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, unit: e.target.value }))
              }
              className="input-base"
              placeholder="Enter unit (e.g., tons, kg)"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, location: e.target.value }))
              }
              className="input-base"
              placeholder="Enter godown location"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Manager
            </label>
            <input
              type="text"
              value={formData.manager}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, manager: e.target.value }))
              }
              className="input-base"
              placeholder="Enter manager name"
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
