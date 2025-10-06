import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Production, ProductionItem } from "../../types/production";
import { Select } from "../../components/ui/Select";
import { Input } from "../../components/ui/Input";
import { Plus, Trash } from "lucide-react";

const ProductionStockForm: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<Partial<Production>>({
    invoiceNo: "",
    date: new Date().toISOString().split("T")[0],
    description: "",
    siloInfo: "",
    items: [],
    totalQuantity: 0,
    totalWeight: 0,
  });
  const [categories, setCategories] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [products, setProducts] = useState<Array<{ id: string; name: string }>>(
    []
  );
  const [godowns, setGodowns] = useState<Array<{ id: string; name: string }>>(
    []
  );
  const [silos, setSilos] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchMasterData = async () => {
      setLoading(true);
      try {
        // TODO: Replace with actual API calls
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Mock data
        setCategories([
          { id: "CAT-001", name: "Raw Rice" },
          { id: "CAT-002", name: "Processed Rice" },
        ]);

        setProducts([
          { id: "PROD-001", name: "Sona Masoori" },
          { id: "PROD-002", name: "Basmati" },
        ]);

        setGodowns([
          { id: "GD-001", name: "Godown 1" },
          { id: "GD-002", name: "Godown 2" },
        ]);

        setSilos([
          { id: "SILO-001", name: "Silo 1" },
          { id: "SILO-002", name: "Silo 2" },
        ]);
      } catch (error) {
        console.error("Error fetching master data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMasterData();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddItem = () => {
    const newItem: ProductionItem = {
      id: Date.now().toString(),
      categoryId: "",
      productId: "",
      godownId: "",
      siloId: "",
      quantity: 0,
      netWeight: 0,
    };

    setFormData((prev) => ({
      ...prev,
      items: [...(prev.items || []), newItem],
    }));
  };

  const handleRemoveItem = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items?.filter((_, i) => i !== index),
    }));
  };

  const handleItemChange = (
    index: number,
    field: keyof ProductionItem,
    value: any
  ) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items?.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const calculateTotals = () => {
    const items = formData.items || [];
    const totalQuantity = items.reduce(
      (sum, item) => sum + (item.quantity || 0),
      0
    );
    const totalWeight = items.reduce(
      (sum, item) => sum + (item.netWeight || 0),
      0
    );

    setFormData((prev) => ({
      ...prev,
      totalQuantity,
      totalWeight,
    }));
  };

  useEffect(() => {
    calculateTotals();
  }, [formData.items]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Save logic (API call)
    // After save, redirect or show a message
    navigate("/stocks/production-stocks");
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">New Production Stock Entry</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Invoice No"
            name="invoiceNo"
            value={formData.invoiceNo}
            onChange={handleInputChange}
            required
          />

          <Input
            label="Date"
            type="date"
            name="date"
            value={formData.date}
            onChange={handleInputChange}
            required
          />
        </div>

        <Input
          label="Description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
        />

        <Input
          label="Silo Information"
          name="siloInfo"
          value={formData.siloInfo}
          onChange={handleInputChange}
        />

        {/* Production Items */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Production Items</h3>
            <Button
              type="button"
              onClick={handleAddItem}
              variant="outline"
              icon={Plus}
              size="sm"
            >
              Add Item
            </Button>
          </div>

          <div className="space-y-4">
            {formData.items?.map((item, index) => (
              <div
                key={item.id}
                className="grid grid-cols-6 gap-4 items-start p-4 border rounded-lg"
              >
                <Select
                  label="Category"
                  value={item.categoryId}
                  onChange={(e) =>
                    handleItemChange(index, "categoryId", e.target.value)
                  }
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </Select>

                <Select
                  label="Product"
                  value={item.productId}
                  onChange={(e) =>
                    handleItemChange(index, "productId", e.target.value)
                  }
                  required
                >
                  <option value="">Select Product</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </Select>

                <Select
                  label="Godown"
                  value={item.godownId}
                  onChange={(e) =>
                    handleItemChange(index, "godownId", e.target.value)
                  }
                  required
                >
                  <option value="">Select Godown</option>
                  {godowns.map((godown) => (
                    <option key={godown.id} value={godown.id}>
                      {godown.name}
                    </option>
                  ))}
                </Select>

                <Select
                  label="Silo"
                  value={item.siloId}
                  onChange={(e) =>
                    handleItemChange(index, "siloId", e.target.value)
                  }
                  required
                >
                  <option value="">Select Silo</option>
                  {silos.map((silo) => (
                    <option key={silo.id} value={silo.id}>
                      {silo.name}
                    </option>
                  ))}
                </Select>

                <Input
                  type="number"
                  label="Quantity (Bags)"
                  value={item.quantity}
                  onChange={(e) =>
                    handleItemChange(index, "quantity", Number(e.target.value))
                  }
                  required
                />

                <div className="flex items-end gap-2">
                  <Input
                    type="number"
                    label="Net Weight (Kg)"
                    value={item.netWeight}
                    onChange={(e) =>
                      handleItemChange(
                        index,
                        "netWeight",
                        Number(e.target.value)
                      )
                    }
                    required
                  />

                  <Button
                    type="button"
                    onClick={() => handleRemoveItem(index)}
                    variant="danger"
                    icon={Trash}
                    size="sm"
                    aria-label="Remove"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Totals */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div className="text-right space-y-2">
            <p className="text-sm text-gray-500">Total Quantity:</p>
            <p className="text-lg font-semibold">
              {formData.totalQuantity?.toLocaleString()} Bags
            </p>
          </div>
          <div className="text-right space-y-2">
            <p className="text-sm text-gray-500">Total Weight:</p>
            <p className="text-lg font-semibold">
              {formData.totalWeight?.toLocaleString()} Kg
            </p>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            Create Production
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProductionStockForm;
