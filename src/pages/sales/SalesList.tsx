import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Sale } from "../../types/sales";
import { Table } from "../../components/ui/Table";
import { Button } from "../../components/ui/Button";
import { Plus } from "lucide-react";
import { SaleFormModal } from "./SaleFormModal";

const SalesList: React.FC = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [selectedSales, setSelectedSales] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const navigate = useNavigate();

  // Fetch sales
  useEffect(() => {
    const fetchSales = async () => {
      setLoading(true);
      try {
        // TODO: Replace with actual API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
        // Mock data
        const mockSales: Sale[] = [
          {
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
          },
        ];
        setSales(mockSales);
      } catch (error) {
        console.error("Error fetching sales:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSales();
  }, []);

  // Filtering logic
  const filteredSales = sales.filter((sale) => {
    const matchesSearch = sale.invoiceNo
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesDateRange =
      (!dateRange.from || sale.date >= dateRange.from) &&
      (!dateRange.to || sale.date <= dateRange.to);
    return matchesSearch && matchesDateRange;
  });

  // Pagination
  const totalPages = Math.ceil(filteredSales.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedSales = filteredSales.slice(startIndex, startIndex + pageSize);

  // Calculate summary statistics
  const stats = {
    totalSales: sales.length,
    totalQuantity: sales.reduce((sum, s) => sum + s.totalQuantity, 0),
    totalAmount: sales.reduce((sum, s) => sum + s.totalAmount, 0),
    totalBalance: sales.reduce((sum, s) => sum + s.currentBalance, 0),
  };

  // Table columns
  const columns = [
    { key: "id", label: "#", width: "80px" },
    {
      key: "date",
      label: "Date",
      render: (value: string) => format(new Date(value), "dd/MM/yyyy"),
    },
    { key: "invoiceNo", label: "Invoice No", sortable: true },
    { key: "partyId", label: "Party", sortable: true },
    {
      key: "totalQuantity",
      label: "Quantity (Bags)",
      render: (value: number) => value.toLocaleString(),
    },
    {
      key: "totalNetWeight",
      label: "Net Weight (Kg)",
      render: (value: number) => value.toLocaleString(),
    },
    {
      key: "totalAmount",
      label: "Total",
      render: (value: number) => `₦${value.toLocaleString()}`,
    },
    {
      key: "paidAmount",
      label: "Paid",
      render: (value: number) => `₦${value.toLocaleString()}`,
    },
    {
      key: "currentBalance",
      label: "Balance",
      render: (value: number) => `₦${value.toLocaleString()}`,
    },
  ];

  // Action handlers
  const handleDelete = async (saleIds: string[]) => {
    if (
      window.confirm(
        `Are you sure you want to delete ${saleIds.length} sale(s)?`
      )
    ) {
      setLoading(true);
      try {
        // TODO: Replace with actual API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setSales((prev) => prev.filter((sale) => !saleIds.includes(sale.id)));
        setSelectedSales([]);
      } catch (error) {
        console.error("Error deleting sales:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleView = (sale: Sale) => {
    navigate(`/sales/${sale.id}`);
  };

  const handleEdit = (sale: Sale) => {
    setSelectedSale(sale);
    setIsModalOpen(true);
  };

  const handleSave = async (data: Partial<Sale>) => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (selectedSale) {
        // Update existing sale
        setSales((prev) =>
          prev.map((sale) =>
            sale.id === selectedSale.id ? { ...sale, ...data } : sale
          )
        );
      } else {
        // Add new sale
        const newSale: Sale = {
          ...(data as Sale),
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setSales((prev) => [...prev, newSale]);
      }

      setIsModalOpen(false);
      setSelectedSale(null);
    } catch (error) {
      console.error("Error saving sale:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Sales Management</h1>
        <p className="mt-2 text-sm text-gray-700">
          Manage and track all sales transactions
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Sales</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {stats.totalSales}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Quantity</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {stats.totalQuantity.toLocaleString()} Bags
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Amount</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            ₦{stats.totalAmount.toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Balance</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            ₦{stats.totalBalance.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="mb-6">
        <Button
          onClick={() => {
            setSelectedSale(null);
            setIsModalOpen(true);
          }}
          icon={Plus}
        >
          New Sale
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
        data={paginatedSales}
        columns={columns}
        loading={loading}
        pagination={{
          currentPage,
          totalPages,
          pageSize,
          totalItems: filteredSales.length,
          onPageChange: setCurrentPage,
          onPageSizeChange: setPageSize,
        }}
        selection={{
          selectedItems: selectedSales,
          onSelectionChange: setSelectedSales,
        }}
        actions={{
          onView: handleView,
          onEdit: handleEdit,
          onDelete: handleDelete,
        }}
      />

      {/* Sale Form Modal */}
      <SaleFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedSale(null);
        }}
        onSave={handleSave}
        item={selectedSale}
      />
    </div>
  );
};

export default SalesList;
