import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ArrowLeft, Printer } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { SkeletonCard } from "../../components/ui/Skeleton";
import { useToast } from "../../components/ui/Toast";
import { api } from "../../utils/fetcher";
import { ApiResponse } from "../../types";

// TypeScript Interfaces
interface SaleItem {
  id: string;
  categoryId: string;
  categoryName?: string;
  productId: string;
  productName?: string;
  productSize?: string;
  godownId: string;
  godownName?: string;
  quantity: number;
  netWeight: number;
  rate: number;
  totalPrice: number;
}

interface Sale {
  id: string;
  invoiceNo: string;
  date: string;
  challanNo: string;
  partyId: string;
  partyName?: string;
  partyAddress?: string;
  partyMobile?: string;
  transportInfo: string;
  driverName?: string;
  driverMobile?: string;
  vehicleNo?: string;
  destination?: string;
  notes: string;
  items: SaleItem[];
  totalQuantity: number;
  totalNetWeight: number;
  invoiceAmount: number;
  discount: number;
  totalAmount: number;
  previousBalance: number;
  netPayable: number;
  paidAmount: number;
  currentBalance: number;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

const SaleDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  // State Management
  const [sale, setSale] = useState<Sale | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch sale details
  const fetchSaleDetails = async () => {
    if (!id) return;

    setLoading(true);
    setError(null);
    try {
      const response = await api.get<ApiResponse<Sale>>(`/sales/${id}`);

      if (response.success && response.data) {
        setSale(response.data);
      } else {
        setError(response.message || "Sale not found");
        showToast("Failed to load sale details", "error");
      }
    } catch (error) {
      console.error("Error fetching sale details:", error);
      setError("Failed to load sale details");
      showToast("Failed to load sale details", "error");
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchSaleDetails();
  }, [id]);

  // Handlers
  const handleBack = () => {
    navigate("/sales");
  };

  const handlePrint = () => {
    window.print();
  };

  // Loading State
  if (initialLoading) {
    return (
      <div className="animate-fade-in max-w-5xl mx-auto p-6">
        <div className="mb-6">
          <SkeletonCard />
        </div>
        <SkeletonCard />
      </div>
    );
  }

  // Error State
  if (error || !sale) {
    return (
      <div className="animate-fade-in max-w-5xl mx-auto p-6">
        <Card>
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {error || "Sale Not Found"}
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              The sale you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={handleBack} icon={ArrowLeft}>
              Back to Sales
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Action Bar - Hidden on Print */}
      <div className="print:hidden bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Button onClick={handleBack} icon={ArrowLeft} variant="outline">
            Back to Sales
          </Button>
          <Button onClick={handlePrint} icon={Printer}>
            Print Invoice
          </Button>
        </div>
      </div>

      {/* Invoice Content */}
      <div className="max-w-5xl mx-auto p-6 print:p-8">
        <div className="bg-white shadow-lg print:shadow-none border print:border-2 print:border-black">
          {/* Company Header */}
          <div className="border-b-2 border-gray-900 px-8 py-6 print:py-4">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 print:text-4xl">
                AMMAM RICE MILL LTD.
              </h1>
              <p className="text-sm text-gray-600 mt-1 print:text-xs">
                RICE PROCESSING MILL
              </p>
              <p className="text-xs text-gray-500 mt-1 print:text-xs">
                No 2A Lambu, Gwarzo Road, Tofa Local Government Area, Kano State
                - Nigeria
              </p>
              <p className="text-xs text-gray-500">
                +2349031740606, 2349123507947
              </p>
            </div>
            <div className="mt-4 text-center">
              <h2 className="text-xl font-semibold text-gray-700 uppercase tracking-wide">
                Way Bill
              </h2>
            </div>
          </div>

          {/* Invoice & Customer Information */}
          <div className="grid grid-cols-2 border-b border-gray-300 print:border-black">
            {/* Left - Invoice Details */}
            <div className="px-8 py-6 border-r border-gray-300 print:border-black print:py-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase">
                Invoice Information
              </h3>
              <dl className="space-y-2">
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-600">Invoice No:</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {sale.invoiceNo}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-600">Challan No:</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {sale.challanNo}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-600">Date:</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {format(new Date(sale.date), "dd-MM-yyyy")}
                  </dd>
                </div>
                {sale.createdBy && (
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-600">Created By:</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {sale.createdBy}
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Right - Customer Details */}
            <div className="px-8 py-6 print:py-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase">
                Customer Information
              </h3>
              <dl className="space-y-2">
                <div>
                  <dt className="text-xs text-gray-500">Customer:</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {sale.partyName || sale.partyId}
                  </dd>
                </div>
                {sale.partyAddress && (
                  <div>
                    <dt className="text-xs text-gray-500">Address:</dt>
                    <dd className="text-sm text-gray-900">
                      {sale.partyAddress}
                    </dd>
                  </div>
                )}
                {sale.partyMobile && (
                  <div>
                    <dt className="text-xs text-gray-500">Mobile:</dt>
                    <dd className="text-sm text-gray-900">
                      {sale.partyMobile}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </div>

          {/* Items Table */}
          <div className="px-8 py-6 border-b border-gray-300 print:border-black print:py-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase">
              Description of Goods
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-300 print:border-black">
                <thead className="bg-gray-50 print:bg-gray-100">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase border-r border-gray-300 print:border-black">
                      #
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase border-r border-gray-300 print:border-black">
                      Description of Goods
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase border-r border-gray-300 print:border-black">
                      Size
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700 uppercase border-r border-gray-300 print:border-black">
                      Quantity
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700 uppercase border-r border-gray-300 print:border-black">
                      Weight (Kg)
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700 uppercase border-r border-gray-300 print:border-black">
                      Rate
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700 uppercase">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 print:divide-black">
                  {sale.items.map((item, index) => (
                    <tr key={item.id}>
                      <td className="px-3 py-3 text-sm text-gray-900 border-r border-gray-200 print:border-black">
                        {index + 1}
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-900 border-r border-gray-200 print:border-black">
                        {item.productName || item.productId}
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-900 border-r border-gray-200 print:border-black">
                        {item.productSize || "-"}
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-900 text-right border-r border-gray-200 print:border-black">
                        {item.quantity.toLocaleString()}
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-900 text-right border-r border-gray-200 print:border-black">
                        {item.netWeight.toLocaleString()}
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-900 text-right border-r border-gray-200 print:border-black">
                        ₦{item.rate.toLocaleString()}
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-900 text-right">
                        ₦{item.totalPrice.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  {/* Totals Row */}
                  <tr className="bg-gray-50 print:bg-gray-100 font-semibold">
                    <td
                      colSpan={3}
                      className="px-3 py-3 text-sm text-gray-900 border-r border-gray-300 print:border-black"
                    >
                      Total
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-900 text-right border-r border-gray-300 print:border-black">
                      {sale.totalQuantity.toLocaleString()}
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-900 text-right border-r border-gray-300 print:border-black">
                      {sale.totalNetWeight.toLocaleString()}
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-900 text-right border-r border-gray-300 print:border-black">
                      -
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-900 text-right">
                      ₦{sale.invoiceAmount.toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Transporter Information */}
          <div className="px-8 py-6 border-b border-gray-300 print:border-black print:py-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase">
              Transporter Information
            </h3>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <dt className="text-xs text-gray-500 mb-1">Driver Name</dt>
                <dd className="text-sm font-medium text-gray-900 border-b border-gray-300 pb-2">
                  {sale.driverName || "-"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500 mb-1">Driver No</dt>
                <dd className="text-sm font-medium text-gray-900 border-b border-gray-300 pb-2">
                  {sale.driverMobile || "-"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500 mb-1">Vehicle No</dt>
                <dd className="text-sm font-medium text-gray-900 border-b border-gray-300 pb-2">
                  {sale.vehicleNo || sale.transportInfo}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500 mb-1">Destination Name</dt>
                <dd className="text-sm font-medium text-gray-900 border-b border-gray-300 pb-2">
                  {sale.destination || "-"}
                </dd>
              </div>
            </div>
          </div>

          {/* Financial Summary */}
          <div className="px-8 py-6 border-b border-gray-300 print:border-black print:py-4">
            <div className="max-w-md ml-auto">
              <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase">
                Payment Summary
              </h3>
              <dl className="space-y-2">
                <div className="flex justify-between py-1">
                  <dt className="text-sm text-gray-600">Invoice Amount:</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    ₦{sale.invoiceAmount.toLocaleString()}
                  </dd>
                </div>
                <div className="flex justify-between py-1">
                  <dt className="text-sm text-gray-600">Discount:</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    ₦{sale.discount.toLocaleString()}
                  </dd>
                </div>
                <div className="flex justify-between py-2 border-t border-gray-300">
                  <dt className="text-sm font-semibold text-gray-700">
                    Total Amount:
                  </dt>
                  <dd className="text-sm font-bold text-gray-900">
                    ₦{sale.totalAmount.toLocaleString()}
                  </dd>
                </div>
                <div className="flex justify-between py-1">
                  <dt className="text-sm text-gray-600">Previous Balance:</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    ₦{sale.previousBalance.toLocaleString()}
                  </dd>
                </div>
                <div className="flex justify-between py-2 border-t border-gray-300">
                  <dt className="text-sm font-semibold text-gray-700">
                    Net Payable:
                  </dt>
                  <dd className="text-sm font-bold text-gray-900">
                    ₦{sale.netPayable.toLocaleString()}
                  </dd>
                </div>
                <div className="flex justify-between py-1">
                  <dt className="text-sm text-gray-600">Paid Amount:</dt>
                  <dd className="text-sm font-medium text-primary-600">
                    ₦{sale.paidAmount.toLocaleString()}
                  </dd>
                </div>
                <div className="flex justify-between py-2 border-t-2 border-gray-900">
                  <dt className="text-base font-bold text-gray-900">
                    Current Balance:
                  </dt>
                  <dd
                    className={`text-base font-bold ${
                      sale.currentBalance > 0
                        ? "text-red-600"
                        : "text-green-600"
                    }`}
                  >
                    ₦{sale.currentBalance.toLocaleString()}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Notes */}
          {sale.notes && (
            <div className="px-8 py-4 border-b border-gray-300 print:border-black bg-gray-50 print:bg-transparent">
              <p className="text-xs text-gray-600">
                <span className="font-semibold">Notes: </span>
                {sale.notes}
              </p>
            </div>
          )}

          {/* Signature Section */}
          <div className="px-8 py-8 print:py-12">
            <div className="grid grid-cols-2 gap-16">
              <div>
                <div className="h-20 border-b-2 border-dashed border-gray-400 print:border-black"></div>
                <p className="mt-2 text-center text-sm text-gray-600 font-medium">
                  Customer Signature
                </p>
              </div>
              <div>
                <div className="h-20 border-b-2 border-dashed border-gray-400 print:border-black"></div>
                <p className="mt-2 text-center text-sm text-gray-600 font-medium">
                  Authorized Seal and Signature
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Print Footer */}
        <div className="mt-4 text-center text-xs text-gray-500 print:hidden">
          <p>Generated on {format(new Date(), "dd/MM/yyyy HH:mm")}</p>
        </div>
      </div>
    </div>
  );
};

export default SaleDetails;
