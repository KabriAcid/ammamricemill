import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { FilterBar } from "../../components/ui/FilterBar";
import {
  RefreshCcw,
  Printer,
  Download,
  TrendingUp,
  ArrowUpCircle,
  ArrowDownCircle,
  Wallet,
} from "lucide-react";
import { SkeletonCard } from "../../components/ui/Skeleton";
import { useToast } from "../../components/ui/Toast";
import { api } from "../../utils/fetcher";
import { ApiResponse } from "../../types";

// TypeScript Interfaces
interface Party {
  id: string;
  name: string;
}

export interface SaleLedgerEntry {
  id: string;
  sl: number;
  date: string;
  type: string;
  invoiceNo: string;
  partyId: string;
  partyName?: string;
  godown?: string;
  product?: string;
  size?: string;
  weight?: number;
  quantity?: number;
  netWeight?: number;
  rate?: number;
  totalPrice?: number;
  description: string;
  debit: number;
  credit: number;
  balance: number;
}

const SalesLedger = () => {
  // State Management
  const [data, setData] = useState<SaleLedgerEntry[]>([]);
  const [parties, setParties] = useState<Party[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [partyFilter, setPartyFilter] = useState("");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const { showToast } = useToast();

  // Fetch ledger data
  const fetchLedger = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (partyFilter) params.append("partyId", partyFilter);
      if (dateRange.from) params.append("from", dateRange.from);
      if (dateRange.to) params.append("to", dateRange.to);

      const response = await api.get<ApiResponse<SaleLedgerEntry[]>>(
        `/sales/ledger?${params}`
      );

      if (response.success && response.data) {
        setData(response.data);
      }
    } catch (error) {
      console.error("Error fetching ledger:", error);
      showToast("Failed to load ledger data", "error");
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  // Fetch parties for filter dropdown
  const fetchParties = async () => {
    try {
      const response = await api.get<ApiResponse<Party[]>>("/parties");
      if (response.success && response.data) {
        setParties(response.data);
      }
    } catch (error) {
      console.error("Error fetching parties:", error);
    }
  };

  // Refresh with animation
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchLedger();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // Initial data load
  useEffect(() => {
    fetchLedger();
    fetchParties();
  }, []);

  // Reload when filters change
  useEffect(() => {
    if (!initialLoading) {
      fetchLedger();
    }
  }, [partyFilter, dateRange]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "k") {
        event.preventDefault();
        document
          .querySelector<HTMLInputElement>('input[type="search"]')
          ?.focus();
      }
      if ((event.ctrlKey || event.metaKey) && event.key === "r") {
        event.preventDefault();
        handleRefresh();
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, []);

  // Reset pagination when search/filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, partyFilter, dateRange]);

  // Live search filtering
  const filteredData = data.filter((entry) => {
    const query = search.toLowerCase().trim();
    if (!query) return true;

    return (
      entry.invoiceNo?.toLowerCase().includes(query) ||
      entry.partyName?.toLowerCase().includes(query) ||
      entry.description?.toLowerCase().includes(query) ||
      entry.product?.toLowerCase().includes(query) ||
      false
    );
  });

  // Pagination
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = filteredData.slice(startIndex, startIndex + pageSize);

  // Calculate summary statistics
  const openingBalance =
    data.length > 0 ? data[0].balance - (data[0].debit - data[0].credit) : 0;
  const totalDebit = filteredData.reduce((sum, entry) => sum + entry.debit, 0);
  const totalCredit = filteredData.reduce(
    (sum, entry) => sum + entry.credit,
    0
  );
  const closingBalance =
    filteredData.length > 0 ? filteredData[filteredData.length - 1].balance : 0;

  // Handlers
  const handlePrint = () => {
    window.print();
  };

  const handleExport = async (format: "excel" | "pdf") => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (partyFilter) params.append("partyId", partyFilter);
      if (dateRange.from) params.append("from", dateRange.from);
      if (dateRange.to) params.append("to", dateRange.to);
      params.append("format", format);

      const response = await api.download(`/sales/ledger/export?${params}`);

      showToast(`Ledger exported as ${format.toUpperCase()}`, "success");
    } catch (error) {
      console.error("Error exporting ledger:", error);
      showToast("Failed to export ledger", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sales Ledger</h1>
          <p className="mt-1 text-sm text-gray-500">
            View and track all sales transactions with running balance
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className={`p-2 text-gray-500 hover:text-gray-700 transition-colors ${
            isRefreshing ? "animate-spin" : ""
          }`}
          title="Refresh data (Ctrl+R)"
        >
          <RefreshCcw className="w-5 h-5" />
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-6">
        {initialLoading ? (
          <>
            <SkeletonCard variant="stat" />
            <SkeletonCard variant="stat" />
            <SkeletonCard variant="stat" />
            <SkeletonCard variant="stat" />
          </>
        ) : (
          <>
            <Card icon={<TrendingUp className="w-8 h-8 text-blue-600" />} hover>
              <div>
                <p className="text-3xl font-bold text-gray-700">
                  ₦{openingBalance.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">Opening Balance</p>
              </div>
            </Card>
            <Card
              icon={<ArrowUpCircle className="w-8 h-8 text-red-600" />}
              hover
            >
              <div>
                <p className="text-3xl font-bold text-gray-700">
                  ₦{totalDebit.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">Total Debit</p>
              </div>
            </Card>
            <Card
              icon={<ArrowDownCircle className="w-8 h-8 text-green-600" />}
              hover
            >
              <div>
                <p className="text-3xl font-bold text-gray-700">
                  ₦{totalCredit.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">Total Credit</p>
              </div>
            </Card>
            <Card icon={<Wallet className="w-8 h-8 text-primary-600" />} hover>
              <div>
                <p
                  className={`text-3xl font-bold ${
                    closingBalance > 0
                      ? "text-red-600"
                      : closingBalance < 0
                      ? "text-green-600"
                      : "text-gray-700"
                  }`}
                >
                  ₦{closingBalance.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">Closing Balance</p>
              </div>
            </Card>
          </>
        )}
      </div>

      {/* Filter Bar */}
      <FilterBar
        onSearch={setSearch}
        placeholder="Search by invoice, party, or description... (Ctrl+K)"
        value={search}
      >
        <div className="flex items-center space-x-2">
          <select
            value={partyFilter}
            onChange={(e) => setPartyFilter(e.target.value)}
            className="input-base"
          >
            <option value="">All Parties</option>
            {parties.map((party) => (
              <option key={party.id} value={party.id}>
                {party.name}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={dateRange.from}
            onChange={(e) =>
              setDateRange((prev) => ({ ...prev, from: e.target.value }))
            }
            className="input-base"
            placeholder="From Date"
          />
          <input
            type="date"
            value={dateRange.to}
            onChange={(e) =>
              setDateRange((prev) => ({ ...prev, to: e.target.value }))
            }
            className="input-base"
            placeholder="To Date"
          />
          <Button
            variant="outline"
            size="sm"
            icon={Printer}
            onClick={handlePrint}
          >
            Print
          </Button>
          <Button
            variant="outline"
            size="sm"
            icon={Download}
            onClick={() => handleExport("excel")}
          >
            Export
          </Button>
        </div>
      </FilterBar>

      {/* Scrollable Table with Fixed Header */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto overflow-y-auto max-h-[600px] scrollbar-hide">
          <style>{`
            .scrollbar-hide::-webkit-scrollbar {
              display: none;
            }
            .scrollbar-hide {
              -ms-overflow-style: none;
              scrollbar-width: none;
            }
          `}</style>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  SL#
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Date
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Type
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Invoice No
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Party
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Godown
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Product
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Size
                </th>
                <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Weight
                </th>
                <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Quantity
                </th>
                <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Net Weight
                </th>
                <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Rate
                </th>
                <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Total Price
                </th>
                <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Debit
                </th>
                <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Credit
                </th>
                <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Balance
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {initialLoading || loading ? (
                <tr>
                  <td colSpan={16} className="px-3 py-8 text-center">
                    <div className="flex items-center justify-center">
                      <RefreshCcw className="w-6 h-6 animate-spin text-gray-400" />
                      <span className="ml-2 text-sm text-gray-500">
                        Loading ledger...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={16} className="px-3 py-8 text-center">
                    <p className="text-sm text-gray-500">
                      No ledger entries found
                    </p>
                  </td>
                </tr>
              ) : (
                <>
                  {paginatedData.map((entry) => (
                    <tr key={entry.id} className="hover:bg-gray-50">
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                        {entry.sl}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                        {format(new Date(entry.date), "dd-MM-yyyy")}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                        {entry.type}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                        {entry.invoiceNo}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                        {entry.partyName || entry.partyId}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                        {entry.godown || "-"}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                        {entry.product || "-"}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                        {entry.size || "-"}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        {entry.weight ? entry.weight.toLocaleString() : "-"}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        {entry.quantity ? entry.quantity.toLocaleString() : "-"}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        {entry.netWeight
                          ? entry.netWeight.toLocaleString()
                          : "-"}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        {entry.rate ? `₦${entry.rate.toLocaleString()}` : "-"}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        {entry.totalPrice
                          ? `₦${entry.totalPrice.toLocaleString()}`
                          : "-"}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-red-600 text-right font-medium">
                        {entry.debit > 0
                          ? `₦${entry.debit.toLocaleString()}`
                          : "-"}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-green-600 text-right font-medium">
                        {entry.credit > 0
                          ? `₦${entry.credit.toLocaleString()}`
                          : "-"}
                      </td>
                      <td
                        className={`px-3 py-4 whitespace-nowrap text-sm text-right font-semibold ${
                          entry.balance > 0
                            ? "text-red-600"
                            : entry.balance < 0
                            ? "text-green-600"
                            : "text-gray-900"
                        }`}
                      >
                        ₦{entry.balance.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  {/* Summary Row */}
                  <tr className="bg-gray-100 font-semibold sticky bottom-0">
                    <td
                      colSpan={13}
                      className="px-3 py-4 text-sm text-gray-900"
                    >
                      <span className="font-bold">
                        Total ({filteredData.length} entries)
                      </span>
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-red-600 text-right font-bold">
                      ₦{totalDebit.toLocaleString()}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-green-600 text-right font-bold">
                      ₦{totalCredit.toLocaleString()}
                    </td>
                    <td
                      className={`px-3 py-4 whitespace-nowrap text-sm text-right font-bold ${
                        closingBalance > 0
                          ? "text-red-600"
                          : closingBalance < 0
                          ? "text-green-600"
                          : "text-gray-900"
                      }`}
                    >
                      ₦{closingBalance.toLocaleString()}
                    </td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!initialLoading && !loading && paginatedData.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {startIndex + 1} to{" "}
              {Math.min(startIndex + pageSize, filteredData.length)} of{" "}
              {filteredData.length} entries
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesLedger;
