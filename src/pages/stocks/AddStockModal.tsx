import { useState, useEffect } from "react";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import type { AddStock, StockFormData } from "./types";

interface AddStockModalProps {
  isOpen: boolean;
  item: AddStock | null;
  onClose: () => void;
  onSave: (data: StockFormData) => Promise<void>;
}

export function AddStockModal({
  isOpen,
  item,
  onClose,
  onSave,
}: AddStockModalProps) {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Array<{id: string, name: string}>>([]);
  const [godowns, setGodowns] = useState<Array<{id: string, name: string}>>([]);
  const [formData, setFormData] = useState<StockFormData>({
    date: new Date().toISOString().split("T")[0],
    product: "",
    godown: "",
    quantity: 0,
    netWeight: 0,
    rate: 0,
    price: 0,
    notes: "",
  });

  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        // TODO: Replace with actual API calls
        setProducts([
          { id: "P1", name: "Rice" },
          { id: "P2", name: "Wheat" }
        ]);
        setGodowns([
          { id: "G1", name: "Godown 1" },
          { id: "G2", name: "Godown 2" }
        ]);
      } catch (error) {
        console.error("Error fetching master data:", error);
      }
    };

    fetchMasterData();
  }, []);

  useEffect(() => {
    if (item) {
      setFormData({
        date: item.date,
        product: item.product,
        godown: item.godown,
        quantity: item.quantity,
        netWeight: item.netWeight,
        rate: item.rate,
        price: item.totalPrice,
        notes: item.notes || "",
      });
    }
  }, [item]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error("Error saving stock:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (name: string, value: string | number) => {
    setFormData((prev) => {
      const updates = { [name]: value };

      // Calculate price when rate or netWeight changes
      if (name === "rate" || name === "netWeight") {
        updates.price =
          Number(formData.rate || 0) * Number(formData.netWeight || 0);
      }

      return { ...prev, ...updates };
    });
  };

  return (
    <Modal
      title={item ? "Edit Stock" : "Add Stock"}
      isOpen={isOpen}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Date"
          type="date"
          value={formData.date}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("date", e.target.value)}
          required
        />

        <Select
          label="Product"
          value={formData.product}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleChange("product", e.target.value)}
        >
          <option value="">Select Product</option>
          {products.map((prod) => (
            <option key={prod.id} value={prod.id}>
              {prod.name}
            </option>
          ))}
        </Select>

        <Select
          label="Godown"
          value={formData.godown}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleChange("godown", e.target.value)}
        >
          <option value="">Select Godown</option>
          {godowns.map((godown) => (
            <option key={godown.id} value={godown.id}>
              {godown.name}
            </option>
          ))}
        </Select>

        <Input
          label="Quantity (Bag)"
          type="number"
          value={formData.quantity}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("quantity", Number(e.target.value))}
          required
        />

        <Input
          label="Net Weight (Kg)"
          type="number"
          value={formData.netWeight}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("netWeight", Number(e.target.value))}
          required
        />

        <Input
          label="Rate"
          type="number"
          value={formData.rate}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("rate", Number(e.target.value))}
          required
        />

        <Input
          label="Price"
          type="number"
          value={formData.price}
          disabled
        />

        <Input
          label="Notes"
          type="text"
          value={formData.notes}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("notes", e.target.value)}
        />

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            {item ? "Update" : "Save"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
