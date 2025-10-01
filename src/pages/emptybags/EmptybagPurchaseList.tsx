import { useEffect, useState } from "react";
import { Button } from "../../components/ui/Button";
import { Table } from "../../components/ui/Table";
import { Modal } from "../../components/ui/Modal";
import { Card } from "../../components/ui/Card";
import { FilterBar } from "../../components/ui/FilterBar";
import { Plus, PackagePlus, Printer } from "lucide-react";

export interface EmptybagPurchase {
  id: string;
  date: string;
  invoiceNo: string;
  party: string;
  items: number;
  quantity: number;
  price: number;
  description: string;
}

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

const EmptybagPurchaseList = () => {
  const [data, setData] = useState<EmptybagPurchase[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<EmptybagPurchase | null>(null);
  const [formData, setFormData] = useState({
    date: "",
    invoiceNo: "",
    party: "",
    items: 0,
    quantity: 0,
    price: 0,
    description: "",
  });
  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch all (GET)
  useEffect(() => {
    setLoading(true);
    fetch(`/api/emptybag-purchases?search=${encodeURIComponent(search)}`)
      .then((res) => res.json())
      .then((res) =>
        setData(res.map((item: any) => ({ ...item, id: String(item.id) })))
      )
      .finally(() => setLoading(false));
  }, [search]);

  // Create
  const handleCreate = () => {
    setLoading(true);
    fetch("/api/emptybag-purchases", {
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
          date: "",
          invoiceNo: "",
          party: "",
          items: 0,
          quantity: 0,
          price: 0,
          description: "",
        });
        setLoading(false);
      });
  };

  // Update
  const handleUpdate = () => {
    if (!editItem) return;
    setLoading(true);
    fetch(`/api/emptybag-purchases/${editItem.id}`, {
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
          date: "",
          invoiceNo: "",
          party: "",
          items: 0,
          quantity: 0,
          price: 0,
          description: "",
        });
        setLoading(false);
      });
  };

  // Delete (single or bulk)
  const handleDelete = (ids: string[]) => {
    setLoading(true);
    Promise.all(
      ids.map((id) =>
        fetch(`/api/emptybag-purchases/${id}`, { method: "DELETE" })
      )
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
    { key: "date", label: "Date" },
    { key: "invoiceNo", label: "Invoice No" },
    { key: "party", label: "Party" },
    { key: "items", label: "Items" },
    { key: "quantity", label: "Quantity" },
    { key: "price", label: "Price", render: (v: number) => v.toLocaleString() },
    { key: "description", label: "Description" },
  ];

  // Pagination
  const filtered = data.filter(
    (row) =>
      row.invoiceNo.toLowerCase().includes(search.toLowerCase()) ||
      row.party.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginated = filtered.slice(startIndex, startIndex + pageSize);

  // Stat cards
  const totalPurchases = data.length;
  const totalQuantity = data.reduce((sum, d) => sum + (d.quantity || 0), 0);
  const totalPrice = data.reduce((sum, d) => sum + (d.price || 0), 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <Card icon={<PackagePlus className="w-8 h-8 text-primary-800" />}>
          <div>
            <div className="text-xs uppercase text-gray-500 font-semibold">
              Total Purchases
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {totalPurchases}
            </div>
          </div>
        </Card>
        <Card icon={<PackagePlus className="w-8 h-8 text-primary-800" />}>
          <div>
            <div className="text-xs uppercase text-gray-500 font-semibold">
              Total Quantity
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {totalQuantity}
            </div>
          </div>
        </Card>
        <Card icon={<PackagePlus className="w-8 h-8 text-primary-800" />}>
          <div>
            <div className="text-xs uppercase text-gray-500 font-semibold">
              Total Price
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {totalPrice.toLocaleString()}
            </div>
          </div>
        </Card>
      </div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Emptybag Purchase List</h1>
        <Button
          icon={Plus}
          onClick={() => {
            setModalOpen(true);
            setEditItem(null);
            setFormData({
              date: "",
              invoiceNo: "",
              party: "",
              items: 0,
              quantity: 0,
              price: 0,
              description: "",
            });
          }}
        >
          New Purchase
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
              date: row.date,
              invoiceNo: row.invoiceNo,
              party: row.party,
              items: row.items,
              quantity: row.quantity,
              price: row.price,
              description: row.description,
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
          id: <span className="font-semibold">Total</span>,
          date: "",
          invoiceNo: "",
          party: "",
          items: "",
          quantity: <span className="font-bold">{totalQuantity}</span>,
          price: (
            <span className="font-bold">{totalPrice.toLocaleString()}</span>
          ),
          description: "",
        }}
      />
      <Modal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditItem(null);
        }}
        title={editItem ? "Edit Purchase" : "New Purchase"}
      >
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            editItem ? handleUpdate() : handleCreate();
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date *
              </label>
              <input
                className="form-input w-full"
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                required
                aria-label="Date"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Invoice No *
              </label>
              <input
                className="form-input w-full"
                value={formData.invoiceNo}
                onChange={(e) =>
                  setFormData({ ...formData, invoiceNo: e.target.value })
                }
                required
                aria-label="Invoice No"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Party *
              </label>
              <input
                className="form-input w-full"
                value={formData.party}
                onChange={(e) =>
                  setFormData({ ...formData, party: e.target.value })
                }
                required
                aria-label="Party"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Items
              </label>
              <input
                className="form-input w-full"
                type="number"
                value={formData.items}
                onChange={(e) =>
                  setFormData({ ...formData, items: Number(e.target.value) })
                }
                aria-label="Items"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity
              </label>
              <input
                className="form-input w-full"
                type="number"
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({ ...formData, quantity: Number(e.target.value) })
                }
                aria-label="Quantity"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price
              </label>
              <input
                className="form-input w-full"
                type="number"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: Number(e.target.value) })
                }
                aria-label="Price"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <input
              className="form-input w-full"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              aria-label="Description"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setModalOpen(false);
                setEditItem(null);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={loading}>
              {editItem ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default EmptybagPurchaseList;
