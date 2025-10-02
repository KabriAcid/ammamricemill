import { useState } from "react";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Table } from "../../components/ui/Table";
import { Printer } from "lucide-react";

export function StockRegisterPage() {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [products, setProducts] = useState<Array<{ id: string; name: string }>>(
    []
  );
  const [stocks, setStocks] = useState<any[]>([]);
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");

  const loadMasterData = async () => {
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
      console.error("Error loading master data:", error);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      // TODO: Implement API call
      // const response = await fetch(...);
      setStocks([
        {
          id: "1",
          category: "Raw Rice",
          product: "Rice",
          opening: 100,
          add: 50,
          purchase: 200,
          sales: 150,
          production: 100,
          productionStocks: 80,
          stock: 300,
          avgPrice: 50,
          totalPrice: 15000,
        },
      ]);
    } catch (error) {
      console.error("Error fetching stock register:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const columns = [
    { key: "category", label: "Category" },
    { key: "product", label: "Product" },
    {
      key: "opening",
      label: "Opening Stock",
      render: (value: number) => value.toLocaleString(),
    },
    {
      key: "add",
      label: "Add Stock",
      render: (value: number) => value.toLocaleString(),
    },
    {
      key: "purchase",
      label: "Purchase",
      render: (value: number) => value.toLocaleString(),
    },
    {
      key: "sales",
      label: "Sales",
      render: (value: number) => value.toLocaleString(),
    },
    {
      key: "production",
      label: "Production",
      render: (value: number) => value.toLocaleString(),
    },
    {
      key: "productionStocks",
      label: "Production Stocks",
      render: (value: number) => value.toLocaleString(),
    },
    {
      key: "stock",
      label: "Stock",
      render: (value: number) => value.toLocaleString(),
    },
    {
      key: "avgPrice",
      label: "Avg Price",
      render: (value: number) => value.toLocaleString(),
    },
    {
      key: "totalPrice",
      label: "Total Price",
      render: (value: number) => value.toLocaleString(),
    },
  ];

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Stock Register</h1>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <select
            className="input-base"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          <select
            className="input-base"
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
          >
            <option value="">All Products</option>
            {products.map((prod) => (
              <option key={prod.id} value={prod.id}>
                {prod.name}
              </option>
            ))}
          </select>

          <input
            type="date"
            className="input-base"
            value={dateRange.from}
            onChange={(e) =>
              setDateRange((prev) => ({ ...prev, from: e.target.value }))
            }
            placeholder="Date From"
          />

          <input
            type="date"
            className="input-base"
            value={dateRange.to}
            onChange={(e) =>
              setDateRange((prev) => ({ ...prev, to: e.target.value }))
            }
            placeholder="Date To"
          />
        </div>
      </Card>

      {/* Actions */}
      <div className="flex gap-2">
        <Button variant="outline" onClick={handlePrint}>
          <Printer className="w-4 h-4" />
          Print
        </Button>
      </div>

      {/* Table */}
      <Card>
        <Table
          columns={columns}
          data={stocks}
          loading={loading}
          showSummaryRow
          summaryColumns={[
            "opening",
            "add",
            "purchase",
            "sales",
            "production",
            "productionStocks",
            "stock",
            "totalPrice",
          ]}
        />
      </Card>
    </div>
  );
}
