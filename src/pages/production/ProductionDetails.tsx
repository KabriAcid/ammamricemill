import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Printer } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { format } from "date-fns";

interface ProductionItem {
  id: string;
  categoryId: string;
  categoryName?: string;
  productId: string;
  productName?: string;
  godownId: string;
  godownName?: string;
  siloId: string;
  siloName?: string;
  quantity: number;
  netWeight: number;
}

interface Production {
  id: string;
  invoiceNo: string;
  date: string;
  description?: string;
  items: ProductionItem[];
  totalQuantity: number;
  totalWeight: number;
  createdAt: string;
  updatedAt: string;
}

const ProductionDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [production, setProduction] = useState<Production | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduction = async () => {
      setLoading(true);
      try {
        // TODO: API endpoint - GET /api/production/production-order/:id
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setProduction({
          id: "1",
          invoiceNo: "PROD-001",
          date: "2024-01-15",
          description: "Regular production batch",
          items: [
            {
              id: "1",
              categoryId: "CAT-001",
              categoryName: "Rice Category",
              productId: "PROD-001",
              productName: "Basmati Rice",
              godownId: "GD-001",
              godownName: "Main Godown",
              siloId: "SILO-001",
              siloName: "Silo A",
              quantity: 100,
              netWeight: 5000,
            },
          ],
          totalQuantity: 100,
          totalWeight: 5000,
          createdAt: "2024-01-15T10:00:00Z",
          updatedAt: "2024-01-15T10:00:00Z",
        });
      } catch (error) {
        console.error("Error fetching production:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduction();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!production) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Production not found</div>
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
        <h1 className="text-2xl font-bold text-gray-900">Amam Rice Mill</h1>
        <p className="text-sm text-gray-500">123 Rice Mill Road, City</p>
        <p className="text-sm text-gray-500">Phone: (123) 456-7890</p>
        <h2 className="text-xl font-semibold text-gray-700 mt-4">Production Order</h2>
      </div>

      {/* Production Details */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <p className="text-sm">
            <span className="font-medium">Invoice No:</span>{" "}
            {production.invoiceNo}
          </p>
          <p className="text-sm">
            <span className="font-medium">Date:</span>{" "}
            {format(new Date(production.date), "dd/MM/yyyy")}
          </p>
        </div>
        <div>
          {production.description && (
            <p className="text-sm">
              <span className="font-medium">Description:</span>{" "}
              {production.description}
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
                Category
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Godown
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Silo
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quantity (Bag)
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Weight (Kg)
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {production.items.map((item, index) => (
              <tr key={item.id}>
                <td className="px-3 py-2 text-sm">{index + 1}</td>
                <td className="px-3 py-2 text-sm">{item.categoryName}</td>
                <td className="px-3 py-2 text-sm">{item.productName}</td>
                <td className="px-3 py-2 text-sm">{item.godownName}</td>
                <td className="px-3 py-2 text-sm">{item.siloName}</td>
                <td className="px-3 py-2 text-sm">
                  {item.quantity.toLocaleString()}
                </td>
                <td className="px-3 py-2 text-sm">
                  {item.netWeight.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-gray-50">
              <td colSpan={5} className="px-3 py-2 text-sm font-medium">
                Total
              </td>
              <td className="px-3 py-2 text-sm font-medium">
                {production.totalQuantity.toLocaleString()}
              </td>
              <td className="px-3 py-2 text-sm font-medium">
                {production.totalWeight.toLocaleString()}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Authorized Seal and Signature Section */}
      <div className="mt-16 pt-8 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-8">
          <div className="text-center">
            <div className="h-24 flex items-center justify-center mb-2">
              <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center">
                <span className="text-xs text-gray-400">Seal</span>
              </div>
            </div>
            <div className="border-t border-gray-300 w-48 mx-auto pt-2">
              <p className="text-sm text-gray-500">Authorized Seal</p>
            </div>
          </div>
          <div className="text-center">
            <div className="h-24 mb-2"></div>
            <div className="border-t border-gray-300 w-48 mx-auto pt-2">
              <p className="text-sm text-gray-500">Authorized Signature</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductionDetails;