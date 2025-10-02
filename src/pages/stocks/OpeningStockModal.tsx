import { useState, useEffect } from "react";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { Table } from "../../components/ui/Table";
import { Select } from "../../components/ui/Select";
import { Input } from "../../components/ui/Input";
import { Plus, Trash } from "lucide-react";
import type { OpeningStockItem } from "./types";

interface OpeningStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: OpeningStockItem[]) => Promise<void>;
}

export function OpeningStockModal({
  isOpen,
  onClose,
  onSave,
}: OpeningStockModalProps) {
  const [items, setItems] = useState<OpeningStockItem[]>([]);
  const [categories, setCategories] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [products, setProducts] = useState<Array<{ id: string; name: string }>>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [currentItem, setCurrentItem] = useState<OpeningStockItem>({
    id: "",
    date: new Date().toISOString().split("T")[0],
    category: "",
    product: "",
    size: "",
    weight: 0,
    quantity: 0,
    netWeight: 0,
    rate: 0,
    price: 0,
  });

  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        // TODO: Replace with actual API calls
        setCategories([
          { id: "C1", name: "Raw Rice" },
          { id: "C2", name: "Processed Rice" },
        ]);
        setProducts([
          { id: "P1", name: "Rice" },
          { id: "P2", name: "Wheat" },
        ]);
      } catch (error) {
        console.error("Error fetching master data:", error);
      }
    };

    fetchMasterData();
  }, []);

  const handleAddItem = () => {
    if (!currentItem.category || !currentItem.product) {
      alert("Please fill in all required fields");
      return;
    }

    setItems((prev) => [
      ...prev,
      {
        ...currentItem,
        id: Date.now().toString(),
        price: currentItem.netWeight * currentItem.rate,
      },
    ]);

    setCurrentItem({
      id: "",
      date: new Date().toISOString().split("T")[0],
      category: "",
      product: "",
      size: "",
      weight: 0,
      quantity: 0,
      netWeight: 0,
      rate: 0,
      price: 0,
    });
  };

  const handleDelete = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleInputChange = (
    field: keyof OpeningStockItem,
    value: string | number
  ) => {
    setCurrentItem((prev) => {
      const updates = { [field]: value };

      // Calculate net weight when quantity or weight changes
      if (field === "quantity" || field === "weight") {
        updates.netWeight =
          Number(field === "quantity" ? value : prev.quantity) *
          Number(field === "weight" ? value : prev.weight);
      }

      // Calculate price when rate or netWeight changes
      if (field === "rate" || field === "netWeight") {
        updates.price =
          Number(field === "rate" ? value : prev.rate) *
          Number(field === "netWeight" ? value : prev.netWeight);
      }

      return { ...prev, ...updates };
    });
  };

  const handleSubmit = async () => {
    if (items.length === 0) {
      alert("Please add at least one item");
      return;
    }

    setLoading(true);
    try {
      await onSave(items);
      onClose();
    } catch (error) {
      console.error("Error saving opening stock:", error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      key: "date",
      label: "Date",
    },
    { key: "category", label: "Category" },
    { key: "product", label: "Product" },
    { key: "size", label: "Size" },
    {
      key: "weight",
      label: "Weight",
      render: (value: number) => value.toLocaleString(),
    },
    {
      key: "quantity",
      label: "Quantity",
      render: (value: number) => value.toLocaleString(),
    },
    {
      key: "netWeight",
      label: "Net Weight",
      render: (value: number) => value.toLocaleString(),
    },
    {
      key: "rate",
      label: "Rate",
      render: (value: number) => value.toLocaleString(),
    },
    {
      key: "price",
      label: "Price",
      render: (value: number) => value.toLocaleString(),
    },
  ];

  return (
    <Modal title="Opening Stock Details" isOpen={isOpen} onClose={onClose}>
      <div className="space-y-6">
        {/* Add Item Form */}
        <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg">
          <Input
            label="Date"
            type="date"
            value={currentItem.date}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleInputChange("date", e.target.value)
            }
            required
          />

          <Select
            label="Category"
            value={currentItem.category}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              handleInputChange("category", e.target.value)
            }
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </Select>

          <Select
            label="Product"
            value={currentItem.product}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              handleInputChange("product", e.target.value)
            }
          >
            <option value="">Select Product</option>
            {products.map((prod) => (
              <option key={prod.id} value={prod.id}>
                {prod.name}
              </option>
            ))}
          </Select>

          <Input
            label="Size"
            type="text"
            value={currentItem.size}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleInputChange("size", e.target.value)
            }
          />

          <Input
            label="Weight"
            type="number"
            value={currentItem.weight}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleInputChange("weight", Number(e.target.value))
            }
            required
          />

          <Input
            label="Quantity"
            type="number"
            value={currentItem.quantity}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleInputChange("quantity", Number(e.target.value))
            }
            required
          />

          <Input
            label="Net Weight"
            type="number"
            value={currentItem.netWeight}
            disabled
          />

          <Input
            label="Rate"
            type="number"
            value={currentItem.rate}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleInputChange("rate", Number(e.target.value))
            }
            required
          />

          <Input
            label="Price"
            type="number"
            value={currentItem.price}
            disabled
          />

          <div className="col-span-2 flex justify-end">
            <Button onClick={handleAddItem}>
              <Plus className="w-4 h-4" />
              Add Item
            </Button>
          </div>
        </div>

        {/* Items Table */}
        <div className="border rounded-lg overflow-hidden">
          <Table
            columns={columns}
            data={items}
            loading={loading}
            actions={{
              onDelete: handleDelete,
            }}
            showSummaryRow
            summaryColumns={["quantity", "netWeight", "price"]}
          />
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={loading}>
            Save
          </Button>
        </div>
      </div>
    </Modal>
  );
}
