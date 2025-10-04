import { useEffect, useState } from "react";
import { Button } from "../../components/ui/Button";
import { Table } from "../../components/ui/Table";
import { Modal } from "../../components/ui/Modal";
import { Card } from "../../components/ui/Card";
import { FilterBar } from "../../components/ui/FilterBar";
import {
  Plus,
  Trash2,
  Boxes,
  Printer,
  TrendingUp,
  TrendingDown,
  RefreshCcw,
} from "lucide-react";
import { SkeletonCard } from "../../components/ui/Skeleton";
import { useToast } from "../../components/ui/Toast";
import { api } from "../../utils/fetcher";
import { ApiResponse } from "../../types";

// TypeScript Interfaces
export interface Product {
  id: string;
  category: string;
  name: string;
  unit: string;
  type: string;
  size: string;
  weight: number;
  buyPrice: number;
  salePrice: number;
}

interface ProductFormData {
  category: string;
  name: string;
  unit: string;
  type: string;
  size: string;
  weight: number;
  buyPrice: number;
  salePrice: number;
}

const ProductList = () => {
  // State Management
  const [data, setData] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductFormData>({
    category: "",
    name: "",
    unit: "",
    type: "",
    size: "",
    weight: 0,
    buyPrice: 0,
    salePrice: 0,
  });
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const { showToast } = useToast();

  // Fetch products - NO useCallback, simple function
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await api.get<ApiResponse<Product[]>>("/products");

      if (response.success && response.data) {
        setData(
          response.data.map((item) => ({ ...item, id: String(item.id) }))
        );
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      showToast("Failed to load products", "error");
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  // Refresh with animation
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchProducts();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // Initial data load - ONLY runs once on mount
  useEffect(() => {
    fetchProducts();
  }, []); // Empty array = runs once, no dependencies

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "k") {
        event.preventDefault();
        document
          .querySelector<HTMLInputElement>('input[type="search"]')
          ?.focus();
      }
      if ((event.ctrlKey || event.metaKey) && event.key === "r") {
        event.preventDefault();
        handleRefresh();
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, []); // No dependencies

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
      item.category.toLowerCase().includes(query) ||
      item.unit.toLowerCase().includes(query) ||
      item.type?.toLowerCase().includes(query) ||
      false
    );
  });

  // Pagination
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = filteredData.slice(startIndex, startIndex + pageSize);

  // Calculate stats from filtered data
  const totalProducts = filteredData.length;
  const totalBuyPrice = filteredData.reduce(
    (sum, d) => sum + (d.buyPrice || 0),
    0
  );
  const totalSalePrice = filteredData.reduce(
    (sum, d) => sum + (d.salePrice || 0),
    0
  );

  // CRUD Operations
  const handleCreate = async () => {
    // Validation
    if (!formData.category.trim()) {
      showToast("Category is required", "error");
      return;
    }

    if (!formData.name.trim()) {
      showToast("Product name is required", "error");
      return;
    }

    if (!formData.unit.trim()) {
      showToast("Unit is required", "error");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post<ApiResponse<Product>>(
        "/products",
        formData
      );

      if (response.success) {
        showToast(
          response.message || "Product created successfully",
          "success"
        );
        await fetchProducts();
        handleModalClose();
      }
    } catch (error) {
      console.error("Error creating product:", error);
      showToast("Failed to create product", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!editItem) return;

    // Validation
    if (!formData.category.trim()) {
      showToast("Category is required", "error");
      return;
    }

    if (!formData.name.trim()) {
      showToast("Product name is required", "error");
      return;
    }

    if (!formData.unit.trim()) {
      showToast("Unit is required", "error");
      return;
    }

    setLoading(true);
    try {
      const response = await api.put<ApiResponse<Product>>(
        `/products/${editItem.id}`,
        formData
      );

      if (response.success) {
        showToast(
          response.message || "Product updated successfully",
          "success"
        );
        await fetchProducts();
        handleModalClose();
      }
    } catch (error) {
      console.error("Error updating product:", error);
      showToast("Failed to update product", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (ids: string[]) => {
    if (!confirm(`Are you sure you want to delete ${ids.length} product(s)?`)) {
      return;
    }

    setLoading(true);
    try {
      const response = await api.delete<ApiResponse<void>>("/products", {
        ids,
      });

      if (response.success) {
        showToast(
          response.message || "Products deleted successfully",
          "success"
        );
        await fetchProducts();
        setSelectedRows([]);
      }
    } catch (error) {
      console.error("Error deleting products:", error);
      showToast("Failed to delete products", "error");
    } finally {
      setLoading(false);
    }
  };

  // Handlers
  const handleNewProduct = () => {
    setEditItem(null);
    setFormData({
      category: "",
      name: "",
      unit: "",
      type: "",
      size: "",
      weight: 0,
      buyPrice: 0,
      salePrice: 0,
    });
    setModalOpen(true);
  };

  const handleEdit = (row: Product) => {
    setEditItem(row);
    setFormData({
      category: row.category,
      name: row.name,
      unit: row.unit,
      type: row.type || "",
      size: row.size || "",
      weight: row.weight || 0,
      buyPrice: row.buyPrice || 0,
      salePrice: row.salePrice || 0,
    });
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setEditItem(null);
    setFormData({
      category: "",
      name: "",
      unit: "",
      type: "",
      size: "",
      weight: 0,
      buyPrice: 0,
      salePrice: 0,
    });
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
    { key: "id", label: "#", width: "60px" },
    { key: "category", label: "Category", sortable: true },
    { key: "name", label: "Product", sortable: true },
    { key: "unit", label: "Unit" },
    { key: "type", label: "Type" },
    { key: "size", label: "Size" },
    {
      key: "weight",
      label: "Weight",
      render: (value: number) => (value ? `${value} kg` : "-"),
    },
    {
      key: "buyPrice",
      label: "Buy Price",
      render: (value: number) => `₦${value.toLocaleString()}`,
    },
    {
      key: "salePrice",
      label: "Sale Price",
      render: (value: number) => `₦${value.toLocaleString()}`,
    },
  ];

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Product List</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage all products, their categories, and pricing details.
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
        {initialLoading ? (
          <>
            <SkeletonCard variant="stat" />
            <SkeletonCard variant="stat" />
            <SkeletonCard variant="stat" />
          </>
        ) : (
          <>
            <Card icon={<Boxes className="w-8 h-8 text-primary-800" />} hover>
              <div>
                <p className="text-3xl font-bold text-gray-700">
                  {totalProducts}
                </p>
                <p className="text-sm text-gray-500">Total Products</p>
              </div>
            </Card>
            <Card
              icon={<TrendingDown className="w-8 h-8 text-blue-600" />}
              hover
            >
              <div>
                <p className="text-3xl font-bold text-gray-700">
                  ₦{totalBuyPrice.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">Total Buy Price</p>
              </div>
            </Card>
            <Card
              icon={<TrendingUp className="w-8 h-8 text-green-600" />}
              hover
            >
              <div>
                <p className="text-3xl font-bold text-gray-700">
                  ₦{totalSalePrice.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">Total Sale Price</p>
              </div>
            </Card>
          </>
        )}
      </div>

      {/* Filter Bar */}
      <FilterBar
        onSearch={setSearch}
        placeholder="Search by name, category, unit, or type... (Ctrl+K)"
      >
        <div className="flex items-center space-x-2">
          <Button onClick={handleNewProduct} icon={Plus} size="sm">
            New Product
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
          category: <span className="font-semibold">Total</span>,
          name: "",
          unit: "",
          type: "",
          size: "",
          weight: "",
          buyPrice: (
            <span className="font-bold">₦{totalBuyPrice.toLocaleString()}</span>
          ),
          salePrice: (
            <span className="font-bold">
              ₦{totalSalePrice.toLocaleString()}
            </span>
          ),
        }}
      />

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={handleModalClose}
        title={editItem ? "Edit Product" : "New Product"}
        size="lg"
      >
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 required">
                Category
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, category: e.target.value }))
                }
                className="input-base"
                placeholder="Enter category"
                required
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 required">
                Product Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                className="input-base"
                placeholder="Enter product name"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                placeholder="e.g., kg, bags"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type
              </label>
              <input
                type="text"
                value={formData.type}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, type: e.target.value }))
                }
                className="input-base"
                placeholder="Enter type"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Size
              </label>
              <input
                type="text"
                value={formData.size}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, size: e.target.value }))
                }
                className="input-base"
                placeholder="Enter size"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Weight (kg)
              </label>
              <input
                type="number"
                value={formData.weight || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    weight: Number(e.target.value),
                  }))
                }
                className="input-base"
                placeholder="0"
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buy Price (₦)
              </label>
              <input
                type="number"
                value={formData.buyPrice || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    buyPrice: Number(e.target.value),
                  }))
                }
                className="input-base"
                placeholder="0"
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sale Price (₦)
              </label>
              <input
                type="number"
                value={formData.salePrice || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    salePrice: Number(e.target.value),
                  }))
                }
                className="input-base"
                placeholder="0"
                min="0"
                step="0.01"
              />
            </div>
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

export default ProductList;
