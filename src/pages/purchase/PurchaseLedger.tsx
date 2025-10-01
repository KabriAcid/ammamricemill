import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Printer,
  ShoppingBag,
  PackageCheck,
  DollarSign,
  Scale,
} from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Table } from "../../components/ui/Table";
import { FilterBar } from "../../components/ui/FilterBar";
import { PurchaseLedgerEntry } from "../../types/purchase";
import { format } from "date-fns";

const PurchaseLedger: React.FC = () => {
  // State management
  const [entries, setEntries] = useState<PurchaseLedgerEntry[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Fetch ledger entries
  useEffect(() => {
    const fetchEntries = async () => {
      setLoading(true);
      try {
        // TODO: Replace with actual API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
        // Mock data
        const mockEntries: PurchaseLedgerEntry[] = [
          {
            id: "1",
            date: "2024-01-15",
            invoiceNo: "PUR-001",
            partyId: "PARTY-001",
            partyName: "Sample Party",
            productId: "PROD-001",
            productName: "Sample Product",
            quantity: 100,
            netWeight: 5000,
            rate: 50,
            totalPrice: 5000,
            createdAt: "2024-01-15T10:00:00Z",
            updatedAt: "2024-01-15T10:00:00Z",
          },
        ];
        setEntries(mockEntries);
      } catch (error) {
        console.error("Error fetching ledger entries:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEntries();
  }, []);

  // Filtering logic
  const filteredEntries = entries.filter((entry) => {
    const matchesSearch =
      entry.invoiceNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.partyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.productName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDateRange =
      (!dateRange.from || entry.date >= dateRange.from) &&
      (!dateRange.to || entry.date <= dateRange.to);
    return matchesSearch && matchesDateRange;
  });

  // Pagination
  const totalPages = Math.ceil(filteredEntries.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedEntries = filteredEntries.slice(
    startIndex,
    startIndex + pageSize
  );

  // Table columns
  const columns = [
    { key: "id", label: "#", width: "80px" },
    {
      key: "date",
      label: "Date",
      render: (value: string) => format(new Date(value), "dd/MM/yyyy"),
    },
    { key: "invoiceNo", label: "Invoice No", sortable: true },
    { key: "partyName", label: "Party", sortable: true },
    { key: "productName", label: "Product", sortable: true },
    {
      key: "quantity",
      label: "Quantity (Bag)",
      render: (value: number) => value.toLocaleString(),
    },
    {
      key: "netWeight",
      label: "Net Weight (Kg)",
      render: (value: number) => value.toLocaleString(),
    },
    {
      key: "rate",
      label: "Rate",
      render: (value: number) => `₹${value.toLocaleString()}`,
    },
    {
      key: "totalPrice",
      label: "Total Price",
      render: (value: number) => `₹${value.toLocaleString()}`,
    },
  ];

  // Calculate summary statistics
  const stats = {
    totalEntries: entries.length,
    totalQuantity: entries.reduce((sum, e) => sum + e.quantity, 0),
    totalWeight: entries.reduce((sum, e) => sum + e.netWeight, 0),
    totalAmount: entries.reduce((sum, e) => sum + e.totalPrice, 0),
  };

  const loadingCards = loading && !entries.length;

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Purchase Ledger</h1>
        <p className="mt-1 text-sm text-gray-500">
          View detailed purchase transaction history.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card icon={<ShoppingBag size={32} />} loading={loadingCards} hover>
          <div>
            <p className="text-3xl font-bold text-gray-700">
              {stats.totalEntries}
            </p>
            <p className="text-sm text-gray-500">Total Entries</p>
          </div>
        </Card>
        <Card icon={<PackageCheck size={32} />} loading={loadingCards} hover>
          <div>
            <p className="text-3xl font-bold text-gray-700">
              {stats.totalQuantity.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500">Total Quantity</p>
          </div>
        </Card>
        <Card icon={<Scale size={32} />} loading={loadingCards} hover>
          <div>
            <p className="text-3xl font-bold text-gray-700">
              {stats.totalWeight.toLocaleString()} Kg
            </p>
            <p className="text-sm text-gray-500">Total Weight</p>
          </div>
        </Card>
        <Card icon={<DollarSign size={32} />} loading={loadingCards} hover>
          <div>
            <p className="text-3xl font-bold text-gray-700">
              ₹{stats.totalAmount.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500">Total Amount</p>
          </div>
        </Card>
      </div>

      {/* Filter Bar */}
      <FilterBar
        onSearch={setSearchQuery}
        placeholder="Search by invoice, party, or product..."
      >
        <div className="flex items-center space-x-2">
          <input
            type="date"
            value={dateRange.from}
            onChange={(e) =>
              setDateRange((prev) => ({ ...prev, from: e.target.value }))
            }
            className="input-base h-9"
          />
          <input
            type="date"
            value={dateRange.to}
            onChange={(e) =>
              setDateRange((prev) => ({ ...prev, to: e.target.value }))
            }
            className="input-base h-9"
          />
          <Button
            onClick={() => navigate("/purchases/new")}
            icon={Plus}
            size="sm"
          >
            New Purchase
          </Button>
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
        data={paginatedEntries}
        columns={columns}
        loading={loading}
        pagination={{
          currentPage,
          totalPages,
          pageSize,
          totalItems: filteredEntries.length,
          onPageChange: setCurrentPage,
          onPageSizeChange: (size) => {
            setPageSize(size);
            setCurrentPage(1);
          },
        }}
      />
    </div>
  );
};

export default PurchaseLedger;
