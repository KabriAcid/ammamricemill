import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { RefreshCw } from "lucide-react";
import { DashboardCard } from "../components/DashboardCard";
import { Button } from "../components/ui/Button";
import { DashboardCard as DashboardCardType } from "../types";

// Mock data for development
const mockDashboardData: DashboardCardType[] = [
  {
    id: "total-party",
    title: "Total Party",
    value: 89,
    icon: "users",
    color: "primary",
    link: "/parties",
    description: "Active business partners",
  },
  {
    id: "total-products",
    title: "Total Products",
    value: 23,
    icon: "package",
    color: "success",
    link: "/products",
    description: "Available products",
  },
  {
    id: "total-purchase",
    title: "Total Purchase",
    value: 546673360,
    icon: "shopping-cart",
    color: "danger",
    link: "/purchases",
    description: "All time purchases",
  },
  {
    id: "total-sales",
    title: "Total Sales",
    value: 252522300,
    icon: "trending-up",
    color: "primary",
    link: "/sales",
    description: "All time sales",
  },
  {
    id: "today-purchase",
    title: "Today Purchase",
    value: 0,
    icon: "shopping-cart",
    color: "danger",
    link: "/purchases",
    description: "Today's purchases",
  },
  {
    id: "today-sales",
    title: "Today Sales",
    value: 0,
    icon: "trending-up",
    color: "primary",
    link: "/sales",
    description: "Today's sales",
  },
  {
    id: "today-receive",
    title: "Today Receive",
    value: 0,
    icon: "dollar-sign",
    color: "danger",
    link: "/dailyreport",
    description: "Today's receipts",
  },
  {
    id: "today-payment",
    title: "Today Payment",
    value: 0,
    icon: "dollar-sign",
    color: "primary",
    link: "/dailyreport",
    description: "Today's payments",
  },
  {
    id: "month-receive",
    title: "This Month Receive",
    value: 1285914430,
    icon: "dollar-sign",
    color: "primary",
    link: "/financial-statement",
    description: "Monthly receipts",
  },
  {
    id: "month-payment",
    title: "This Month Payment",
    value: 400118812.86,
    icon: "dollar-sign",
    color: "danger",
    link: "/financial-statement",
    description: "Monthly payments",
  },
  {
    id: "party-due",
    title: "Party Due",
    value: -22025700,
    icon: "alert-circle",
    color: "danger",
    link: "/parties/due",
    description: "Outstanding dues",
  },
  {
    id: "party-debts",
    title: "Party Debts",
    value: 40352000,
    icon: "check-circle",
    color: "success",
    link: "/parties/debts",
    description: "Receivable amounts",
  },
];

export const Dashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardCardType[]>([]);
  const [loading, setLoading] = useState(true);

  // For development, we'll use mock data
  // In production, uncomment the line below and remove the mock data logic
  // const { data, loading, error, refetch } = useFetch<DashboardData>('/api/dashboard');

  useEffect(() => {
    // Simulate API call
    const loadData = async () => {
      setLoading(true);
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setDashboardData(mockDashboardData);
      setLoading(false);
    };

    loadData();
  }, []);

  const handleRefresh = () => {
    setLoading(true);
    // Simulate refresh
    setTimeout(() => {
      setDashboardData([...mockDashboardData]);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb and Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <span>Dashboard</span>
            <span>/</span>
            <span className="text-gray-900">Overview</span>
          </div>

          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              icon={<RefreshCw size={16} />}
              onClick={handleRefresh}
              loading={loading}
            >
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Dashboard Cards Grid */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {loading
          ? Array.from({ length: 12 }).map((_, index) => (
              <DashboardCard
                key={index}
                card={{} as DashboardCardType}
                loading={true}
              />
            ))
          : dashboardData.map((card, index) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <DashboardCard card={card} />
              </motion.div>
            ))}
      </motion.div>

      {/* Additional Info */}
    </div>
  );
};
