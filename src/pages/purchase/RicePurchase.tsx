import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Purchase } from "../../types/purchase";
import { Table } from "../../components/ui/Table";

const RicePurchase: React.FC = () => {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [selectedPurchases, setSelectedPurchases] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Fetch rice purchases
  useEffect(() => {
    const fetchRicePurchases = async () => {
      setLoading(true);
      try {
        // TODO: Replace with actual API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
        // Mock data
        const mockPurchases: Purchase[] = [
          {
            id: "RICE-001",
            invoiceNo: "RICE-PUR-001",
            date: "2024-01-15",
            challanNo: "RCH-001",
            partyId: "PARTY-001",
            transportInfo: "Truck ABC-123",
            notes: "Rice purchase",
            items: [
              {
                id: "ITEM-001",
                categoryId: "RICE-CAT-001",
                productId: "RICE-001",
                godownId: "GD-001",
                quantity: 100,
                netWeight: 5000,
                rate: 50,
                totalPrice: 5000,
              },
            ],
            totalQuantity: 100,
            totalNetWeight: 5000,
            invoiceAmount: 5000,
            discount: 100,
            totalAmount: 4900,
            previousBalance: 1000,
            netPayable: 5900,
            paidAmount: 4000,
            currentBalance: 1900,
            createdAt: "2024-01-15T10:00:00Z",
            updatedAt: "2024-01-15T10:00:00Z",
          },
        ];
        setPurchases(mockPurchases);
      } catch (error) {
        console.error("Error fetching rice purchases:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRicePurchases();
  }, []);

  // Filtering logic
  const filteredPurchases = purchases.filter((purchase) => {
    const matchesSearch = purchase.invoiceNo
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesDateRange =
      (!dateRange.from || purchase.date >= dateRange.from) &&
      (!dateRange.to || purchase.date <= dateRange.to);
    return matchesSearch && matchesDateRange;
  });

  // Pagination
  const totalPages = Math.ceil(filteredPurchases.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedPurchases = filteredPurchases.slice(
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
  const handleDelete = async (purchaseIds: string[]) => {
    if (
      confirm(
        `Are you sure you want to delete ${purchaseIds.length} rice purchase(s)?`
      )
    ) {
      setLoading(true);
      try {
        // TODO: Replace with actual API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setPurchases((prev) =>
          prev.filter((purchase) => !purchaseIds.includes(purchase.id))
        );
        setSelectedPurchases([]);
      } catch (error) {
        console.error("Error deleting rice purchases:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleView = (purchase: Purchase) => {
    navigate(`/purchase/rice-purchase/${purchase.id}`);
  };

  // Calculate summary statistics
  const stats = {
    totalPurchases: purchases.length,
    totalQuantity: purchases.reduce((sum, p) => sum + p.totalQuantity, 0),
    totalAmount: purchases.reduce((sum, p) => sum + p.totalAmount, 0),
    totalBalance: purchases.reduce((sum, p) => sum + p.currentBalance, 0),
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Rice Purchase Management
        </h1>
        <p className="mt-2 text-sm text-gray-700">
          Manage and track all rice purchases
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Purchases</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {stats.totalPurchases}
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
        data={paginatedPurchases}
        columns={columns}
        loading={loading}
        pagination={{
          currentPage,
          totalPages,
          pageSize,
          totalItems: filteredPurchases.length,
          onPageChange: setCurrentPage,
          onPageSizeChange: setPageSize,
        }}
        selection={{
          selectedItems: selectedPurchases,
          onSelectionChange: setSelectedPurchases,
        }}
        actions={{
          onView: handleView,
          onDelete: handleDelete,
        }}
      />
    </div>
  );
};

export default RicePurchase;
