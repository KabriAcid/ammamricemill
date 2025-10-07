import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { FilterBar } from "../../components/ui/FilterBar";
import { Modal } from "../../components/ui/Modal";
import {
  RefreshCcw,
  Printer,
  Download,
  Plus,
  TrendingUp,
  ArrowUpCircle,
  ArrowDownCircle,
  Wallet,
  Edit,
} from "lucide-react";
import { SkeletonCard } from "../../components/ui/Skeleton";
import { useToast } from "../../components/ui/Toast";
import { api } from "../../utils/fetcher";
import { ApiResponse } from "../../types";
import { formatCurrency, formatNumber } from "../../utils/formatters";

// TypeScript Interfaces
interface Party {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
}

interface Godown {
  id: string;
  name: string;
}

interface LedgerItem {
  id: string;
  godown: string;
  product: string;
  size: string;
  weight: number;
  quantity: number;
  netWeight: number;
  rate: number;
  totalPrice: number;
}

export interface RicePaddyPurchaseLedgerEntry {
  id: string;
  sl: number;
  date: string;
  invoiceNo: string;
  partyId: string;
  partyName?: string;
  description: string;
  items: LedgerItem[];
  debit: number;
  credit: number;
  balance: number;
}

interface LedgerItemFormData {
  godown: string;
  product: string;
  size: string;
  weight: number;
  quantity: number;
  netWeight: number;
  rate: number;
  totalPrice: number;
}

const RicePaddyPurchaseLedger = () => {
  // State Management
  const [data, setData] = useState<RicePaddyPurchaseLedgerEntry[]>([]);
  const [parties, setParties] = useState<Party[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [godowns, setGodowns] = useState<Godown[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [partyFilter, setPartyFilter] = useState("");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] =
    useState<RicePaddyPurchaseLedgerEntry | null>(null);
  const [ledgerItems, setLedgerItems] = useState<LedgerItemFormData[]>([]);

  const { showToast } = useToast();

  // Fetch ledger data
  const fetchLedger = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (partyFilter) params.append("partyId", partyFilter);
      if (dateRange.from) params.append("from", dateRange.from);
      if (dateRange.to) params.append("to", dateRange.to);

      const response = await api.get<
        ApiResponse<RicePaddyPurchaseLedgerEntry[]>
      >(`/purchase/rice/ledger?${params}`);

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

  // Fetch parties, products, and godowns
  const fetchMasterData = async () => {
    try {
      const [partiesRes, productsRes, godownsRes] = await Promise.all([
        api.get<ApiResponse<Party[]>>("/parties"),
        api.get<ApiResponse<Product[]>>("/products"),
        api.get<ApiResponse<Godown[]>>("/godowns"),
      ]);

      if (partiesRes.success) setParties(partiesRes.data || []);
      if (productsRes.success) setProducts(productsRes.data || []);
      if (godownsRes.success) setGodowns(godownsRes.data || []);
    } catch (error) {
      console.error("Error fetching master data:", error);
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
    fetchMasterData();
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

      await api.download(`/purchase/rice/ledger/export?${params}`);
      showToast(`Ledger exported as ${format.toUpperCase()}`, "success");
    } catch (error) {
      console.error("Error exporting ledger:", error);
      showToast("Failed to export ledger", "error");
    } finally {
      setLoading(false);
    }
  };

  // Modal handlers
  const handleNewEntry = () => {
    setEditingEntry(null);
    setLedgerItems([createEmptyItem()]);
    setModalOpen(true);
  };

  const handleEditEntry = (entry: RicePaddyPurchaseLedgerEntry) => {
    setEditingEntry(entry);
    setLedgerItems(
      entry.items.map((item) => ({
        godown: item.godown,
        product: item.product,
        size: item.size,
        weight: item.weight,
        quantity: item.quantity,
        netWeight: item.netWeight,
        rate: item.rate,
        totalPrice: item.totalPrice,
      }))
    );
    setModalOpen(true);
  };

  const createEmptyItem = (): LedgerItemFormData => ({
    godown: "",
    product: "",
    size: "",
    weight: 0,
    quantity: 0,
    netWeight: 0,
    rate: 0,
    totalPrice: 0,
  });

  const handleAddItem = () => {
    setLedgerItems([...ledgerItems, createEmptyItem()]);
  };

  const handleRemoveItem = (index: number) => {
    setLedgerItems(ledgerItems.filter((_, i) => i !== index));
  };

  const updateItem = (
    index: number,
    field: keyof LedgerItemFormData,
    value: any
  ) => {
    const newItems = [...ledgerItems];
    newItems[index] = { ...newItems[index], [field]: value };

    // Auto-calculate totalPrice when quantity or rate changes
    if (field === "quantity" || field === "rate") {
      newItems[index].totalPrice =
        newItems[index].quantity * newItems[index].rate;
    }

    setLedgerItems(newItems);
  };

  const handleSaveEntry = async () => {
    // Validate
    if (ledgerItems.length === 0) {
      showToast("Please add at least one item", "error");
      return;
    }

    for (let i = 0; i < ledgerItems.length; i++) {
      const item = ledgerItems[i];
      if (!item.godown || !item.product) {
        showToast(`Please fill all required fields for item ${i + 1}`, "error");
        return;
      }
    }

    setLoading(true);
    try {
      const payload = {
        items: ledgerItems,
      };

      const response = editingEntry
        ? await api.put<ApiResponse<RicePaddyPurchaseLedgerEntry>>(
            `/purchase/rice/ledger/${editingEntry.id}`,
            payload
          )
        : await api.post<ApiResponse<RicePaddyPurchaseLedgerEntry>>(
            "/purchase/rice/ledger",
            payload
          );

      if (response.success) {
        showToast(
          editingEntry
            ? "Entry updated successfully"
            : "Entry created successfully",
          "success"
        );
        await fetchLedger();
        setModalOpen(false);
        setLedgerItems([]);
        setEditingEntry(null);
      }
    } catch (error) {
      console.error("Error saving entry:", error);
      showToast("Failed to save entry", "error");
    } finally {
      setLoading(false);
    }
  };

  const calculateTotals = () => {
    return ledgerItems.reduce(
      (acc, item) => ({
        quantity: acc.quantity + (item.quantity || 0),
        netWeight: acc.netWeight + (item.netWeight || 0),
        totalPrice: acc.totalPrice + (item.totalPrice || 0),
      }),
      { quantity: 0, netWeight: 0, totalPrice: 0 }
    );
  };

  const totals = calculateTotals();

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Rice Purchase Ledger
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            View and track all rice purchase transactions with running balance
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
                  ₦{formatCurrency(openingBalance || 0)}
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
                  ₦{formatCurrency(totalDebit || 0)}
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
                  ₦{formatCurrency(totalCredit || 0)}
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
                  ₦{formatCurrency(closingBalance || 0)}
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
          <Button onClick={handleNewEntry} icon={Plus} size="sm">
            New Entry
          </Button>
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
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Actions
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
                    <>
                      {entry.items.map((item, itemIndex) => (
                        <tr
                          key={`${entry.id}-${itemIndex}`}
                          className="hover:bg-gray-50"
                        >
                          {itemIndex === 0 ? (
                            <>
                              <td
                                rowSpan={entry.items.length}
                                className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 border-r border-gray-200"
                              >
                                {entry.sl}
                              </td>
                              <td
                                rowSpan={entry.items.length}
                                className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 border-r border-gray-200"
                              >
                                {format(new Date(entry.date), "dd-MM-yyyy")}
                              </td>
                              <td
                                rowSpan={entry.items.length}
                                className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 border-r border-gray-200"
                              >
                                {entry.invoiceNo}
                              </td>
                              <td
                                rowSpan={entry.items.length}
                                className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 border-r border-gray-200"
                              >
                                {entry.partyName || entry.partyId}
                              </td>
                            </>
                          ) : null}
                          <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.godown || "-"}
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.product || "-"}
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.size || "-"}
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                            {item.weight ? formatNumber(item.weight, 2) : "-"}
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                            {item.quantity
                              ? formatNumber(item.quantity, 0)
                              : "-"}
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                            {item.netWeight
                              ? formatNumber(item.netWeight, 2)
                              : "-"}
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                            {item.rate ? `₦${formatCurrency(item.rate)}` : "-"}
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                            {item.totalPrice
                              ? `₦${formatCurrency(item.totalPrice)}`
                              : "-"}
                          </td>
                          {itemIndex === 0 ? (
                            <>
                              <td
                                rowSpan={entry.items.length}
                                className="px-3 py-4 whitespace-nowrap text-sm text-red-600 text-right font-medium border-l border-gray-200"
                              >
                                {entry.debit > 0
                                  ? `₦${formatCurrency(entry.debit)}`
                                  : "-"}
                              </td>
                              <td
                                rowSpan={entry.items.length}
                                className="px-3 py-4 whitespace-nowrap text-sm text-green-600 text-right font-medium"
                              >
                                {entry.credit > 0
                                  ? `₦${formatCurrency(entry.credit)}`
                                  : "-"}
                              </td>
                              <td
                                rowSpan={entry.items.length}
                                className={`px-3 py-4 whitespace-nowrap text-sm text-right font-semibold ${
                                  entry.balance > 0
                                    ? "text-red-600"
                                    : entry.balance < 0
                                    ? "text-green-600"
                                    : "text-gray-900"
                                }`}
                              >
                                ₦{formatCurrency(entry.balance)}
                              </td>
                              <td
                                rowSpan={entry.items.length}
                                className="px-3 py-4 whitespace-nowrap text-sm border-l border-gray-200"
                              >
                                <button
                                  onClick={() => handleEditEntry(entry)}
                                  className="text-blue-600 hover:text-blue-900"
                                  title="Edit"
                                >
                                  <Edit className="w-5 h-5" />
                                </button>
                              </td>
                            </>
                          ) : null}
                        </tr>
                      ))}
                    </>
                  ))}
                  {/* Summary Row */}
                  <tr className="bg-gray-100 font-semibold sticky bottom-0">
                    <td
                      colSpan={12}
                      className="px-3 py-4 text-sm text-gray-900"
                    >
                      <span className="font-bold">
                        Total ({filteredData.length} entries)
                      </span>
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-red-600 text-right font-bold">
                      ₦{formatCurrency(totalDebit || 0)}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-green-600 text-right font-bold">
                      ₦{formatCurrency(totalCredit || 0)}
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
                      ₦{formatCurrency(closingBalance || 0)}
                    </td>
                    <td></td>
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

      {/* Modal for Adding/Editing Ledger Entry */}
      <Modal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setLedgerItems([]);
          setEditingEntry(null);
        }}
        title={editingEntry ? "Edit Ledger Entry" : "New Ledger Entry"}
        size="xl"
      >
        <div className="space-y-4">
          {/* Items Table */}
          <div className="border rounded-lg overflow-hidden">
            <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Godown *
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Product *
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Size
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                      Weight
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                      Quantity
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                      Net Weight
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                      Rate
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                      Total Price
                    </th>
                    <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {ledgerItems.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-3 py-2">
                        <select
                          value={item.godown}
                          onChange={(e) =>
                            updateItem(index, "godown", e.target.value)
                          }
                          className="input-base w-full text-sm"
                          required
                        >
                          <option value="">Select Godown</option>
                          {godowns.map((godown) => (
                            <option key={godown.id} value={godown.name}>
                              {godown.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-3 py-2">
                        <select
                          value={item.product}
                          onChange={(e) =>
                            updateItem(index, "product", e.target.value)
                          }
                          className="input-base w-full text-sm"
                          required
                        >
                          <option value="">Select Product</option>
                          {products.map((product) => (
                            <option key={product.id} value={product.name}>
                              {product.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={item.size}
                          onChange={(e) =>
                            updateItem(index, "size", e.target.value)
                          }
                          className="input-base w-full text-sm"
                          placeholder="Size"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          value={item.weight || ""}
                          onChange={(e) =>
                            updateItem(index, "weight", Number(e.target.value))
                          }
                          className="input-base w-full text-sm text-right"
                          placeholder="0"
                          min="0"
                          step="0.01"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          value={item.quantity || ""}
                          onChange={(e) =>
                            updateItem(
                              index,
                              "quantity",
                              Number(e.target.value)
                            )
                          }
                          className="input-base w-full text-sm text-right"
                          placeholder="0"
                          min="0"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          value={item.netWeight || ""}
                          onChange={(e) =>
                            updateItem(
                              index,
                              "netWeight",
                              Number(e.target.value)
                            )
                          }
                          className="input-base w-full text-sm text-right"
                          placeholder="0"
                          min="0"
                          step="0.01"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          value={item.rate || ""}
                          onChange={(e) =>
                            updateItem(index, "rate", Number(e.target.value))
                          }
                          className="input-base w-full text-sm text-right"
                          placeholder="0"
                          min="0"
                          step="0.01"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          value={item.totalPrice || ""}
                          onChange={(e) =>
                            updateItem(
                              index,
                              "totalPrice",
                              Number(e.target.value)
                            )
                          }
                          className="input-base w-full text-sm text-right"
                          placeholder="0"
                          min="0"
                          step="0.01"
                          readOnly
                        />
                      </td>
                      <td className="px-3 py-2 text-center">
                        {ledgerItems.length > 1 && (
                          <button
                            onClick={() => handleRemoveItem(index)}
                            className="text-red-600 hover:text-red-900"
                            type="button"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {/* Totals Row */}
                  <tr className="bg-gray-100 font-semibold">
                    <td colSpan={4} className="px-3 py-2 text-sm text-gray-900">
                      Total
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-900 text-right">
                      {totals.quantity}
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-900 text-right">
                      {totals.netWeight}
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-900 text-right">
                      -
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-900 text-right">
                      ₦{totals.totalPrice.toLocaleString()}
                    </td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Add Item Button */}
          <div className="flex justify-start">
            <Button
              onClick={handleAddItem}
              icon={Plus}
              size="sm"
              variant="outline"
              type="button"
            >
              Add Item
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => {
                setModalOpen(false);
                setLedgerItems([]);
                setEditingEntry(null);
              }}
              type="button"
            >
              Cancel
            </Button>
            <Button onClick={handleSaveEntry} loading={loading} type="button">
              {editingEntry ? "Update" : "Save"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default RicePaddyPurchaseLedger;
