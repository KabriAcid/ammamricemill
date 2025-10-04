import { useEffect, useState } from "react";
import { Button } from "../../components/ui/Button";
import { Table } from "../../components/ui/Table";
import { Modal } from "../../components/ui/Modal";
import { Card } from "../../components/ui/Card";
import { FilterBar } from "../../components/ui/FilterBar";
import { Plus, Trash2, Layers3, Printer, RefreshCcw } from "lucide-react";
import { SkeletonCard } from "../../components/ui/Skeleton";
import { useToast } from "../../components/ui/Toast";
import { api } from "../../utils/fetcher";
import { ApiResponse } from "../../types";

// TypeScript Interfaces
export interface Category {
  id: string;
  name: string;
  unit: string;
  description: string;
}

interface CategoryFormData {
  name: string;
  unit: string;
  description: string;
}

const CategoryList = () => {
  // State Management
  const [data, setData] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Category | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>({
    name: "",
    unit: "",
    description: "",
  });
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const { showToast } = useToast();

  // Fetch categories
  // Simpler approach - just a regular function
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await api.get<ApiResponse<Category[]>>("/categories");

      if (response.success && response.data) {
        setData(
          response.data.map((item) => ({ ...item, id: String(item.id) }))
        );
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      showToast("Failed to load categories", "error");
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  // Call only once on mount
  useEffect(() => {
    fetchCategories();
  }, []); // Empty array - runs once

  // Refresh with animation
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchCategories();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Ctrl+K for search focus
      if ((event.ctrlKey || event.metaKey) && event.key === "k") {
        event.preventDefault();
        document
          .querySelector<HTMLInputElement>('input[type="search"]')
          ?.focus();
      }
      // Ctrl+R for refresh
      if ((event.ctrlKey || event.metaKey) && event.key === "r") {
        event.preventDefault();
        handleRefresh();
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
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
      item.unit.toLowerCase().includes(query) ||
      item.description?.toLowerCase().includes(query) ||
      false
    );
  });

  // Pagination
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = filteredData.slice(startIndex, startIndex + pageSize);

  // CRUD Operations
  const handleCreate = async () => {
    // Validation
    if (!formData.name.trim()) {
      showToast("Category name is required", "error");
      return;
    }

    if (!formData.unit.trim()) {
      showToast("Unit is required", "error");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post<ApiResponse<Category>>(
        "/categories",
        formData
      );

      if (response.success) {
        showToast(
          response.message || "Category created successfully",
          "success"
        );
        await fetchCategories();
        handleModalClose();
      }
    } catch (error) {
      console.error("Error creating category:", error);
      showToast("Failed to create category", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!editItem) return;

    // Validation
    if (!formData.name.trim()) {
      showToast("Category name is required", "error");
      return;
    }

    if (!formData.unit.trim()) {
      showToast("Unit is required", "error");
      return;
    }

    setLoading(true);
    try {
      const response = await api.put<ApiResponse<Category>>(
        `/categories/${editItem.id}`,
        formData
      );

      if (response.success) {
        showToast(
          response.message || "Category updated successfully",
          "success"
        );
        await fetchCategories();
        handleModalClose();
      }
    } catch (error) {
      console.error("Error updating category:", error);
      showToast("Failed to update category", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (ids: string[]) => {
    if (
      !confirm(`Are you sure you want to delete ${ids.length} category(ies)?`)
    ) {
      return;
    }

    setLoading(true);
    try {
      const response = await api.delete<ApiResponse<void>>("/categories", {
        ids,
      });

      if (response.success) {
        showToast(
          response.message || "Categories deleted successfully",
          "success"
        );
        await fetchCategories();
        setSelectedRows([]);
      }
    } catch (error) {
      console.error("Error deleting categories:", error);
      showToast("Failed to delete categories", "error");
    } finally {
      setLoading(false);
    }
  };

  // Handlers
  const handleNewCategory = () => {
    setEditItem(null);
    setFormData({ name: "", unit: "", description: "" });
    setModalOpen(true);
  };

  const handleEdit = (row: Category) => {
    setEditItem(row);
    setFormData({
      name: row.name,
      unit: row.unit,
      description: row.description || "",
    });
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setEditItem(null);
    setFormData({ name: "", unit: "", description: "" });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    editItem ? handleUpdate() : handleCreate();
  };

  const handlePrint = () => {
    window.print();
  };

  // Table columns
  const columns = [
    { key: "id", label: "#", width: "80px" },
    { key: "name", label: "Category Name", sortable: true },
    { key: "unit", label: "Unit", sortable: true },
    { key: "description", label: "Description" },
  ];

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Category List</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage all product categories and their details.
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
          <Card icon={<Layers3 className="w-8 h-8 text-primary-800" />} hover>
            <div>
              <p className="text-3xl font-bold text-gray-700">{data.length}</p>
              <p className="text-sm text-gray-500">Total Categories</p>
            </div>
          </Card>
        )}
      </div>

      {/* Filter Bar */}
      <FilterBar
        onSearch={setSearch}
        placeholder="Search by name, unit, or description... (Ctrl+K)"
      >
        <div className="flex items-center space-x-2">
          <Button onClick={handleNewCategory} icon={Plus} size="sm">
            New Category
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
          unit: "",
          description: "",
        }}
      />

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={handleModalClose}
        title={editItem ? "Edit Category" : "New Category"}
        size="md"
      >
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 required">
              Category Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              className="input-base"
              placeholder="Enter category name"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 required">
              Unit
            </label>
            <input
              type="text"
              value={formData.unit}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, unit: e.target.value }))
              }
              className="input-base"
              placeholder="e.g., kg, liters, pieces"
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

export default CategoryList;
