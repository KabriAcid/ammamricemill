import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FilterBar } from "@/components/ui/filter-bar";
import { DataTable } from "@/components/ui/data-table";
import { Printer, FileText } from "lucide-react";
import type { Stock } from "./types";
import { OpeningStockModal } from "./OpeningStockModal";

const columns = [
  {
    accessorKey: "category",
    header: "Category",
  },
  {
    accessorKey: "product",
    header: "Product",
  },
  {
    accessorKey: "opening",
    header: "Opening",
  },
  {
    accessorKey: "add",
    header: "Add",
  },
  {
    accessorKey: "purchase",
    header: "Purchase",
  },
  {
    accessorKey: "sales",
    header: "Sales",
  },
  {
    accessorKey: "production",
    header: "Production",
  },
  {
    accessorKey: "productionStocks",
    header: "Production Stocks",
  },
  {
    accessorKey: "stock",
    header: "Stock",
  },
  {
    accessorKey: "avgPrice",
    header: "Avg Price",
  },
  {
    accessorKey: "totalPrice",
    header: "Total Price",
  },
];

export function StocksDetailsPage() {
  const [openingStockModal, setOpeningStockModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Stock[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [godowns, setGodowns] = useState<string[]>([]);

  const handleSearch = async (
    searchTerm: string,
    filters: { category?: string; godown?: string }
  ) => {
    setLoading(true);
    try {
      // TODO: Implement API call
      // const response = await fetch(...);
      // setData(response.data);
    } catch (error) {
      console.error("Error fetching stocks:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Stocks Details</h1>
          <div className="text-sm text-gray-500">
            <p>Company Name</p>
            <p>Address</p>
            <p>{new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      <FilterBar
        onSearch={handleSearch}
        fields={[
          {
            type: "select",
            name: "category",
            label: "Category",
            options: categories.map((cat) => ({ label: cat, value: cat })),
          },
          {
            type: "select",
            name: "godown",
            label: "Godown",
            options: godowns.map((godown) => ({
              label: godown,
              value: godown,
            })),
          },
          {
            type: "text",
            name: "product",
            label: "Product Search",
            placeholder: "Search products...",
          },
        ]}
      />

      <div className="flex gap-2">
        <Button variant="outline" onClick={() => setOpeningStockModal(true)}>
          Opening Stock
        </Button>
        <Button
          variant="outline"
          onClick={handlePrint}
          icon={<Printer className="w-4 h-4" />}
        >
          Print
        </Button>
      </div>

      <Card>
        <DataTable
          columns={columns}
          data={data}
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
            "avgPrice",
            "totalPrice",
          ]}
        />
      </Card>

      {openingStockModal && (
        <OpeningStockModal
          open={openingStockModal}
          onClose={() => setOpeningStockModal(false)}
          onSave={async (data) => {
            // TODO: Implement save
            setOpeningStockModal(false);
          }}
        />
      )}
    </div>
  );
}
