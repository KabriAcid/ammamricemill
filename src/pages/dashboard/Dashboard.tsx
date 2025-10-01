import React, { useEffect, useState } from "react";
import {
  BarChart3,
  Users,
  Package,
  TrendingUp,
  Factory,
  ShoppingCart,
} from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Spinner } from "../../components/ui/Spinner";

interface StatCard {
  title: string;
  value: string;
  change: string;
  changeType: "positive" | "negative";
  icon: React.ReactNode;
  color: string;
}

interface Activity {
  id: number;
  action: string;
  time: string;
  type: string;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<StatCard[]>([]);
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const statsRes = await fetch(
          "http://localhost:5000/api/dashboard/stats",
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const statsJson = await statsRes.json();

        const activitiesRes = await fetch(
          "http://localhost:5000/api/dashboard/activities",
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const activitiesJson = await activitiesRes.json();

        setStats(statsJson?.data ?? []);
        setRecentActivities(activitiesJson?.data ?? []);
      } catch (err) {
        console.error("Dashboard fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [token]);

  if (loading) {
    return <p className="text-gray-500"><Spinner /></p>;
  }

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
          <select className="input-base">
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} hover className="animate-slide-in">
            <div
              className="flex items-center"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`p-2 rounded-lg ${stat.color} bg-opacity-10`}>
                <div className={stat.color}>{stat.icon}</div>
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-500">
                  {stat.title}
                </p>
                <div className="flex items-center">
                  <p className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                  <span
                    className={`ml-2 text-sm font-medium ${
                      stat.changeType === "positive"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {stat.change}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <Card hover>
          <div className="grid grid-cols-2 gap-4">
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Package className="w-6 h-6 text-primary-600 mx-auto mb-2" />
              <p className="text-sm font-medium">Add Stock</p>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Users className="w-6 h-6 text-primary-600 mx-auto mb-2" />
              <p className="text-sm font-medium">Mark Attendance</p>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <ShoppingCart className="w-6 h-6 text-primary-600 mx-auto mb-2" />
              <p className="text-sm font-medium">New Purchase</p>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Factory className="w-6 h-6 text-primary-600 mx-auto mb-2" />
              <p className="text-sm font-medium">Start Production</p>
            </button>
          </div>
        </Card>

        {/* Recent Activities */}
        <Card hover>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{activity.action}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
      </div>
    </div>
  );
};

export default Dashboard;
