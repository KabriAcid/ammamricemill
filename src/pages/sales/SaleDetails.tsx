import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { format } from "date-fns";
import type { Sale } from "../../types/sales";

const SaleDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [sale, setSale] = useState<Sale | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSaleDetails = async () => {
      setLoading(true);
      try {
        // TODO: Replace with actual API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
        // Mock data
        const mockSale: Sale = {
          id: "1",
          invoiceNo: "SALE-001",
          date: "2024-01-15",
          challanNo: "CH-001",
          partyId: "PARTY-001",
          transportInfo: "Truck ABC-123",
          notes: "Regular sale",
          items: [
            {
              id: "ITEM-001",
              categoryId: "CAT-001",
              productId: "PROD-001",
              godownId: "GD-001",
              quantity: 100,
              netWeight: 5000,
              rate: 55,
              totalPrice: 5500,
            },
          ],
          totalQuantity: 100,
          totalNetWeight: 5000,
          invoiceAmount: 5500,
          discount: 100,
          totalAmount: 5400,
          previousBalance: 1000,
          netPayable: 6400,
          paidAmount: 5000,
          currentBalance: 1400,
          createdAt: "2024-01-15T10:00:00Z",
          updatedAt: "2024-01-15T10:00:00Z",
        };
        setSale(mockSale);
      } catch (error) {
        console.error("Error fetching sale details:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchSaleDetails();
    }
  }, [id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!sale) {
    return <div>Sale not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        {/* Header */}
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-2xl font-bold leading-6 text-gray-900">
                Sale Invoice #{sale.invoiceNo}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Date: {format(new Date(sale.date), "dd/MM/yyyy")}
              </p>
            </div>
            <button
              onClick={() => window.print()}
              className="print:hidden px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Print
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Details */}
            <div>
              <dl className="grid grid-cols-1 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Party ID
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">{sale.partyId}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Challan No
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {sale.challanNo}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Transport Info
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {sale.transportInfo}
                  </dd>
                </div>
                {sale.notes && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Notes</dt>
                    <dd className="mt-1 text-sm text-gray-900">{sale.notes}</dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Summary */}
            <div className="space-y-4">
              <dl className="grid grid-cols-2 gap-2">
                <dt className="text-sm font-medium text-gray-500">
                  Invoice Amount:
                </dt>
                <dd className="text-sm text-gray-900">
                  ₹{sale.invoiceAmount.toLocaleString()}
                </dd>

                <dt className="text-sm font-medium text-gray-500">Discount:</dt>
                <dd className="text-sm text-gray-900">
                  ₹{sale.discount.toLocaleString()}
                </dd>

                <dt className="text-sm font-medium text-gray-500">
                  Total Amount:
                </dt>
                <dd className="text-sm text-gray-900">
                  ₹{sale.totalAmount.toLocaleString()}
                </dd>

                <dt className="text-sm font-medium text-gray-500">
                  Previous Balance:
                </dt>
                <dd className="text-sm text-gray-900">
                  ₹{sale.previousBalance.toLocaleString()}
                </dd>

                <dt className="text-sm font-medium text-gray-500">
                  Net Payable:
                </dt>
                <dd className="text-sm text-gray-900">
                  ₹{sale.netPayable.toLocaleString()}
                </dd>

                <dt className="text-sm font-medium text-gray-500">
                  Paid Amount:
                </dt>
                <dd className="text-sm text-gray-900">
                  ₹{sale.paidAmount.toLocaleString()}
                </dd>

                <dt className="text-sm font-medium text-gray-500">
                  Current Balance:
                </dt>
                <dd className="text-sm text-gray-900">
                  ₹{sale.currentBalance.toLocaleString()}
                </dd>
              </dl>
            </div>
          </div>

          {/* Items Table */}
          <div className="mt-8 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Godown
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity (Bag)
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Net Weight (Kg)
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rate
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Price
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sale.items.map((item, index) => (
                  <tr key={item.id || index}>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.categoryId}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.productId}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.godownId}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.quantity.toLocaleString()}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.netWeight.toLocaleString()}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{item.rate.toLocaleString()}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{item.totalPrice.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Signature Section */}
          <div className="mt-12 grid grid-cols-2 gap-8 print:mt-20">
            <div>
              <div className="h-20 border-b border-gray-300"></div>
              <p className="mt-2 text-sm text-gray-500 text-center">
                Customer Signature
              </p>
            </div>
            <div>
              <div className="h-20 border-b border-gray-300"></div>
              <p className="mt-2 text-sm text-gray-500 text-center">
                Authorized Signature
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SaleDetails;
