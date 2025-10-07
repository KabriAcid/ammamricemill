import React, { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import { Printer } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Purchase } from "../../types/purchase";
import { format } from "date-fns";
import { api } from "../../utils/fetcher";
import { ApiResponse } from "../../types";
import { formatCurrency, formatNumber } from "../../utils/formatters";

const PurchaseDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const [purchase, setPurchase] = useState<Purchase | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPurchase = async () => {
      if (!id) return;
      setLoading(true);
      try {
        // Choose endpoint based on current path (rice vs paddy)
        const isRice = location.pathname.includes("rice");
        const endpoint = isRice
          ? `/purchase/rice/${id}`
          : `/purchase/paddy/${id}`;

        const response = await api.get<ApiResponse<Purchase>>(endpoint);
        if (response.success && response.data) {
          setPurchase(response.data);
        } else {
          setPurchase(null);
        }
      } catch (error) {
        console.error("Error fetching purchase:", error);
        setPurchase(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPurchase();
  }, [id, location.pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!purchase) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Purchase not found</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-sm rounded-lg print:shadow-none">
      {/* Print Button */}
      <div className="print:hidden mb-6">
        <Button
          variant="outline"
          size="sm"
          icon={Printer}
          onClick={() => window.print()}
        >
          Print
        </Button>
      </div>

      {/* Company Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Ammam Rice Mill</h1>
        <p className="text-sm text-gray-500">123 Rice Mill Road, City</p>
        <p className="text-sm text-gray-500">Phone: (123) 456-7890</p>
      </div>

      {/* Purchase Details */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <p className="text-sm">
            <span className="font-medium">Invoice No:</span>{" "}
            {purchase.invoiceNo}
          </p>
          <p className="text-sm">
            <span className="font-medium">Date:</span>{" "}
            {format(new Date(purchase.date), "dd/MM/yyyy")}
          </p>
          {purchase.challanNo && (
            <p className="text-sm">
              <span className="font-medium">Challan No:</span>{" "}
              {purchase.challanNo}
            </p>
          )}
        </div>
        <div>
          <p className="text-sm">
            <span className="font-medium">Party:</span> {purchase.partyName}
          </p>
          {purchase.transportInfo && (
            <p className="text-sm">
              <span className="font-medium">Transport Info:</span>{" "}
              {purchase.transportInfo}
            </p>
          )}
        </div>
      </div>

      {/* Products Table */}
      <div className="mb-6">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                #
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quantity (Bag)
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Net Weight (Kg)
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rate
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Price
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {purchase.items.map((item, index) => (
              <tr key={item.id}>
                <td className="px-3 py-2 text-sm">{index + 1}</td>
                <td className="px-3 py-2 text-sm">
                  {(item as any).productName || "Product"}
                </td>
                <td className="px-3 py-2 text-sm">
                  {formatNumber(item.quantity || 0, 0)}
                </td>
                <td className="px-3 py-2 text-sm">
                  {formatNumber(item.netWeight || 0, 2)}
                </td>
                <td className="px-3 py-2 text-sm">
                  ₦{formatCurrency(item.rate || 0)}
                </td>
                <td className="px-3 py-2 text-sm">
                  ₦{formatCurrency(item.totalPrice || 0)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={2} className="px-3 py-2 text-sm font-medium">
                Total
              </td>
              <td className="px-3 py-2 text-sm font-medium">
                {formatNumber(purchase.totalQuantity || 0, 0)}
              </td>
              <td className="px-3 py-2 text-sm font-medium">
                {formatNumber(purchase.totalNetWeight || 0, 2)}
              </td>
              <td className="px-3 py-2"></td>
              <td className="px-3 py-2 text-sm font-medium">
                ₦{formatCurrency(purchase.invoiceAmount || 0)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div></div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Invoice Amount:</span>
            <span>₦{formatCurrency(purchase.invoiceAmount || 0)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Discount:</span>
            <span>₦{formatCurrency(purchase.discount || 0)}</span>
          </div>
          <div className="flex justify-between text-sm font-medium">
            <span>Total Amount:</span>
            <span>₦{formatCurrency(purchase.totalAmount || 0)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Previous Balance:</span>
            <span>₦{formatCurrency(purchase.previousBalance || 0)}</span>
          </div>
          <div className="flex justify-between text-sm font-medium">
            <span>Net Payable:</span>
            <span>₦{formatCurrency(purchase.netPayable || 0)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Paid Amount:</span>
            <span>₦{formatCurrency(purchase.paidAmount || 0)}</span>
          </div>
          <div className="flex justify-between text-sm font-medium">
            <span>Current Balance:</span>
            <span>₦{formatCurrency(purchase.currentBalance || 0)}</span>
          </div>
        </div>
      </div>

      {/* Notes */}
      {purchase.notes && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Notes</h3>
          <p className="text-sm text-gray-600">{purchase.notes}</p>
        </div>
      )}

      {/* Signature Section */}
      <div className="grid grid-cols-2 gap-4 mt-12">
        <div className="text-center">
          <div className="border-t border-gray-300 w-48 mx-auto mt-8 pt-2">
            <p className="text-sm text-gray-500">Authorized Signature</p>
          </div>
        </div>
        <div className="text-center">
          <div className="border-t border-gray-300 w-48 mx-auto mt-8 pt-2">
            <p className="text-sm text-gray-500">Party Signature</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseDetails;
