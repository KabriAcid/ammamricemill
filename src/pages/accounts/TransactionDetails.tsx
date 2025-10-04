import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Printer,
  Calendar,
  FileText,
  User,
  Building2,
  ArrowRight,
  DollarSign,
  Clock,
} from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { useToast } from "../../components/ui/Toast";
import { format } from "date-fns";
import { api } from "../../utils/fetcher";

interface TransactionDetail {
  id: number;
  voucher_number: string;
  date: string;
  type: string;
  amount: number;
  description: string;
  status: string;
  partyName: string;
  partyPhone: string;
  partyAddress: string;
  fromHeadName: string;
  from_head_type: string;
  toHeadName: string;
  to_head_type: string;
  createdByName: string;
  createdByEmail: string;
  created_at: string;
  updated_at: string;
}

const TransactionDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [transaction, setTransaction] = useState<TransactionDetail | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);

  // Fetch transaction details
  const fetchTransactionDetails = async () => {
    if (!id) return;

    setLoading(true);
    try {
      const response = await api.get<{
        success: boolean;
        data: TransactionDetail;
      }>(`/accounts/transactions/${id}`);

      if (response.success && response.data) {
        setTransaction(response.data);
      } else {
        showToast("Transaction not found", "error");
      }
    } catch (error) {
      console.error("Error fetching transaction details:", error);
      showToast("Failed to load transaction details", "error");
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchTransactionDetails();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  // Loading State
  if (initialLoading) {
    return (
      <div className="animate-fade-in">
        <div className="mb-6 flex items-center justify-between">
          <div className="h-10 w-48 bg-gray-200 animate-pulse rounded" />
          <div className="h-10 w-32 bg-gray-200 animate-pulse rounded" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="h-64 bg-gray-200 animate-pulse rounded" />
          <div className="h-64 bg-gray-200 animate-pulse rounded" />
          <div className="h-64 bg-gray-200 animate-pulse rounded" />
        </div>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="animate-fade-in">
        <Card>
          <div className="text-center py-12">
            <p className="text-gray-500">Transaction not found</p>
            <Button
              onClick={() => navigate("/accounts/transactions")}
              className="mt-4"
            >
              Back to Transactions
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const amount =
    typeof transaction.amount === "string"
      ? parseFloat(transaction.amount)
      : transaction.amount;

  const getVoucherTypeColor = (type: string) => {
    switch (type) {
      case "receive":
        return "text-green-600 bg-green-50";
      case "payment":
        return "text-red-600 bg-red-50";
      case "sales_voucher":
        return "text-blue-600 bg-blue-50";
      case "purchase_voucher":
        return "text-purple-600 bg-purple-50";
      case "journal":
        return "text-yellow-600 bg-yellow-50";
      case "contra":
        return "text-gray-600 bg-gray-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getVoucherTypeLabel = (type: string) => {
    switch (type) {
      case "receive":
        return "Receipt";
      case "payment":
        return "Payment";
      case "sales_voucher":
        return "Sales Voucher";
      case "purchase_voucher":
        return "Purchase Voucher";
      case "journal":
        return "Journal Entry";
      case "contra":
        return "Contra Entry";
      default:
        return type;
    }
  };

  return (
    <div className="animate-fade-in print:bg-white">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between print:hidden">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            icon={ArrowLeft}
            onClick={() => navigate("/accounts/transactions")}
          >
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Transaction Details
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Voucher #{transaction.voucher_number}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          icon={Printer}
          onClick={handlePrint}
        >
          Print
        </Button>
      </div>

      {/* Print Header */}
      <div className="hidden print:block mb-8 text-center border-b pb-4">
        <h1 className="text-2xl font-bold">Transaction Voucher</h1>
        <p className="text-sm text-gray-600">#{transaction.voucher_number}</p>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Voucher Information */}
        <Card className="lg:col-span-2">
          <div className="flex items-start justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Voucher Information
            </h2>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${getVoucherTypeColor(
                transaction.type
              )}`}
            >
              {getVoucherTypeLabel(transaction.type)}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Date */}
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Calendar className="text-blue-600" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Date</p>
                <p className="font-medium text-gray-900">
                  {format(new Date(transaction.date), "dd MMMM yyyy")}
                </p>
              </div>
            </div>

            {/* Amount */}
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <DollarSign className="text-green-600" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Amount</p>
                <p className="font-medium text-gray-900 text-xl">
                  ₦
                  {amount.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
            </div>

            {/* From Head */}
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-purple-50 rounded-lg">
                <Building2 className="text-purple-600" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-500">From Account</p>
                <p className="font-medium text-gray-900">
                  {transaction.fromHeadName || "N/A"}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {transaction.from_head_type}
                </p>
              </div>
            </div>

            {/* To Head */}
            {transaction.toHeadName && (
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-orange-50 rounded-lg">
                  <ArrowRight className="text-orange-600" size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">To Account</p>
                  <p className="font-medium text-gray-900">
                    {transaction.toHeadName}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {transaction.to_head_type}
                  </p>
                </div>
              </div>
            )}

            {/* Description */}
            {transaction.description && (
              <div className="md:col-span-2 flex items-start space-x-3">
                <div className="p-2 bg-gray-50 rounded-lg">
                  <FileText className="text-gray-600" size={20} />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500">Description</p>
                  <p className="font-medium text-gray-900">
                    {transaction.description}
                  </p>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Party Information */}
        {transaction.partyName && transaction.partyName !== "N/A" && (
          <Card>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Party Information
            </h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-indigo-50 rounded-lg">
                  <User className="text-indigo-600" size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Party Name</p>
                  <p className="font-medium text-gray-900">
                    {transaction.partyName}
                  </p>
                </div>
              </div>

              {transaction.partyPhone && (
                <div className="pl-11">
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium text-gray-900">
                    {transaction.partyPhone}
                  </p>
                </div>
              )}

              {transaction.partyAddress && (
                <div className="pl-11">
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="font-medium text-gray-900">
                    {transaction.partyAddress}
                  </p>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* System Information */}
        <Card
          className={
            transaction.partyName && transaction.partyName !== "N/A"
              ? ""
              : "lg:col-span-1"
          }
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            System Information
          </h2>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-teal-50 rounded-lg">
                <User className="text-teal-600" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Created By</p>
                <p className="font-medium text-gray-900">
                  {transaction.createdByName || "System"}
                </p>
                {transaction.createdByEmail && (
                  <p className="text-xs text-gray-500">
                    {transaction.createdByEmail}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="p-2 bg-gray-50 rounded-lg">
                <Clock className="text-gray-600" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Created At</p>
                <p className="font-medium text-gray-900">
                  {format(
                    new Date(transaction.created_at),
                    "dd MMM yyyy, hh:mm a"
                  )}
                </p>
              </div>
            </div>

            {transaction.updated_at !== transaction.created_at && (
              <div className="pl-11">
                <p className="text-sm text-gray-500">Last Updated</p>
                <p className="font-medium text-gray-900">
                  {format(
                    new Date(transaction.updated_at),
                    "dd MMM yyyy, hh:mm a"
                  )}
                </p>
              </div>
            )}

            <div className="pl-11">
              <p className="text-sm text-gray-500">Status</p>
              <span
                className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                  transaction.status === "active"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {transaction.status.toUpperCase()}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Print Footer */}
      <div className="hidden print:block mt-12 pt-8 border-t">
        <div className="flex justify-between text-sm text-gray-600">
          <div>
            <p>Authorized Signature: _________________</p>
          </div>
          <div>
            <p>Date: {format(new Date(), "dd/MM/yyyy")}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionDetails;
