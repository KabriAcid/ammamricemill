import React, { useState, useEffect } from "react";
import {
  Printer,
  Package,
  ShoppingBag,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Table } from "../../components/ui/Table";
import { FilterBar } from "../../components/ui/FilterBar";
import { format } from "date-fns";
import { api } from "../../utils/fetcher";
import { useToast } from "../../components/ui/Toast";
import { formatCurrency, formatNumber } from "../../utils/formatters";

interface EmptybagStock {
  id: string;
  categoryId: string;
  categoryName?: string;
  productId: string;
  productName?: string;
  size?: string;
  weight?: string;
  opening: number;
  receive: number;
  purchase: number;
  payment: number;
  sales: number;
  stocks: number;
}

const EmptybagStocks: React.FC = () => {
  // State management
  const [stocks, setStocks] = useState<EmptybagStock[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [searchQuery, setSearchQuery] = useState("");
  const [partyFilter, setPartyFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [parties, setParties] = useState<Array<{ id: string; name: string }>>(
    []
  );
  const { showToast } = useToast();

  // Fetch emptybag stocks
  useEffect(() => {
    const fetchEmptybagStocks = async () => {
      setLoading(true);
      try {
        const res = await api.get<any>(`/stocks/emptybag-stocks`);
        if (res.success && res.data) {
          setStocks(
            res.data.map((r: any) => ({
              id: String(r.productId || r.id || ""),
              categoryId: String(r.categoryId || ""),
              categoryName: r.categoryName || "",
              productId: String(r.productId || ""),
              productName: r.productName || "",
              size: r.size || "",
              weight: r.weight || "",
              opening: Number(r.opening) || 0,
              receive: Number(r.receive) || 0,
              purchase: Number(r.purchase) || 0,
              payment: Number(r.payment) || 0,
              sales: Number(r.sales) || 0,
              stocks: Number(r.stocks) || 0,
            }))
          );
        }
        // fetch parties for filter dropdown
        try {
          const p = await api.get<any>(`/party/parties`);
          if (p.success && p.data)
            setParties(
              p.data.map((x: any) => ({ id: String(x.id), name: x.name }))
            );
        } catch (e) {
          // ignore party fetch failure
        }
      } catch (error) {
        console.error("Error fetching emptybag stocks:", error);
        showToast("Failed to load emptybag stocks", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchEmptybagStocks();
  }, [currentPage, pageSize, searchQuery, partyFilter]);

  // Filtering logic
  const filteredStocks = stocks.filter((stock) => {
    const matchesSearch =
      stock.productName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stock.categoryName?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // Pagination
  const totalPages = Math.ceil(filteredStocks.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedStocks = filteredStocks.slice(
    startIndex,
    startIndex + pageSize
  );

  // Table columns
  const columns = [
    { key: "id", label: "#", width: "60px" },
    { key: "categoryName", label: "Category", sortable: true },
    { key: "productName", label: "Product Name", sortable: true },
    { key: "size", label: "Size" },
    { key: "weight", label: "Weight" },
    {
      key: "opening",
      label: "Opening",
      render: (value: number) => formatNumber(value, 0),
    },
    {
      key: "receive",
      label: "Receive",
      render: (value: number) => formatNumber(value, 0),
    },
    {
      key: "purchase",
      label: "Purchase",
      render: (value: number) => formatNumber(value, 0),
    },
    {
      key: "payment",
      label: "Payment",
      render: (value: number) => formatNumber(value, 0),
    },
    {
      key: "sales",
      label: "Sales",
      render: (value: number) => formatNumber(value, 0),
    },
    {
      key: "stocks",
      label: "Stocks",
      render: (value: number) => formatNumber(value, 0),
    },
  ];

  // Calculate summary statistics
  const stats = {
    totalStock: stocks.reduce((sum, s) => sum + s.stocks, 0),
    totalPurchase: stocks.reduce((sum, s) => sum + s.purchase, 0),
    totalSales: stocks.reduce((sum, s) => sum + s.sales, 0),
    totalProducts: stocks.length,
  };

  // Calculate totals for table footer
  const totals = {
    opening: stocks.reduce((sum, s) => sum + s.opening, 0),
    receive: stocks.reduce((sum, s) => sum + s.receive, 0),
    purchase: stocks.reduce((sum, s) => sum + s.purchase, 0),
    payment: stocks.reduce((sum, s) => sum + s.payment, 0),
    sales: stocks.reduce((sum, s) => sum + s.sales, 0),
    stocks: stocks.reduce((sum, s) => sum + s.stocks, 0),
  };

  const loadingCards = loading && !stocks.length;

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Emptybag Stocks</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage and track emptybag inventory and movements.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card icon={<Package size={32} />} loading={loadingCards} hover>
          <div>
            <p className="text-3xl font-bold text-gray-700">
              {formatNumber(stats.totalStock, 0)}
            </p>
            <p className="text-sm text-gray-500">Total Stock</p>
          </div>
        </Card>
        <Card icon={<ShoppingBag size={32} />} loading={loadingCards} hover>
          <div>
            <p className="text-3xl font-bold text-gray-700">
              {formatNumber(stats.totalPurchase, 0)}
            </p>
            <p className="text-sm text-gray-500">Total Purchase</p>
          </div>
        </Card>
        <Card icon={<DollarSign size={32} />} loading={loadingCards} hover>
          <div>
            <p className="text-3xl font-bold text-gray-700">
              ₦{formatCurrency(stats.totalSales)}
            </p>
            <p className="text-sm text-gray-500">Total Sales</p>
          </div>
        </Card>
        <Card icon={<TrendingUp size={32} />} loading={loadingCards} hover>
          <div>
            <p className="text-3xl font-bold text-gray-700">
              {stats.totalProducts}
            </p>
            <p className="text-sm text-gray-500">Total Products</p>
          </div>
        </Card>
      </div>

      {/* Company Header (for print) */}
      <div className="hidden print:block text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Ammam Rice Mill</h1>
        <p className="text-sm text-gray-500">123 Rice Mill Road, City</p>
        <p className="text-sm text-gray-500">
          Date: {format(new Date(), "dd/MM/yyyy")}
        </p>
      </div>

      {/* Filter Bar */}
      <FilterBar onSearch={setSearchQuery} placeholder="Search by product...">
        <div className="flex items-center space-x-2">
          <select
            value={partyFilter}
            onChange={(e) => setPartyFilter(e.target.value)}
            className="input-base h-9"
          >
            <option value="">All Parties</option>
            {parties.map((party) => (
              <option key={party.id} value={party.id}>
                {party.name}
              </option>
            ))}
          </select>
          <Button
            variant="outline"
            size="sm"
            icon={Printer}
            onClick={() => window.print()}
          >
            Print
          </Button>
        </div>
      </FilterBar>

      {/* Table */}
      <Table
        data={paginatedStocks}
        columns={columns}
        loading={loading}
        pagination={{
          currentPage,
          totalPages,
          pageSize,
          totalItems: filteredStocks.length,
          onPageChange: setCurrentPage,
          onPageSizeChange: (size) => {
            setPageSize(size);
            setCurrentPage(1);
          },
        }}
        summaryRow={{
          opening: formatNumber(totals.opening, 0),
          receive: formatNumber(totals.receive, 0),
          purchase: formatNumber(totals.purchase, 0),
          payment: formatNumber(totals.payment, 0),
          sales: `₦${formatCurrency(totals.sales)}`,
          stocks: formatNumber(totals.stocks, 0),
        }}
      />
    </div>
  );
};

export default EmptybagStocks;
