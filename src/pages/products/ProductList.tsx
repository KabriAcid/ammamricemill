import { useEffect, useState } from "react";
import { Button } from "../../components/ui/Button";
import { Table } from "../../components/ui/Table";
import { Modal } from "../../components/ui/Modal";
import { Card } from "../../components/ui/Card";
import { FilterBar } from "../../components/ui/FilterBar";
import { Plus, Trash2, Boxes, Printer, BookOpen } from "lucide-react";

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

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

const ProductList = () => {
  const [data, setData] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
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

  // Fetch all (GET)
  useEffect(() => {
    setLoading(true);
    fetch(`/api/products?search=${encodeURIComponent(search)}`)
      .then((res) => res.json())
      .then((res) =>
        setData(res.map((item: any) => ({ ...item, id: String(item.id) })))
      )
      .finally(() => setLoading(false));
  }, [search]);

  // Create
  const handleCreate = () => {
    setLoading(true);
    fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    })
      .then((res) => res.json())
      .then((created) =>
        setData((prev) => [{ ...created, id: String(created.id) }, ...prev])
      )
      .finally(() => {
        setModalOpen(false);
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
        setLoading(false);
      });
  };

  // Update
  const handleUpdate = () => {
    if (!editItem) return;
    setLoading(true);
    fetch(`/api/products/${editItem.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    })
      .then((res) => res.json())
      .then((updated) =>
        setData((prev) =>
          prev.map((row) =>
            row.id === String(updated.id)
              ? { ...updated, id: String(updated.id) }
              : row
          )
        )
      )
      .finally(() => {
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
        setLoading(false);
      });
  };

  // Delete (single or bulk)
  const handleDelete = (ids: string[]) => {
    setLoading(true);
    Promise.all(
      ids.map((id) => fetch(`/api/products/${id}`, { method: "DELETE" }))
    )
      .then(() =>
        setData((prev) => prev.filter((row) => !ids.includes(row.id)))
      )
      .finally(() => {
        setSelectedRows([]);
        setLoading(false);
      });
  };

  // Table columns
  const columns = [
    { key: "id", label: "#" },
    { key: "category", label: "Category" },
    { key: "name", label: "Product" },
    { key: "unit", label: "Unit" },
    { key: "type", label: "Type" },
    { key: "size", label: "Size" },
    { key: "weight", label: "Weight" },
    { key: "buyPrice", label: "Buy Price" },
    { key: "salePrice", label: "Sale Price" },
  ];

  // Stat card
  const totalProducts = data.length;
  const totalBuyPrice = data.reduce((sum, d) => sum + (d.buyPrice || 0), 0);
  const totalSalePrice = data.reduce((sum, d) => sum + (d.salePrice || 0), 0);

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Product List</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage all products, their categories, and pricing details.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card icon={<Boxes className="w-8 h-8 text-primary-800" />}>
          <div>
            <div className="text-xs uppercase text-gray-500 font-semibold">
              Total Products
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {totalProducts}
            </div>
          </div>
        </Card>
        <Card icon={<BookOpen className="w-8 h-8 text-primary-800" />}>
          <div>
            <div className="text-xs uppercase text-gray-500 font-semibold">
              Total Buy Price
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {totalBuyPrice.toLocaleString()}
            </div>
          </div>
        </Card>
        <Card icon={<BookOpen className="w-8 h-8 text-primary-800" />}>
          <div>
            <div className="text-xs uppercase text-gray-500 font-semibold">
              Total Sale Price
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {totalSalePrice.toLocaleString()}
            </div>
          </div>
        </Card>
      </div>
      <div className="mb-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => {
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
            }}
            icon={Plus}
            size="sm"
          >
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
          <Button variant="outline" size="sm" icon={Printer} onClick={() => {}}>
            Print
          </Button>
        </div>
      </div>
      <FilterBar
        onSearch={(val) => setSearch(val)}
        placeholder="Search by name, category, or unit"
      />
      <Table
        data={data}
        columns={columns}
        loading={loading}
        pagination={{
          currentPage: 1,
          totalPages: 1,
          pageSize: PAGE_SIZE_OPTIONS[1],
          totalItems: data.length,
          onPageChange: () => {},
          onPageSizeChange: () => {},
        }}
        selection={{
          selectedItems: selectedRows,
          onSelectionChange: setSelectedRows,
        }}
        actions={{
          onEdit: (row) => {
            setEditItem(row);
            setFormData({
              category: row.category,
              name: row.name,
              unit: row.unit,
              type: row.type,
              size: row.size,
              weight: row.weight,
              buyPrice: row.buyPrice,
              salePrice: row.salePrice,
            });
            setModalOpen(true);
          },
        }}
        summaryRow={{
          id: <span className="font-semibold">Total</span>,
          category: "",
          name: "",
          unit: "",
          type: "",
          size: "",
          weight: "",
          buyPrice: (
            <span className="font-bold">{totalBuyPrice.toLocaleString()}</span>
          ),
          salePrice: (
            <span className="font-bold">{totalSalePrice.toLocaleString()}</span>
          ),
        }}
      />
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editItem ? "Edit Product" : "New Product"}
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, category: e.target.value }))
              }
              className="input-base"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Name *
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
              Unit *
            </label>
            <input
              type="text"
              value={formData.unit}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, unit: e.target.value }))
              }
              className="input-base"
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
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Weight
            </label>
            <input
              type="number"
              value={formData.weight}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  weight: Number(e.target.value),
                }))
              }
              className="input-base"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buy Price
            </label>
            <input
              type="number"
              value={formData.buyPrice}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  buyPrice: Number(e.target.value),
                }))
              }
              className="input-base"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sale Price
            </label>
            <input
              type="number"
              value={formData.salePrice}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  salePrice: Number(e.target.value),
                }))
              }
              className="input-base"
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={editItem ? handleUpdate : handleCreate}
              loading={loading}
            >
              {editItem ? "Update" : "Save"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ProductList;
