import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Trash2,
  Printer,
  Factory,
  PackageCheck,
  Scale,
  Activity,
} from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Table } from "../../components/ui/Table";
import { FilterBar } from "../../components/ui/FilterBar";
import { format } from "date-fns";
import { formatCurrency } from "../../utils/formatters";
import { ProductionFormModal } from "../stocks/ProductionStockForm";
import { api } from "../../utils/fetcher";
import type { Production, ProductionItem } from "../../types/production";

const ProductionList: React.FC = () => {
  // State management
  const [productions, setProductions] = useState<Production[]>([]);
  const [selectedProductions, setSelectedProductions] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Production | null>(null);
  const navigate = useNavigate();

  // Fetch productions function
  const fetchProductions = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get<{
        success: boolean;
        data: Production[];
        message: string;
      }>(
        `/api/production/production-order?page=${currentPage}&pageSize=${pageSize}` +
          `${searchQuery ? `&search=${searchQuery}` : ""}` +
          `${dateRange.from ? `&fromDate=${dateRange.from}` : ""}` +
          `${dateRange.to ? `&toDate=${dateRange.to}` : ""}`
      );
      if (response.success && response.data) {
        setProductions(response.data);
      }
    } catch (error) {
      console.error("Error fetching productions:", error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, searchQuery, dateRange]);

  // Fetch productions on mount and when dependencies change
  useEffect(() => {
    fetchProductions();
  }, [fetchProductions]);

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
    { key: "siloInfo", label: "Silo Info", sortable: true },
    {
      key: "items",
      label: "Items",
      render: (items: Production["items"]) => items.length,
    },
    {
      key: "totalQuantity",
      label: "Quantity",
      render: (value: number) => formatCurrency(value),
    },
    {
      key: "totalWeight",
      label: "Weight (Kg)",
      render: (value: number) => `${formatCurrency(value)} Kg`,
    },
  ];

  // Action handlers
  const handleDelete = async (productionIds: string[]) => {
    if (
      confirm(
        `Are you sure you want to delete ${productionIds.length} production(s)?`
      )
    ) {
      setLoading(true);
      try {
        // TODO: API endpoint - DELETE /api/production/production-order
        // Body: { ids: productionIds }
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
    navigate(`/production/production-order/${production.id}`);
  };

  // Calculate summary statistics
  const stats = {
    totalProductions: productions.length,
    totalQuantity: productions.reduce((sum, p) => sum + p.totalQuantity, 0),
    totalWeight: productions.reduce((sum, p) => sum + p.totalWeight, 0),
    activeProductions: productions.filter((p) => p.status === "active").length,
  };

  const loadingCards = loading && !productions.length;

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Production Management
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage production orders and track production progress.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card icon={<Factory size={32} />} loading={loadingCards} hover>
          <div>
            <p className="text-3xl font-bold text-gray-700">
              {stats.totalProductions}
            </p>
            <p className="text-sm text-gray-500">Total Productions</p>
          </div>
        </Card>
        <Card icon={<PackageCheck size={32} />} loading={loadingCards} hover>
          <div>
            <p className="text-3xl font-bold text-gray-700">
              {formatCurrency(stats.totalQuantity)}
            </p>
            <p className="text-sm text-gray-500">Total Quantity</p>
          </div>
        </Card>
        <Card icon={<Scale size={32} />} loading={loadingCards} hover>
          <div>
            <p className="text-3xl font-bold text-gray-700">
              {formatCurrency(stats.totalWeight)} Kg
            </p>
            <p className="text-sm text-gray-500">Total Weight</p>
          </div>
        </Card>
        <Card icon={<Activity size={32} />} loading={loadingCards} hover>
          <div>
            <p className="text-3xl font-bold text-gray-700">
              {stats.activeProductions}
            </p>
            <p className="text-sm text-gray-500">Active Productions</p>
          </div>
        </Card>
      </div>

      {/* Filter Bar */}
      <FilterBar
        onSearch={setSearchQuery}
        placeholder="Search by invoice number..."
      >
        <div className="flex items-center space-x-2">
          <input
            type="date"
            value={dateRange.from}
            onChange={(e) =>
              setDateRange((prev) => ({ ...prev, from: e.target.value }))
            }
            className="input-base h-9"
          />
          <input
            type="date"
            value={dateRange.to}
            onChange={(e) =>
              setDateRange((prev) => ({ ...prev, to: e.target.value }))
            }
            className="input-base h-9"
          />
          <Button
            onClick={() => {
              setEditItem(null);
              setModalOpen(true);
            }}
            icon={Plus}
            size="sm"
          >
            New Production
          </Button>
          {selectedProductions.length > 0 && (
            <Button
              variant="danger"
              size="sm"
              icon={Trash2}
              onClick={() => handleDelete(selectedProductions)}
              loading={loading}
            >
              Delete ({selectedProductions.length})
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            icon={Printer}
            onClick={() => window.print()}
          >
            Print
          </Button>
        </div>
      </FilterBar>

      {/* Production Form Modal */}
      <ProductionFormModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditItem(null);
        }}
        onSave={async (data) => {
          setLoading(true);
          try {
            if (editItem) {
              // TODO: API call to update production
              await api.put(
                `/api/production/production-order/${editItem.id}`,
                data
              );
            } else {
              // TODO: API call to create production
              await api.post("/api/production/production-order", data);
            }
            await fetchProductions();
            setModalOpen(false);
            setEditItem(null);
          } catch (error) {
            console.error("Error saving production:", error);
          } finally {
            setLoading(false);
          }
        }}
        item={editItem}
      />

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
          onPageSizeChange: (size) => {
            setPageSize(size);
            setCurrentPage(1);
          },
        }}
        selection={{
          selectedItems: selectedProductions,
          onSelectionChange: setSelectedProductions,
        }}
        actions={{
          onView: handleView,
        }}
      />
    </div>
  );
};

export default ProductionList;
