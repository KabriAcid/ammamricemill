import { useEffect, useState } from "react";
import { Button } from "../../components/ui/Button";
import { Table } from "../../components/ui/Table";
import { Modal } from "../../components/ui/Modal";
import { Card } from "../../components/ui/Card";
import { FilterBar } from "../../components/ui/FilterBar";
import { Plus, Trash2, Badge, RefreshCcw } from "lucide-react";
import { PartyType as PartyTypeBase } from "../../types/entities";
import { useToast } from "../../components/ui/Toast";
import { SkeletonCard } from "../../components/ui/Skeleton";
import { api } from "../../utils/fetcher";
import { ApiResponse } from "../../types";

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

// TypeScript Interfaces
type PartyType = Omit<PartyTypeBase, "id"> & { id: string };

interface FormData {
  name: string;
  description: string;
}

const PartyTypes = () => {
  // State Management
  const [data, setData] = useState<PartyType[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<PartyType | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
  });
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const { showToast } = useToast();

  // Fetch party types - simpler approach without useCallback
  const fetchPartyTypes = async () => {
    if (loading) return; // Prevent concurrent fetches

    setLoading(true);
    try {
      const response = await api.get<ApiResponse<PartyType[]>>("/party/types");

      if (response.success && response.data) {
        setData(
          response.data.map((item) => ({ ...item, id: String(item.id) }))
        );
      }
    } catch (error) {
      console.error("Error fetching party types:", error);
      // Only show toast for connection errors, not every failed request
      if (error instanceof Error && error.message.includes("Failed to fetch")) {
        showToast(
          "Cannot connect to server. Please check if the server is running.",
          "error"
        );
      }
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  // Refresh with animation
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchPartyTypes();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // Initial data load
  useEffect(() => {
    fetchPartyTypes();
  }, [fetchPartyTypes]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Ctrl+K for search focus
      if ((event.ctrlKey || event.metaKey) && event.key === "k") {
        event.preventDefault();
        const searchInput = document.querySelector<HTMLInputElement>(
          'input[type="search"]'
        );
        searchInput?.focus();
      }
      // Ctrl+R for refresh
      if ((event.ctrlKey || event.metaKey) && event.key === "r") {
        event.preventDefault();
        handleRefresh();
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, []);

  // Reset pagination when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  // Live search filtering
  const filteredData = data.filter((item) => {
    const query = search.toLowerCase().trim();
    if (!query) return true;

    return (
      item.name.toLowerCase().includes(query) ||
      item.description?.toLowerCase().includes(query) ||
      false
    );
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = filteredData.slice(startIndex, startIndex + pageSize);

  // Create
  const handleCreate = async () => {
    // Validation
    if (!formData.name.trim()) {
      showToast("Name is required", "error");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post<ApiResponse<PartyType>>(
        "/party/types",
        formData
      );

      if (response.success) {
        showToast(
          response.message || "Party type created successfully",
          "success"
        );
        await fetchPartyTypes();
        setModalOpen(false);
        setFormData({ name: "", description: "" });
      }
    } catch (error) {
      console.error("Error creating party type:", error);
      showToast("Failed to create party type", "error");
    } finally {
      setLoading(false);
    }
  };

  // Update
  const handleUpdate = async () => {
    if (!editItem) return;

    // Validation
    if (!formData.name.trim()) {
      showToast("Name is required", "error");
      return;
    }

    setLoading(true);
    try {
      const response = await api.put<ApiResponse<PartyType>>(
        `/party/types/${editItem.id}`,
        formData
      );

      if (response.success) {
        showToast(
          response.message || "Party type updated successfully",
          "success"
        );
        await fetchPartyTypes();
        setModalOpen(false);
        setEditItem(null);
        setFormData({ name: "", description: "" });
      }
    } catch (error) {
      console.error("Error updating party type:", error);
      showToast("Failed to update party type", "error");
    } finally {
      setLoading(false);
    }
  };

  // Delete (single or bulk)
  const handleDelete = async (ids: string[]) => {
    if (
      !confirm(`Are you sure you want to delete ${ids.length} party type(s)?`)
    ) {
      return;
    }

    setLoading(true);
    try {
      const response = await api.delete<ApiResponse<void>>("/party/types", {
        ids,
      });

      if (response.success) {
        showToast(
          response.message || "Party types deleted successfully",
          "success"
        );
        await fetchPartyTypes();
        setSelectedRows([]);
      }
    } catch (error) {
      console.error("Error deleting party types:", error);
      showToast("Failed to delete party types", "error");
    } finally {
      setLoading(false);
    }
  };

  // Handle modal open for new party type
  const handleNewPartyType = () => {
    setEditItem(null);
    setFormData({ name: "", description: "" });
    setModalOpen(true);
  };

  // Handle modal open for edit
  const handleEdit = (row: PartyType) => {
    setEditItem(row);
    setFormData({ name: row.name, description: row.description || "" });
    setModalOpen(true);
  };

  // Handle modal close
  const handleModalClose = () => {
    setModalOpen(false);
    setEditItem(null);
    setFormData({ name: "", description: "" });
  };

  // Handle form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    editItem ? handleUpdate() : handleCreate();
  };

  // Table columns
  const columns = [
    { key: "id", label: "#", width: "80px" },
    { key: "name", label: "Name", sortable: true },
    { key: "description", label: "Description" },
  ];

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Party Types</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage all party types for classification and reporting.
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className={`p-2 text-gray-500 hover:text-gray-700 transition-colors ${
            isRefreshing ? "animate-spin" : ""
          }`}
          title="Refresh data (Ctrl+R)"
        >
          <RefreshCcw className="w-5 h-5" />
        </button>
      </div>

      {/* Stats Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {initialLoading ? (
          <SkeletonCard variant="stat" />
        ) : (
          <Card icon={<Badge size={32} className="text-primary-800" />} hover>
            <div>
              <p className="text-3xl font-bold text-gray-700">{data.length}</p>
              <p className="text-sm text-gray-500">Total Party Types</p>
            </div>
          </Card>
        )}
      </div>

      {/* Filter Bar & Actions */}
      <FilterBar
        onSearch={setSearch}
        placeholder="Search by name or description... (Ctrl+K)"
      >
        <div className="flex items-center space-x-2">
          <Button onClick={handleNewPartyType} icon={Plus} size="sm">
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
      </FilterBar>

      {/* Table */}
      <Table
        data={paginatedData}
        columns={columns}
        loading={initialLoading || loading}
        pagination={{
          currentPage,
          totalPages,
          pageSize,
          totalItems: filteredData.length,
          onPageChange: setCurrentPage,
          onPageSizeChange: (size) => {
            setPageSize(size);
            setCurrentPage(1);
          },
        }}
        selection={{
          selectedItems: selectedRows,
          onSelectionChange: setSelectedRows,
        }}
        actions={{
          onEdit: handleEdit,
        }}
        summaryRow={{
          id: <span className="font-bold">{filteredData.length}</span>,
          name: <span className="font-semibold">Total</span>,
          description: "",
        }}
      />

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={handleModalClose}
        title={editItem ? "Edit Party Type" : "New Party Type"}
        size="md"
      >
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 required">
              Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              className="input-base"
              placeholder="Enter party type name"
              required
              autoFocus
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
            <Button variant="outline" onClick={handleModalClose} type="button">
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
