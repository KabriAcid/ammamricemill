import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Plus } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Table } from "../../components/ui/Table";
import { Production } from "../../types/production";
import { ProductionFormModal } from "./ProductionFormModal";

const ProductionList: React.FC = () => {
  const [productions, setProductions] = useState<Production[]>([]);
  const [selectedProductions, setSelectedProductions] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduction, setSelectedProduction] =
    useState<Production | null>(null);
  const navigate = useNavigate();

  // Fetch productions
  useEffect(() => {
    const fetchProductions = async () => {
      setLoading(true);
      try {
        // TODO: Replace with actual API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
        // Mock data
        const mockProductions: Production[] = [
          {
            id: "1",
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
          },
        ];
        setProductions(mockProductions);
      } catch (error) {
        console.error("Error fetching productions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductions();
  }, []);

  // Calculate summary statistics
  const stats = {
    totalProductions: productions.length,
    totalQuantity: productions.reduce((sum, p) => sum + p.totalQuantity, 0),
    totalWeight: productions.reduce((sum, p) => sum + p.totalWeight, 0),
  };

  // Filtering logic
  const filteredProductions = productions.filter((production) => {
    const matchesSearch = production.invoiceNo
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesDateRange =
      (!dateRange.from || production.date >= dateRange.from) &&
      (!dateRange.to || production.date <= dateRange.to);
    return matchesSearch && matchesDateRange;
  });

  // Pagination
  const totalPages = Math.ceil(filteredProductions.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedProductions = filteredProductions.slice(
    startIndex,
    startIndex + pageSize
  );

  // Table columns
  const columns = [
    { key: "id", label: "#", width: "80px" },
    {
      key: "date",
      label: "Date",
      render: (value: string) => format(new Date(value), "dd/MM/yyyy"),
    },
    { key: "invoiceNo", label: "Invoice No", sortable: true },
    { key: "siloInfo", label: "Silo Info" },
    {
      key: "items",
      label: "Items",
      render: (value: any[]) => value.length,
    },
    {
      key: "totalQuantity",
      label: "Quantity (Bags)",
      render: (value: number) => value.toLocaleString(),
    },
    {
      key: "totalWeight",
      label: "Weight (Kg)",
      render: (value: number) => value.toLocaleString(),
    },
  ];

  // Action handlers
  const handleDelete = async (productionIds: string[]) => {
    if (
      window.confirm(
        `Are you sure you want to delete ${productionIds.length} production(s)?`
      )
    ) {
      setLoading(true);
      try {
        // TODO: Replace with actual API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setProductions((prev) =>
          prev.filter((production) => !productionIds.includes(production.id))
        );
        setSelectedProductions([]);
      } catch (error) {
        console.error("Error deleting productions:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleView = (production: Production) => {
    navigate(`/productions/${production.id}`);
  };

  const handleEdit = (production: Production) => {
    setSelectedProduction(production);
    setIsModalOpen(true);
  };

  const handleSave = async (data: Partial<Production>) => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (selectedProduction) {
        // Update existing production
        setProductions((prev) =>
          prev.map((production) =>
            production.id === selectedProduction.id
              ? { ...production, ...data }
              : production
          )
        );
      } else {
        // Add new production
        const newProduction: Production = {
          id: Date.now().toString(),
          ...(data as Production),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setProductions((prev) => [...prev, newProduction]);
      }

      setIsModalOpen(false);
      setSelectedProduction(null);
    } catch (error) {
      console.error("Error saving production:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Production Management
        </h1>
        <p className="mt-2 text-sm text-gray-700">
          Manage and track all production orders
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">
            Total Productions
          </h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {stats.totalProductions}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Quantity</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {stats.totalQuantity.toLocaleString()} Bags
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Weight</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {stats.totalWeight.toLocaleString()} Kg
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="mb-6">
        <Button
          onClick={() => {
            setSelectedProduction(null);
            setIsModalOpen(true);
          }}
          icon={Plus}
        >
          New Production
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <input
              type="text"
              placeholder="Search by invoice no..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-base w-full"
            />
          </div>
          <div>
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, from: e.target.value }))
              }
              className="input-base w-full"
            />
          </div>
          <div>
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, to: e.target.value }))
              }
              className="input-base w-full"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <Table
        data={paginatedProductions}
        columns={columns}
        loading={loading}
        pagination={{
          currentPage,
          totalPages,
          pageSize,
          totalItems: filteredProductions.length,
          onPageChange: setCurrentPage,
          onPageSizeChange: setPageSize,
        }}
        selection={{
          selectedItems: selectedProductions,
          onSelectionChange: setSelectedProductions,
        }}
        actions={{
          onView: handleView,
          onEdit: handleEdit,
          onDelete: handleDelete,
        }}
      />

      {/* Production Form Modal */}
      <ProductionFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedProduction(null);
        }}
        onSave={handleSave}
        item={selectedProduction}
      />
    </div>
  );
};

export default ProductionList;
