import { useState, useEffect } from "react";
import { Card } from "../../components/ui/Card";
import { Table } from "../../components/ui/Table";
import { Button } from "../../components/ui/Button";
import { FilterBar } from "../../components/ui/FilterBar";
import { SkeletonCard } from "../../components/ui/Skeleton";
import { useToast } from "../../components/ui/Toast";
import { api } from "../../utils/fetcher";
import { ApiResponse } from "../../types";
import { formatCurrency } from "../../utils/formatters";
import { 
  Printer, 
  Calculator, 
  ArrowDown, 
  ArrowUp, 
  RefreshCcw,
  Wallet
} from "lucide-react";

// TypeScript Interfaces
interface Transaction {
  id: string;
  sl: number;
  head: string;
  amount: number;
}

interface FinancialStatementData {
  receives: Transaction[];
  payments: Transaction[];
  openingBalance: number;
  closingBalance: number;
}

const FinancialStatement = () => {
  // State Management
  const [receives, setReceives] = useState<Transaction[]>([]);
  const [payments, setPayments] = useState<Transaction[]>([]);
  const [openingBalance, setOpeningBalance] = useState(0);
  const [closingBalance, setClosingBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dateRange, setDateRange] = useState<{
    from: Date | null;
    to: Date | null;
  }>({
    from: new Date(new Date().getFullYear(), 0, 1), // Start of year
    to: new Date(), // Today
  });
  const [search, setSearch] = useState("");

  const { showToast } = useToast();

  // Fetch financial statement data
  const fetchFinancialStatement = async (from?: Date, to?: Date) => {
    setLoading(true);
    try {
      const fromDate = from || dateRange.from || new Date();
      const toDate = to || dateRange.to || new Date();
      
      const formattedFrom = fromDate.toISOString().split('T')[0];
      const formattedTo = toDate.toISOString().split('T')[0];
      
      const response = await api.get<ApiResponse<FinancialStatementData>>(
        `/reports/financial-statement?from=${formattedFrom}&to=${formattedTo}`
      );

      if (response.success && response.data) {
        setReceives(
          response.data.receives.map((item) => ({ 
            ...item, 
            id: String(item.id) 
          }))
        );
        setPayments(
          response.data.payments.map((item) => ({ 
            ...item, 
            id: String(item.id) 
          }))
        );
        setOpeningBalance(response.data.openingBalance || 0);
        setClosingBalance(response.data.closingBalance || 0);
      }
    } catch (error) {
      console.error("Error fetching financial statement:", error);
      showToast("Failed to load financial statement", "error");
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  // Refresh with animation
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchFinancialStatement();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // Initial data load
  useEffect(() => {
    fetchFinancialStatement();
  }, []);

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
      if ((event.ctrlKey || event.metaKey) && event.key === "p") {
        event.preventDefault();
        handlePrint();
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, []);

  // Handle date range change
  const handleDateRangeChange = (start: string, end: string) => {
    const fromDate = start ? new Date(start) : null;
    const toDate = end ? new Date(end) : null;
    
    setDateRange({ from: fromDate, to: toDate });
    
    if (fromDate && toDate) {
      fetchFinancialStatement(fromDate, toDate);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Live search filtering for receives
  const filteredReceives = receives.filter((item) => {
    const query = search.toLowerCase().trim();
    if (!query) return true;

    return (
      item.head?.toLowerCase().includes(query) ||
      String(item.sl).includes(query) ||
      false
    );
  });

  // Live search filtering for payments
  const filteredPayments = payments.filter((item) => {
    const query = search.toLowerCase().trim();
    if (!query) return true;

    return (
      item.head?.toLowerCase().includes(query) ||
      String(item.sl).includes(query) ||
      false
    );
  });

  // Calculate totals from filtered data
  const totalReceives = filteredReceives.reduce(
    (sum, item) => sum + (item.amount || 0),
    0
  );
  const totalPayments = filteredPayments.reduce(
    (sum, item) => sum + (item.amount || 0),
    0
  );
  const netBalance = totalReceives - totalPayments;

  // Table columns
  const receiveColumns = [
    { key: "sl", label: "SL", width: "60px" },
    { key: "head", label: "Head", sortable: true },
    {
      key: "amount",
      label: "Amount",
      render: (value: number) => `₦${formatCurrency(value)}`,
    },
  ];

  const paymentColumns = [
    { key: "sl", label: "SL", width: "60px" },
    { key: "head", label: "Head", sortable: true },
    {
      key: "amount",
      label: "Amount",
      render: (value: number) => `₦${formatCurrency(value)}`,
    },
  ];

  // Format date range for display
  const formatDateRange = () => {
    if (!dateRange.from || !dateRange.to) return "Select date range";
    
    const from = dateRange.from.toLocaleDateString("en-NG", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    const to = dateRange.to.toLocaleDateString("en-NG", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    
    return `${from} - ${to}`;
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Financial Statement
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Comprehensive financial overview for {formatDateRange()}
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {initialLoading ? (
          <>
            <SkeletonCard variant="stat" />
            <SkeletonCard variant="stat" />
            <SkeletonCard variant="stat" />
            <SkeletonCard variant="stat" />
          </>
        ) : (
          <>
            <Card icon={<Wallet className="w-8 h-8 text-blue-600" />} hover>
              <div>
                <p className="text-sm text-gray-500 font-semibold uppercase">
                  Opening Balance
                </p>
                <p className="text-3xl font-bold text-gray-700">
                  ₦{formatCurrency(openingBalance)}
                </p>
              </div>
            </Card>
            <Card
              icon={<ArrowDown className="w-8 h-8 text-green-600" />}
              hover
            >
              <div>
                <p className="text-sm text-gray-500 font-semibold uppercase">
                  Total Receives
                </p>
                <p className="text-3xl font-bold text-gray-700">
                  ₦{formatCurrency(totalReceives)}
                </p>
              </div>
            </Card>
            <Card icon={<ArrowUp className="w-8 h-8 text-red-600" />} hover>
              <div>
                <p className="text-sm text-gray-500 font-semibold uppercase">
                  Total Payments
                </p>
                <p className="text-3xl font-bold text-gray-700">
                  ₦{formatCurrency(totalPayments)}
                </p>
              </div>
            </Card>
            <Card
              icon={<Calculator className="w-8 h-8 text-primary-800" />}
              hover
            >
              <div>
                <p className="text-sm text-gray-500 font-semibold uppercase">
                  Net Balance
                </p>
                <p
                  className={`text-3xl font-bold ${
                    netBalance >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  ₦{formatCurrency(Math.abs(netBalance))}
                  {netBalance < 0 && " DR"}
                </p>
              </div>
            </Card>
          </>
        )}
      </div>

      {/* Filter Bar */}
      <FilterBar
        onSearch={setSearch}
        onDateRange={handleDateRangeChange}
        placeholder="Search by head or SL number... (Ctrl+K)"
      >
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            icon={Printer}
            onClick={handlePrint}
          >
            Print
          </Button>
        </div>
      </FilterBar>

      {/* Receives Table */}
      <div className="space-y-4 mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Receives</h2>
        <Table
          data={filteredReceives}
          columns={receiveColumns}
          loading={initialLoading || loading}
          summaryRow={{
            sl: <span className="font-bold">{filteredReceives.length}</span>,
            head: <span className="font-semibold">Total Receives</span>,
            amount: (
              <span className="font-bold">
                ₦{formatCurrency(totalReceives)}
              </span>
            ),
          }}
        />
      </div>

      {/* Payments Table */}
      <div className="space-y-4 mb-8">
        <h2 className="text-xl font-semibold text-gray-900">Payments</h2>
        <Table
          data={filteredPayments}
          columns={paymentColumns}
          loading={initialLoading || loading}
          summaryRow={{
            sl: <span className="font-bold">{filteredPayments.length}</span>,
            head: <span className="font-semibold">Total Payments</span>,
            amount: (
              <span className="font-bold">
                ₦{formatCurrency(totalPayments)}
              </span>
            ),
          }}
        />
      </div>

      {/* Net Balance Summary */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 uppercase">
              Net Balance (Receives - Payments)
            </p>
            <p
              className={`text-4xl font-bold mt-2 ${
                netBalance >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              ₦{formatCurrency(Math.abs(netBalance))}
              {netBalance < 0 && " (Deficit)"}
            </p>
          </div>
          {netBalance >= 0 ? (
            <ArrowDown className="w-16 h-16 text-green-600 opacity-20" />
          ) : (
            <ArrowUp className="w-16 h-16 text-red-600 opacity-20" />
          )}
        </div>
      </div>
    </div>
  );
};

export default FinancialStatement;