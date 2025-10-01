import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { Table } from "../../components/ui/Table";

interface SaleLedgerEntry {
  id: string;
  date: string;
  invoiceNo: string;
  partyId: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
}

const SalesLedger: React.FC = () => {
  const [entries, setEntries] = useState<SaleLedgerEntry[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [partyId, setPartyId] = useState("");
  const [loading, setLoading] = useState(false);
  const [parties, setParties] = useState<Array<{ id: string; name: string }>>(
    []
  );

  // Fetch ledger entries
  useEffect(() => {
    const fetchLedger = async () => {
      setLoading(true);
      try {
        // TODO: Replace with actual API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Mock data
        const mockEntries: SaleLedgerEntry[] = [
          {
            id: "1",
            date: "2024-01-15",
            invoiceNo: "SALE-001",
            partyId: "PARTY-001",
            description: "Product Sale",
            debit: 5500,
            credit: 5000,
            balance: 500,
          },
          {
            id: "2",
            date: "2024-01-16",
            invoiceNo: "PAY-001",
            partyId: "PARTY-001",
            description: "Payment Received",
            debit: 0,
            credit: 500,
            balance: 0,
          },
        ];

        setEntries(mockEntries);

        // Mock parties data
        setParties([
          { id: "PARTY-001", name: "Customer 1" },
          { id: "PARTY-002", name: "Customer 2" },
        ]);
      } catch (error) {
        console.error("Error fetching ledger:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLedger();
  }, [dateRange, partyId]);

  // Filtering and pagination
  const filteredEntries = entries.filter((entry) => {
    const matchesParty = !partyId || entry.partyId === partyId;
    const matchesDateRange =
      (!dateRange.from || entry.date >= dateRange.from) &&
      (!dateRange.to || entry.date <= dateRange.to);
    return matchesParty && matchesDateRange;
  });

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
    { key: "invoiceNo", label: "Reference No" },
    { key: "description", label: "Description" },
    {
      key: "debit",
      label: "Debit",
      render: (value: number) => (value ? `₹${value.toLocaleString()}` : "-"),
    },
    {
      key: "credit",
      label: "Credit",
      render: (value: number) => (value ? `₹${value.toLocaleString()}` : "-"),
    },
    {
      key: "balance",
      label: "Balance",
      render: (value: number) => `₹${value.toLocaleString()}`,
    },
  ];

  // Calculate summary
  const summary = {
    totalDebit: entries.reduce((sum, entry) => sum + entry.debit, 0),
    totalCredit: entries.reduce((sum, entry) => sum + entry.credit, 0),
    currentBalance:
      entries.length > 0 ? entries[entries.length - 1].balance : 0,
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Sales Ledger</h1>
        <p className="mt-2 text-sm text-gray-700">
          View and track all sales transactions
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Debit</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            ₹{summary.totalDebit.toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Credit</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            ₹{summary.totalCredit.toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Current Balance</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            ₹{summary.currentBalance.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <select
              value={partyId}
              onChange={(e) => setPartyId(e.target.value)}
              className="input-base w-full"
            >
              <option value="">All Parties</option>
              {parties.map((party) => (
                <option key={party.id} value={party.id}>
                  {party.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, from: e.target.value }))
              }
              className="input-base w-full"
              placeholder="From Date"
            />
          </div>
          <div>
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, to: e.target.value }))
              }
              className="input-base w-full"
              placeholder="To Date"
            />
          </div>
        </div>
      </div>

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
          onPageSizeChange: setPageSize,
        }}
      />
    </div>
  );
};

export default SalesLedger;
