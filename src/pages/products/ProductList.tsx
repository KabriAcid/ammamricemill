import { useEffect, useState } from "react";
import { Button } from "../../components/ui/Button";
import { Table } from "../../components/ui/Table";
import { Modal } from "../../components/ui/Modal";
import { Card } from "../../components/ui/Card";
import { FilterBar } from "../../components/ui/FilterBar";
import { Plus, Boxes, Printer } from "lucide-react";

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
  const [pageSize, setPageSize] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);

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
    { key: "id", label: "#", width: "60px" },
    { key: "category", label: "Category" },
    { key: "name", label: "Product" },
    { key: "unit", label: "Unit" },
    { key: "type", label: "Type" },
    { key: "size", label: "Size" },
    { key: "weight", label: "Weight" },
    { key: "buyPrice", label: "Buy Price" },
    { key: "salePrice", label: "Sale Price" },
  ];

  // Pagination
  const filtered = data.filter(
    (row) =>
      row.name.toLowerCase().includes(search.toLowerCase()) ||
      row.category.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginated = filtered.slice(startIndex, startIndex + pageSize);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-wrap gap-4">
        <Card icon={<Boxes className="w-6 h-6 text-primary-800" />}>
          <div>
            <div className="text-xs uppercase text-gray-500">
              Total Products
            </div>
            <div className="text-2xl font-bold">{data.length}</div>
          </div>
        </Card>
      </div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Product List</h1>
        <Button
          icon={Plus}
          onClick={() => {
            setModalOpen(true);
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
          }}
        >
          New Product
        </Button>
      </div>
      <FilterBar onSearch={setSearch} />
      <Table
        data={paginated}
        columns={columns}
        loading={loading}
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
          onDelete: (ids) => handleDelete(Array.isArray(ids) ? ids : [ids]),
          custom: [
            {
              label: "Print",
              icon: <Printer className="w-4 h-4" />,
              onClick: () => {
                /* Print logic */
              },
            },
          ],
        }}
        pagination={{
          currentPage,
          totalPages,
          pageSize,
          totalItems: filtered.length,
          onPageChange: setCurrentPage,
          onPageSizeChange: setPageSize,
        }}
        summaryRow={{
          name: <span className="font-semibold">Total</span>,
          unit: "",
          type: "",
          size: "",
          weight: "",
          buyPrice: "",
          salePrice: "",
          category: "",
          id: data.length,
        }}
      />
      <Modal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditItem(null);
        }}
        title={editItem ? "Edit Product" : "New Product"}
      >
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            editItem ? handleUpdate() : handleCreate();
          }}
        >
          <div>
            <label className="block font-medium">Category</label>
            <input
              className="form-input w-full"
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              required
              aria-label="Category"
            />
          </div>
          <div>
            <label className="block font-medium">Product Name</label>
            <input
              className="form-input w-full"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
              aria-label="Product Name"
            />
          </div>
          <div>
            <label className="block font-medium">Unit</label>
            <input
              className="form-input w-full"
              value={formData.unit}
              onChange={(e) =>
                setFormData({ ...formData, unit: e.target.value })
              }
              required
              aria-label="Unit"
            />
          </div>
          <div>
            <label className="block font-medium">Type</label>
            <input
              className="form-input w-full"
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value })
              }
              aria-label="Type"
            />
          </div>
          <div>
            <label className="block font-medium">Size</label>
            <input
              className="form-input w-full"
              value={formData.size}
              onChange={(e) =>
                setFormData({ ...formData, size: e.target.value })
              }
              aria-label="Size"
            />
          </div>
          <div>
            <label className="block font-medium">Weight</label>
            <input
              className="form-input w-full"
              type="number"
              value={formData.weight}
              onChange={(e) =>
                setFormData({ ...formData, weight: Number(e.target.value) })
              }
              aria-label="Weight"
            />
          </div>
          <div>
            <label className="block font-medium">Buy Price</label>
            <input
              className="form-input w-full"
              type="number"
              value={formData.buyPrice}
              onChange={(e) =>
                setFormData({ ...formData, buyPrice: Number(e.target.value) })
              }
              aria-label="Buy Price"
            />
          </div>
          <div>
            <label className="block font-medium">Sale Price</label>
            <input
              className="form-input w-full"
              type="number"
              value={formData.salePrice}
              onChange={(e) =>
                setFormData({ ...formData, salePrice: Number(e.target.value) })
              }
              aria-label="Sale Price"
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" variant="primary">
              {editItem ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProductList;
