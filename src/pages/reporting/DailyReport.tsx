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
  Calendar, 
  ArrowDown, 
  ArrowUp, 
  RefreshCcw,
  Wallet
} from "lucide-react";

// TypeScript Interfaces
interface Transaction {
  id: string;
  sl: number;
  party: string;
  fromHead: string;
  toHead: string;
  description: string;
  amount: number;
}

interface DailyReportData {
  receives: Transaction[];
  payments: Transaction[];
  openingBalance: number;
}

const DailyReport = () => {
  // State Management
  const [receives, setReceives] = useState<Transaction[]>([]);
  const [payments, setPayments] = useState<Transaction[]>([]);
  const [openingBalance, setOpeningBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [search, setSearch] = useState("");

  const { showToast } = useToast();

  // Fetch daily report data
  const fetchDailyReport = async (date?: Date) => {
    setLoading(true);
    try {
      const dateParam = date || selectedDate;
      const formattedDate = dateParam.toISOString().split('T')[0];
      
      const response = await api.get<ApiResponse<DailyReportData>>(
        `/reports/daily?date=${formattedDate}`
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
      }
    } catch (error) {
      console.error("Error fetching daily report:", error);
      showToast("Failed to load daily report", "error");
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  // Refresh with animation
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchDailyReport();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // Initial data load
  useEffect(() => {
    fetchDailyReport();
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

  // Handle date change
  const handleDateChange = (start: string, end: string) => {
    if (start) {
      const newDate = new Date(start);
      setSelectedDate(newDate);
      fetchDailyReport(newDate);
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
      item.party?.toLowerCase().includes(query) ||
      item.fromHead?.toLowerCase().includes(query) ||
      item.toHead?.toLowerCase().includes(query) ||
      item.description?.toLowerCase().includes(query) ||
      false
    );
  });

  // Live search filtering for payments
  const filteredPayments = payments.filter((item) => {
    const query = search.toLowerCase().trim();
    if (!query) return true;

    return (
      item.party?.toLowerCase().includes(query) ||
      item.fromHead?.toLowerCase().includes(query) ||
      item.toHead?.toLowerCase().includes(query) ||
      item.description?.toLowerCase().includes(query) ||
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
  const closingBalance = openingBalance + totalReceives - totalPayments;

  // Table columns
  const receiveColumns = [
    { key: "sl", label: "SL", width: "60px" },
    { key: "party", label: "Party", sortable: true },
    { key: "fromHead", label: "From Head", sortable: true },
    { key: "toHead", label: "To Head", sortable: true },
    { key: "description", label: "Description" },
    {
      key: "amount",
      label: "Amount",
      render: (value: number) => `₦${formatCurrency(value)}`,
    },
  ];

  const paymentColumns = [
    { key: "sl", label: "SL", width: "60px" },
    { key: "party", label: "Party", sortable: true },
    { key: "fromHead", label: "From Head", sortable: true },
    { key: "toHead", label: "To Head", sortable: true },
    { key: "description", label: "Description" },
    {
      key: "amount",
      label: "Amount",
      render: (value: number) => `₦${formatCurrency(value)}`,
    },
  ];

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Daily Report</h1>
          <p className="mt-1 text-sm text-gray-500">
            Daily financial transactions report for{" "}
            {selectedDate.toLocaleDateString("en-NG", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
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
              icon={<Calendar className="w-8 h-8 text-primary-800" />}
              hover
            >
              <div>
                <p className="text-sm text-gray-500 font-semibold uppercase">
                  Closing Balance
                </p>
                <p className="text-3xl font-bold text-gray-700">
                  ₦{formatCurrency(closingBalance)}
                </p>
              </div>
            </Card>
          </>
        )}
      </div>

      {/* Filter Bar */}
      <FilterBar
        onSearch={setSearch}
        onDateRange={handleDateChange}
        placeholder="Search by party, head, description... (Ctrl+K)"
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
            party: <span className="font-semibold">Total</span>,
            fromHead: "",
            toHead: "",
            description: "",
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
            party: <span className="font-semibold">Total</span>,
            fromHead: "",
            toHead: "",
            description: "",
            amount: (
              <span className="font-bold">
                ₦{formatCurrency(totalPayments)}
              </span>
            ),
          }}
        />
      </div>

      {/* Signature Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-12 pt-8 border-t print:block">
        <div className="text-center">
          <div className="border-t border-black mt-16 pt-2">
            <p className="font-semibold">Accountant</p>
          </div>
        </div>
        <div className="text-center">
          <div className="border-t border-black mt-16 pt-2">
            <p className="font-semibold">Manager</p>
          </div>
        </div>
        <div className="text-center">
          <div className="border-t border-black mt-16 pt-2">
            <p className="font-semibold">Director</p>
          </div>
        </div>
        <div className="text-center">
          <div className="border-t border-black mt-16 pt-2">
            <p className="font-semibold">Managing Director</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyReport;