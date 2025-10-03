import { useEffect, useState, useCallback } from "react";
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

type PartyType = Omit<PartyTypeBase, "id"> & { id: string };
const PartyTypes = () => {
  const [data, setData] = useState<PartyType[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<PartyType | null>(null);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [search, setSearch] = useState("");
  const { showToast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Keyboard shortcuts
  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    if ((event.ctrlKey || event.metaKey) && event.key === "f") {
      event.preventDefault();
      document.querySelector<HTMLInputElement>('input[type="search"]')?.focus();
    }
    if ((event.ctrlKey || event.metaKey) && event.key === "r") {
      event.preventDefault();
      fetchPartyTypes();
    }
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyPress);
    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, [handleKeyPress]);

  const fetchPartyTypes = async () => {
    setLoading(true);
    try {
      const response = await api.get<ApiResponse<PartyType[]>>("/party-types");

      if (response.success && response.data) {
        setData(
          response.data.map((item) => ({ ...item, id: String(item.id) }))
        );
      } else {
        throw new Error("Failed to fetch party types");
      }
    } catch (error) {
      console.error("Error fetching party types:", error);
      if (error instanceof Error && error.message.includes("Failed to fetch")) {
        showToast(
          "Cannot connect to server. Please check if the server is running.",
          "error"
        );
      } else {
        showToast("Failed to load party types", "error");
      }
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  // Initial data load
  useEffect(() => {
    fetchPartyTypes();
  }, []);

  // Create
  const handleCreate = async () => {
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

  // Table columns
  const columns = [
    { key: "id", label: "#" },
    { key: "name", label: "Name" },
    { key: "description", label: "Description" },
  ];

  // Stat card
  const totalTypes = data.length;

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Party Types</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage all party types for classification and reporting.
          </p>
        </div>
        <button
          onClick={() => fetchPartyTypes()}
          className={`p-2 text-gray-500 hover:text-gray-700 transition-colors ${
            loading ? "animate-spin" : ""
          }`}
          disabled={loading}
          title="Refresh data (Ctrl+R)"
        >
          <RefreshCcw className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {initialLoading ? (
          <SkeletonCard />
        ) : (
          <Card icon={<Badge size={32} className="text-primary-800" />} hover>
            <div>
              <p className="text-3xl font-bold text-gray-700">{totalTypes}</p>
              <p className="text-sm text-gray-500">Total Types</p>
            </div>
          </Card>
        )}
      </div>
      <Card>
        <div className="mb-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
          <FilterBar
            onSearch={(val) => setSearch(val)}
            placeholder="Search by name or description... (Ctrl+F)"
          >
            <div className="flex items-center space-x-2">
              <Button
                onClick={() => {
                  setEditItem(null);
                  setFormData({ name: "", description: "" });
                  setModalOpen(true);
                }}
                icon={Plus}
                size="sm"
              >
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
        </div>

        <Table
          data={data.filter(
            (item) =>
              item.name.toLowerCase().includes(search.toLowerCase()) ||
              item.description?.toLowerCase().includes(search.toLowerCase())
          )}
          columns={columns}
          loading={loading}
          pagination={{
            currentPage,
            totalPages: Math.ceil(data.length / pageSize),
            pageSize,
            totalItems: data.length,
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
            onEdit: (row) => {
              setEditItem(row);
              setFormData({ name: row.name, description: row.description });
              setModalOpen(true);
            },
          }}
          summaryRow={{
            name: <span className="font-semibold">Total</span>,
            description: "",
            id: <span className="font-bold">{totalTypes}</span>,
          }}
        ></Table>
      </Card>
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editItem ? "Edit Party Type" : "New Party Type"}
        size="md"
      >
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            editItem ? handleUpdate() : handleCreate();
          }}
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              className="input-base"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              className="input-base"
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="outline" onClick={() => setModalOpen(false)}>
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
