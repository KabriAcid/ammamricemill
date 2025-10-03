import React, { useEffect, useState } from "react";
import {
  BarChart3,
  Users,
  Package,
  TrendingUp,
  Factory,
  ShoppingCart,
  DollarSign,
  Archive,
  Clock,
} from "lucide-react";
import { Card } from "../../components/ui/Card";
import { useToast } from "../../components/ui/Toast";
import { EmptyState } from "../../components/ui/EmptyState";
import { api } from "../../utils/fetcher";
import { SkeletonCard, SkeletonChart } from "../../components/ui/Skeleton";
interface StatCard {
  title: string;
  value: string;
  change: string;
  changeType: "positive" | "negative";
  icon: string;
  color: string;
}

interface StatsResponse {
  success: boolean;
  data: StatCard[];
}

interface ActivitiesResponse {
  success: boolean;
  data: Activity[];
}

const iconMap: { [key: string]: React.ReactNode } = {
  revenue: <DollarSign className="w-6 h-6" />,
  employees: <Users className="w-6 h-6" />,
  stock: <Archive className="w-6 h-6" />,
  productions: <Factory className="w-6 h-6" />,
  sales: <ShoppingCart className="w-6 h-6" />,
};

interface Activity {
  id: number;
  action: string;
  time: string;
  type: string;
}

const defaultStats: StatCard[] = [
  {
    title: "Total Revenue",
    value: "₦0",
    change: "",
    changeType: "positive",
    icon: "revenue",
    color: "text-primary-600",
  },
  {
    title: "Active Employees",
    value: "0",
    change: "",
    changeType: "positive",
    icon: "employees",
    color: "text-primary-600",
  },
  {
    title: "Stock Value",
    value: "₦0",
    change: "",
    changeType: "positive",
    icon: "stock",
    color: "text-primary-600",
  },
  {
    title: "Active Productions",
    value: "0",
    change: "",
    changeType: "positive",
    icon: "productions",
    color: "text-primary-600",
  },
  {
    title: "Monthly Sales",
    value: "₦0",
    change: "",
    changeType: "positive",
    icon: "sales",
    color: "text-primary-600",
  },
];

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<StatCard[]>(defaultStats);
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  const { showToast } = useToast();
  const [timeFrame, setTimeFrame] = useState("today");

  useEffect(() => {
    fetchDashboardData();
  }, [timeFrame]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      console.log("Fetching dashboard data...");

      const [statsData, activitiesData] = await Promise.all([
        api.get<StatsResponse>("/dashboard/stats"),
        api.get<ActivitiesResponse>("/dashboard/activities"),
      ]);

      console.log("Stats Data:", statsData);
      console.log("Activities Data:", activitiesData);

      // Since we're using our api utility, successful responses are already validated
      const updatedStats = defaultStats.map((defaultStat) => {
        const receivedStat = statsData.data.find(
          (s: StatCard) => s.title === defaultStat.title
        );
        return receivedStat || defaultStat;
      });

      setStats(updatedStats);
      setRecentActivities(activitiesData.data);
    } catch (error) {
      console.error("Dashboard fetch failed:", error);
      showToast("Failed to load dashboard data. Please try again.", "error");
      setStats(defaultStats);
      setRecentActivities([]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case "stock":
        window.location.href = "/stocks/add";
        break;
      case "attendance":
        window.location.href = "/hr/attendance";
        break;
      case "purchase":
        window.location.href = "/purchases/purchase";
        break;
      case "production":
        window.location.href = "/production/new";
        break;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "sale":
        return <ShoppingCart className="w-4 h-4 text-primary-600" />;
      case "purchase":
        return <Package className="w-4 h-4 text-primary-600" />;
      case "production":
        return <Factory className="w-4 h-4 text-primary-600" />;
      default:
        return <Clock className="w-4 h-4 text-primary-600" />;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Welcome back! Here's what's happening at your rice mill today.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            className="input-base px-3 py-2 rounded-lg border border-gray-300"
            value={timeFrame}
            onChange={(e) => setTimeFrame(e.target.value)}
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
          <button
            onClick={() => fetchDashboardData()}
            className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
            title="Refresh data"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <>
            <SkeletonCard variant="stat" />
            <SkeletonCard variant="stat" />
            <SkeletonCard variant="stat" />
            <SkeletonCard variant="stat" />
            <SkeletonCard variant="stat" />
          </>
        ) : (
          stats.map((stat, index) => (
            <Card key={index} hover className="animate-slide-in">
              <div
                className="flex items-center"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="p-2 rounded-lg text-primary-600 bg-opacity-10">
                  {iconMap[stat.icon]}
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-500">
                    {stat.title}
                  </p>
                  <div className="flex items-baseline">
                    <p className="text-2xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        {loading ? (
          <SkeletonCard variant="action" />
        ) : (
          <Card hover>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleQuickAction("stock")}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Package className="w-6 h-6 text-primary-600 mx-auto mb-2" />
                <p className="text-sm font-medium">Add Stock</p>
              </button>
              <button
                onClick={() => handleQuickAction("attendance")}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Users className="w-6 h-6 text-primary-600 mx-auto mb-2" />
                <p className="text-sm font-medium">Mark Attendance</p>
              </button>
              <button
                onClick={() => handleQuickAction("purchase")}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ShoppingCart className="w-6 h-6 text-primary-600 mx-auto mb-2" />
                <p className="text-sm font-medium">New Purchase</p>
              </button>
              <button
                onClick={() => handleQuickAction("production")}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Factory className="w-6 h-6 text-primary-600 mx-auto mb-2" />
                <p className="text-sm font-medium">Start Production</p>
              </button>
            </div>
          </Card>
        )}

        {/* Recent Activities */}
        {loading ? (
          <SkeletonCard variant="activity" />
        ) : (
          <Card hover>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Recent Activities
            </h3>
            {recentActivities.length === 0 ? (
              <EmptyState message="No recent activities" className="py-8" />
            ) : (
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center space-x-3"
                  >
                    <div className="flex-shrink-0">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{activity.action}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {loading ? (
          <>
            <SkeletonChart />
            <SkeletonChart />
          </>
        ) : (
          <>
            <Card hover>
              <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">
                    Chart visualization would go here
                  </p>
                </div>
              </div>
            </Card>

            <Card hover>
              <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">
                    Production chart would go here
                  </p>
                </div>
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
