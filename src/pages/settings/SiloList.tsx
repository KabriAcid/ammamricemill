import React, { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  Printer,
  Warehouse,
  BarChart3,
  Layers,
  RefreshCw,
} from "lucide-react";
import { SkeletonCard } from "../../components/ui/Skeleton";
import { useToast } from "../../components/ui/Toast";
import { api } from "../../utils/fetcher";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Table } from "../../components/ui/Table";
import { FilterBar } from "../../components/ui/FilterBar";
import { Modal } from "../../components/ui/Modal";
import { Silo } from "../../types";

// TypeScript Interfaces
interface SiloStats {
  totalSilos: number;
  totalCapacity: number;
  avgCapacity: number;
  lowCapacity: number;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

interface SiloFormData {
  name: string;
  capacity: number;
  description: string;
}

const SiloList: React.FC = () => {
  // State Management
  const [silos, setSilos] = useState<Silo[]>([]);
  const [stats, setStats] = useState<SiloStats>({
    totalSilos: 0,
    totalCapacity: 0,
    avgCapacity: 0,
    lowCapacity: 0,
  });
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSilos, setSelectedSilos] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [showModal, setShowModal] = useState(false);
  const [editingSilo, setEditingSilo] = useState<Silo | null>(null);

  // Modal form state
  const [formData, setFormData] = useState<SiloFormData>({
    name: "",
    capacity: 0,
    description: "",
  });

  const { showToast } = useToast();

  // Initial data load
  useEffect(() => {
    const loadData = async () => {
      setInitialLoading(true);
      await fetchSiloData();
      setInitialLoading(false);
    };
    loadData();
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ctrl+K for search focus
      if (e.ctrlKey && e.key === "k") {
        e.preventDefault();
        const searchInput = document.querySelector(
          'input[type="search"]'
        ) as HTMLInputElement;
        searchInput?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []);

  // Fetch silo data
  const fetchSiloData = async () => {
    setLoading(true);
    try {
      const [silosData, statsData] = await Promise.all([
        api.get<ApiResponse<Silo[]>>("/settings/silo"),
        api.get<ApiResponse<SiloStats>>("/settings/silo/stats"),
      ]);

      if (silosData.success && statsData.success) {
        setSilos(silosData.data);
        setStats(statsData.data);
      }
    } catch (error) {
      console.error("Error fetching silo data:", error);
      showToast("Failed to load silo data", "error");
    } finally {
      setLoading(false);
    }
  };

  // Refresh with animation
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchSiloData();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // Filter silos
  const filteredSilos = silos.filter((silo) => {
    const query = searchQuery.toLowerCase();
    const nameMatch = silo.name.toLowerCase().includes(query);
    const descriptionMatch = silo.description
      ? silo.description.toLowerCase().includes(query)
      : false;
    return nameMatch || descriptionMatch;
  });

  // Pagination
  const totalPages = Math.ceil(filteredSilos.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedSilos = filteredSilos.slice(startIndex, startIndex + pageSize);

  // Table columns
  const columns = [
    { key: "id", label: "#", width: "80px" },
    { key: "name", label: "Silo Name", sortable: true },
    {
      key: "capacity",
      label: "Silo Capacity (Tons)",
      sortable: true,
      render: (value: number) => value.toLocaleString(),
    },
    { key: "description", label: "Description" },
  ];

  // Handlers
  const handleEdit = (silo: Silo) => {
    setEditingSilo(silo);
    setFormData({
      name: silo.name,
      capacity: silo.capacity,
      description: silo.description || "",
    });
    setShowModal(true);
  };

  const handleDelete = async (siloIds: string[]) => {
    if (confirm(`Are you sure you want to delete ${siloIds.length} silo(s)?`)) {
      setLoading(true);
      try {
        const response = await api.delete<ApiResponse<void>>(
          `/settings/silo?ids=${siloIds.join(",")}`
        );

        if (response.success) {
          showToast(response.message || "Silos deleted successfully", "success");
          await fetchSiloData();
          setSelectedSilos([]);
        }
      } catch (error) {
        console.error("Error deleting silos:", error);
        showToast("Failed to delete silos", "error");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSave = async () => {
    // Validation
    if (!formData.name.trim()) {
      showToast("Silo name is required", "error");
      return;
    }

    if (!formData.capacity || formData.capacity <= 0) {
      showToast("Capacity must be greater than 0", "error");
      return;
    }

    setLoading(true);
    try {
      const response = editingSilo
        ? await api.put<ApiResponse<Silo>>(
            `/settings/silo/${editingSilo.id}`,
            formData
          )
        : await api.post<ApiResponse<Silo>>("/settings/silo", formData);

      if (response.success) {
        showToast(
          response.message || 
          `Silo ${editingSilo ? "updated" : "created"} successfully`,
          "success"
        );
        await fetchSiloData();
        setShowModal(false);
        setEditingSilo(null);
        setFormData({ name: "", capacity: 0, description: "" });
      }
    } catch (error) {
      console.error("Error saving silo:", error);
      showToast("Failed to save silo", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleNew = () => {
    setEditingSilo(null);
    setFormData({ name: "", capacity: 0, description: "" });
    setShowModal(true);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingSilo(null);
    setFormData({ name: "", capacity: 0, description: "" });
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Silo Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your storage silos and monitor capacity.
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className={`p-2 text-gray-500 hover:text-gray-700 transition-colors ${
            isRefreshing ? "animate-spin" : ""
          }`}
          title="Refresh data"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {initialLoading ? (
          <>
            <SkeletonCard variant="stat" />
            <SkeletonCard variant="stat" />
            <SkeletonCard variant="stat" />
          </>
        ) : (
          <>
            <Card icon={<Warehouse size={32} />} hover>
              <div>
                <p className="text-3xl font-bold text-gray-700">
                  {stats.totalSilos}
                </p>
                <p className="text-sm text-gray-500">Total Silos</p>
              </div>
            </Card>
            <Card icon={<BarChart3 size={32} />} hover>
              <div>
                <p className="text-3xl font-bold text-gray-700">
                  {stats.totalCapacity.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">
                  Total Capacity (Tons)
                  {stats.lowCapacity > 0 && (
                    <span className="text-red-500 ml-1">
                      ({stats.lowCapacity} low)
                    </span>
                  )}
                </p>
              </div>
            </Card>
            <Card icon={<Layers size={32} />} hover>
              <div>
                <p className="text-3xl font-bold text-gray-700">
                  {Math.round(stats.avgCapacity).toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">Average Capacity (Tons)</p>
              </div>
            </Card>
          </>
        )}
      </div>

      {/* Filter Bar */}
      <FilterBar
        onSearch={setSearchQuery}
        placeholder="Search by silo name or description... (Ctrl+K)"
      >
        <div className="flex items-center space-x-2">
          <Button onClick={handleNew} icon={Plus} size="sm">
            New Silo
          </Button>
          {selectedSilos.length > 0 && (
            <Button
              variant="danger"
              size="sm"
              icon={Trash2}
              onClick={() => handleDelete(selectedSilos)}
              loading={loading}
            >
              Delete ({selectedSilos.length})
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            icon={Printer}
            onClick={handlePrint}
          >
            Print
          </Button>
        </div>
      </FilterBar>

      {/* Table */}
      <Table
        data={paginatedSilos}
        columns={columns}
        loading={initialLoading || loading}
        pagination={{
          currentPage,
          totalPages,
          pageSize,
          totalItems: filteredSilos.length,
          onPageChange: setCurrentPage,
          onPageSizeChange: (size) => {
            setPageSize(size);
            setCurrentPage(1);
          },
        }}
        selection={{
          selectedItems: selectedSilos,
          onSelectionChange: setSelectedSilos,
        }}
        actions={{
          onEdit: handleEdit,
        }}
      />

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={handleModalClose}
        title={editingSilo ? "Edit Silo" : "New Silo"}
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 required">
              Silo Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              className="input-base"
              placeholder="Enter silo name"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 required">
              Capacity (Tons)
            </label>
            <input
              type="number"
              value={formData.capacity || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  capacity: Number(e.target.value),
                }))
              }
              className="input-base"
              placeholder="Enter capacity in tons"
              min="0"
              step="0.01"
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
            <Button variant="outline" onClick={handleModalClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} loading={loading}>
              {editingSilo ? "Update" : "Save"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SiloList;