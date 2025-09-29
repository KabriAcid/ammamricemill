import React, { useState, useEffect } from "react";
import { Package } from "lucide-react";
import { Breadcrumb } from "../components/Breadcrumb";
import { DataTable } from "../components/DataTable";
import { FormModal } from "../components/FormModal";
import { mockProducts, mockCategories, MockProduct } from "../mock.ts";

export const Products: React.FC = () => {
  const [products, setProducts] = useState<MockProduct[]>([]);
  const [categories, setCategories] = useState(mockCategories);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<MockProduct | null>(
    null
  );
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    unit: "kg",
    price: 0,
    stock: 0,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products");
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      setProducts(mockProducts);
    }
  };

  const handleAdd = () => {
    setEditingProduct(null);
    setFormData({
      name: "",
      category: "",
      unit: "kg",
      price: 0,
      stock: 0,
    });
    setIsModalOpen(true);
  };

  const handleEdit = (product: MockProduct) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      unit: product.unit,
      price: product.price,
      stock: product.stock,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (product: MockProduct) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await fetch(`/api/products/${product.id}`, {
          method: "DELETE",
        });
        await fetchProducts();
      } catch (error) {
        console.error("Failed to delete product");
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = editingProduct
        ? `/api/products/${editingProduct.id}`
        : "/api/products";
      const method = editingProduct ? "PUT" : "POST";

      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      await fetchProducts();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to save product");
    }
    setLoading(false);
  };

  const columns = [
    { key: "name", label: "Product Name", sortable: true },
    { key: "category", label: "Category", sortable: true },
    {
      key: "price",
      label: "Price",
      sortable: true,
      render: (value: number, row: MockProduct) => `৳${value} / ${row.unit}`,
    },
    {
      key: "stock",
      label: "Stock",
      sortable: true,
      render: (value: number, row: MockProduct) => (
        <div className="flex flex-col">
          <span>
            {value.toLocaleString()} {row.unit}
          </span>
          <span
            className={`text-xs ${
              value < 100
                ? "text-red-600"
                : value < 500
                ? "text-yellow-600"
                : "text-green-600"
            }`}
          >
            {value < 100
              ? "Low Stock"
              : value < 500
              ? "Medium Stock"
              : "Good Stock"}
          </span>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6">
      <Breadcrumb items={[{ label: "Products" }, { label: "Product List" }]} />

      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Package className="w-6 h-6 text-[#AF792F]" />
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        </div>
        <p className="text-gray-600">
          Manage your product inventory and pricing
        </p>
      </div>

      <DataTable
        data={products}
        columns={columns}
        title="All Products"
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        searchPlaceholder="Search products..."
        addButtonLabel="Add Product"
      />

      <FormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? "Edit Product" : "Add New Product"}
        size="lg"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Name
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
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, category: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#AF792F] focus:border-transparent"
                required
              >
                <option value="">Select Category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unit
              </label>
              <select
                value={formData.unit}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, unit: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#AF792F] focus:border-transparent"
                required
              >
                <option value="kg">Kilograms (kg)</option>
                <option value="bag">Bags</option>
                <option value="ton">Tons</option>
                <option value="piece">Pieces</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price per Unit (BDT)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    price: parseFloat(e.target.value),
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#AF792F] focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Stock
              </label>
              <input
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    stock: parseInt(e.target.value),
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#AF792F] focus:border-transparent"
                required
              />
            </div>
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
                : editingProduct
                ? "Update Product"
                : "Add Product"}
            </button>
          </div>
        </form>
      </FormModal>
    </div>
  );
};
