import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ArrowLeft, Edit, Printer } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Production } from "../../types/production";
import { ProductionFormModal } from "./ProductionFormModal";

const ProductionDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [production, setProduction] = useState<Production | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchProduction = async () => {
      setLoading(true);
      try {
        // TODO: Replace with actual API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
        // Mock data
        const mockProduction: Production = {
          id: id || "1",
          invoiceNo: "PROD-001",
          date: "2024-01-15",
          description: "Rice production batch",
          siloInfo: "Silo 1, 2",
          items: [
            {
              id: "ITEM-001",
              categoryId: "CAT-001",
              productId: "PROD-001",
              godownId: "GD-001",
              siloId: "SILO-001",
              quantity: 100,
              netWeight: 5000,
            },
          ],
          totalQuantity: 100,
          totalWeight: 5000,
          createdAt: "2024-01-15T10:00:00Z",
          updatedAt: "2024-01-15T10:00:00Z",
        };
        setProduction(mockProduction);
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

  const handleSave = async (data: Partial<Production>) => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setProduction((prev) => ({ ...prev!, ...data }));
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error updating production:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!production) {
    return <div>Production not found</div>;
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <Button
            onClick={() => navigate("/productions")}
            variant="ghost"
            icon={ArrowLeft}
          >
            Back to Productions
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 mt-4">
            Production Details
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            View and manage production information
          </p>
        </div>

        <div className="flex gap-4">
          <Button
            onClick={() => setIsModalOpen(true)}
            variant="outline"
            icon={Edit}
          >
            Edit
          </Button>
          <Button onClick={handlePrint} icon={Printer}>
            Print
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {/* Basic Details */}
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-medium text-gray-500">Invoice No</p>
              <p className="mt-1">{production.invoiceNo}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Date</p>
              <p className="mt-1">
                {format(new Date(production.date), "dd/MM/yyyy")}
              </p>
            </div>
            <div className="col-span-2">
              <p className="text-sm font-medium text-gray-500">Description</p>
              <p className="mt-1">{production.description || "-"}</p>
            </div>
            <div className="col-span-2">
              <p className="text-sm font-medium text-gray-500">
                Silo Information
              </p>
              <p className="mt-1">{production.siloInfo || "-"}</p>
            </div>
          </div>
        </div>

        {/* Production Items */}
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Production Items</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Godown
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Silo
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity (Bags)
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Net Weight (Kg)
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {production.items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.categoryId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.productId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.godownId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.siloId}
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      {item.quantity.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      {item.netWeight.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-4 text-sm font-medium text-gray-900 text-right"
                  >
                    Total
                  </td>
                  <td className="px-6 py-4 text-right whitespace-nowrap font-medium">
                    {production.totalQuantity.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right whitespace-nowrap font-medium">
                    {production.totalWeight.toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Meta Information */}
        <div className="bg-gray-50 px-6 py-4">
          <div className="text-sm text-gray-500">
            <p>
              Created:{" "}
              {format(new Date(production.createdAt), "dd/MM/yyyy HH:mm")}
            </p>
            <p>
              Last Updated:{" "}
              {format(new Date(production.updatedAt), "dd/MM/yyyy HH:mm")}
            </p>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <ProductionFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        item={production}
      />
    </div>
  );
};

export default ProductionDetails;
