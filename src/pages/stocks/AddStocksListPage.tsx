import { useState } from "react";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Plus, Printer, Edit, Trash } from "lucide-react";
import type { AddStock } from "./types";
import { AddStockModal } from "./AddStockModal";

const columns = [
  { key: "date", label: "Date" },
  { key: "product", label: "Product" },
  { key: "quantity", label: "Quantity (Bag)" },
  { key: "netWeight", label: "Net Weight (Kg)" },
  { key: "rate", label: "Rate" },
  { key: "totalPrice", label: "Total Price" },
];

export function AddStocksListPage() {
  const [modal, setModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<AddStock | null>(null);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<AddStock[]>([]);
  const [products, setProducts] = useState<string[]>([]);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  const handleSearch = async (
    searchTerm: string,
    filters: { dateFrom?: string; dateTo?: string; product?: string }
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

  const handleEdit = (item: AddStock) => {
    setSelectedItem(item);
    setModal(true);
  };

  const handleDelete = async (id: string) => {
    // TODO: Implement delete
  };

  const handleBulkDelete = async () => {
    // TODO: Implement bulk delete
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Add Stocks List</h1>
      </div>

      <FilterBar
        onSearch={handleSearch}
        fields={[
          {
            type: "date",
            name: "dateFrom",
            label: "Date From",
          },
          {
            type: "date",
            name: "dateTo",
            label: "Date To",
          },
          {
            type: "select",
            name: "product",
            label: "Product",
            options: products.map((prod) => ({ label: prod, value: prod })),
          },
        ]}
      />

      <div className="flex gap-2">
        <Button
          onClick={() => setModal(true)}
          icon={<Plus className="w-4 h-4" />}
        >
          New
        </Button>
        {selectedRows.length > 0 && (
          <Button
            variant="destructive"
            onClick={handleBulkDelete}
            icon={<Trash className="w-4 h-4" />}
          >
            Delete Selected
          </Button>
        )}
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
          showSelection
          selectionColumn={{
            id: "select",
            header: "Select",
            cell: ({ row }) => (
              <input
                type="checkbox"
                checked={selectedRows.includes(row.original.id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedRows([...selectedRows, row.original.id]);
                  } else {
                    setSelectedRows(
                      selectedRows.filter((id) => id !== row.original.id)
                    );
                  }
                }}
              />
            ),
          }}
          showSummaryRow
          summaryColumns={["quantity", "netWeight", "totalPrice"]}
        />
      </Card>

      {modal && (
        <AddStockModal
          open={modal}
          item={selectedItem}
          onClose={() => {
            setModal(false);
            setSelectedItem(null);
          }}
          onSave={async (data) => {
            // TODO: Implement save
            setModal(false);
            setSelectedItem(null);
          }}
        />
      )}
    </div>
  );
}
