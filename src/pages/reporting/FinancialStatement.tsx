import { useState } from "react";
import { Card } from "../../components/ui/Card";
import { Table } from "../../components/ui/Table";
import { Button } from "../../components/ui/Button";
import { FilterBar } from "../../components/ui/FilterBar";
import { Printer, Calculator, ArrowDown, ArrowUp } from "lucide-react";

interface Transaction {
  id: string;
  sl: number;
  head: string;
  amount: number;
}

export default function FinancialStatement() {
  const [dateRange, setDateRange] = useState<{
    from: Date | null;
    to: Date | null;
  }>({
    from: null,
    to: null,
  });
  const [loading, setLoading] = useState(false);
  const [receives, setReceives] = useState<Transaction[]>([]);
  const [payments, setPayments] = useState<Transaction[]>([]);
  const [openingBalance, setOpeningBalance] = useState(0);

  const receiveColumns = [
    { key: "sl", label: "SL" },
    { key: "head", label: "Head" },
    {
      key: "amount",
      label: "Amount",
      render: (value: number) =>
        value.toLocaleString("en-IN", {
          style: "currency",
          currency: "INR",
        }),
    },
  ];

  const paymentColumns = [
    { key: "sl", label: "SL" },
    { key: "head", label: "Head" },
    {
      key: "amount",
      label: "Amount",
      render: (value: number) =>
        value.toLocaleString("en-IN", {
          style: "currency",
          currency: "INR",
        }),
    },
  ];

  const totalReceives = receives.reduce((sum, item) => sum + item.amount, 0);
  const totalPayments = payments.reduce((sum, item) => sum + item.amount, 0);

  const handleDateRangeChange = (start: string, end: string) => {
    setDateRange({
      from: start ? new Date(start) : null,
      to: end ? new Date(end) : null,
    });
    // TODO: Fetch data for the selected date range
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Financial Statement</h1>
        <div className="flex items-center gap-4">
          <FilterBar
            onSearch={() => {
              /* TODO: Implement search */
            }}
            onDateRange={handleDateRangeChange}
            placeholder="Search transactions..."
          />
          <Button
            variant="outline"
            icon={Printer}
            onClick={handlePrint}
            aria-label="Print financial statement"
          >
            Print
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card icon={<Calculator className="w-8 h-8 text-primary-800" />}>
          <div>
            <p className="text-sm text-gray-500 font-semibold uppercase">
              Opening Balance
            </p>
            <p className="text-2xl font-bold text-gray-900">
              {openingBalance.toLocaleString("en-IN", {
                style: "currency",
                currency: "INR",
              })}
            </p>
          </div>
        </Card>
        <Card icon={<ArrowDown className="w-8 h-8 text-green-600" />}>
          <div>
            <p className="text-sm text-gray-500 font-semibold uppercase">
              Total Receives
            </p>
            <p className="text-2xl font-bold text-gray-900">
              {totalReceives.toLocaleString("en-IN", {
                style: "currency",
                currency: "INR",
              })}
            </p>
          </div>
        </Card>
        <Card icon={<ArrowUp className="w-8 h-8 text-red-600" />}>
          <div>
            <p className="text-sm text-gray-500 font-semibold uppercase">
              Total Payments
            </p>
            <p className="text-2xl font-bold text-gray-900">
              {totalPayments.toLocaleString("en-IN", {
                style: "currency",
                currency: "INR",
              })}
            </p>
          </div>
        </Card>
      </div>

      {/* Receives Table */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Receives</h2>
        <Table
          data={receives}
          columns={receiveColumns}
          loading={loading}
          summaryRow={{
            sl: "Total",
            amount: totalReceives,
          }}
        />
      </div>

      {/* Payments Table */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Payments</h2>
        <Table
          data={payments}
          columns={paymentColumns}
          loading={loading}
          summaryRow={{
            sl: "Total",
            amount: totalPayments,
          }}
        />
      </div>
    </div>
  );
}
