import { useEffect, useState } from "react";
import { Button } from "../../components/ui/Button";
import { Table } from "../../components/ui/Table";
import { Card } from "../../components/ui/Card";
import { FilterBar } from "../../components/ui/FilterBar";
import { Boxes, Printer } from "lucide-react";

export interface EmptybagStock {
  id: string;
  category: string;
  productName: string;
  size: string;
  weight: number;
  opening: number;
  receive: number;
  purchase: number;
  payment: number;
  sales: number;
  stocks: number;
}

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

const EmptybagStocksList = () => {
  const [data, setData] = useState<EmptybagStock[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch all (GET)
  useEffect(() => {
    setLoading(true);
    fetch(`/api/emptybag-stocks?search=${encodeURIComponent(search)}`)
      .then((res) => res.json())
      .then((res) =>
        setData(res.map((item: any) => ({ ...item, id: String(item.id) })))
      )
      .finally(() => setLoading(false));
  }, [search]);

  // Table columns
  const columns = [
    { key: "id", label: "#", width: "60px" },
    { key: "category", label: "Category" },
    { key: "productName", label: "Product Name" },
    { key: "size", label: "Size" },
    { key: "weight", label: "Weight" },
    { key: "opening", label: "Opening" },
    { key: "receive", label: "Receive" },
    { key: "purchase", label: "Purchase" },
    { key: "payment", label: "Payment" },
    { key: "sales", label: "Sales" },
    { key: "stocks", label: "Stocks" },
  ];

  // Pagination
  const filtered = data.filter(
    (row) =>
      row.productName.toLowerCase().includes(search.toLowerCase()) ||
      row.category.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginated = filtered.slice(startIndex, startIndex + pageSize);

  // Stat cards
  const totalStocks = data.reduce((sum, d) => sum + (d.stocks || 0), 0);
  const totalOpening = data.reduce((sum, d) => sum + (d.opening || 0), 0);
  const totalPurchase = data.reduce((sum, d) => sum + (d.purchase || 0), 0);
  const totalSales = data.reduce((sum, d) => sum + (d.sales || 0), 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card icon={<Boxes className="w-8 h-8 text-primary-800" />}>
          <div>
            <div className="text-xs uppercase text-gray-500 font-semibold">
              Total Stocks
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {totalStocks}
            </div>
          </div>
        </Card>
        <Card icon={<Boxes className="w-8 h-8 text-primary-800" />}>
          <div>
            <div className="text-xs uppercase text-gray-500 font-semibold">
              Total Opening
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {totalOpening}
            </div>
          </div>
        </Card>
        <Card icon={<Boxes className="w-8 h-8 text-primary-800" />}>
          <div>
            <div className="text-xs uppercase text-gray-500 font-semibold">
              Total Purchase
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {totalPurchase}
            </div>
          </div>
        </Card>
        <Card icon={<Boxes className="w-8 h-8 text-primary-800" />}>
          <div>
            <div className="text-xs uppercase text-gray-500 font-semibold">
              Total Sales
            </div>
            <div className="text-2xl font-bold text-gray-900">{totalSales}</div>
          </div>
        </Card>
      </div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Emptybag Stocks List</h1>
        <Button
          icon={Printer}
          onClick={() => {
            /* Print logic */
          }}
        >
          Print
        </Button>
      </div>
      <FilterBar onSearch={setSearch} />
      <Table
        data={paginated}
        columns={columns}
        loading={loading}
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
          category: "",
          productName: "",
          size: "",
          weight: "",
          opening: <span className="font-bold">{totalOpening}</span>,
          receive: "",
          purchase: <span className="font-bold">{totalPurchase}</span>,
          payment: "",
          sales: <span className="font-bold">{totalSales}</span>,
          stocks: <span className="font-bold">{totalStocks}</span>,
        }}
      />
    </div>
  );
};

export default EmptybagStocksList;
