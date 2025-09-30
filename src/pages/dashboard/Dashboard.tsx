import React from 'react';
import { BarChart3, Users, Package, TrendingUp, DollarSign, Factory, Warehouse, ShoppingCart } from 'lucide-react';
import { Card } from '../../components/ui/Card';

interface StatCard {
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative';
  icon: React.ReactNode;
  color: string;
}

const Dashboard: React.FC = () => {
  const stats: StatCard[] = [
    {
      title: 'Total Revenue',
      value: '₹2,45,000',
      change: '+12.5%',
      changeType: 'positive',
      icon: <DollarSign className="w-6 h-6" />,
      color: 'text-green-600'
    },
    {
      title: 'Total Employees',
      value: '45',
      change: '+2',
      changeType: 'positive',
      icon: <Users className="w-6 h-6" />,
      color: 'text-blue-600'
    },
    {
      title: 'Products in Stock',
      value: '1,234',
      change: '-5.2%',
      changeType: 'negative',
      icon: <Package className="w-6 h-6" />,
      color: 'text-purple-600'
    },
    {
      title: 'Active Productions',
      value: '8',
      change: '+3',
      changeType: 'positive',
      icon: <Factory className="w-6 h-6" />,
      color: 'text-orange-600'
    },
    {
      title: 'Monthly Sales',
      value: '₹1,85,000',
      change: '+8.1%',
      changeType: 'positive',
      icon: <ShoppingCart className="w-6 h-6" />,
      color: 'text-primary-600'
    },
    {
      title: 'Warehouse Capacity',
      value: '85%',
      change: '+12%',
      changeType: 'positive',
      icon: <Warehouse className="w-6 h-6" />,
      color: 'text-secondary-600'
    }
  ];

  const recentActivities = [
    { id: 1, action: 'New purchase order created', time: '2 hours ago', type: 'purchase' },
    { id: 2, action: 'Production batch completed', time: '4 hours ago', type: 'production' },
    { id: 3, action: 'Employee attendance marked', time: '6 hours ago', type: 'hr' },
    { id: 4, action: 'Stock updated for Rice Premium', time: '8 hours ago', type: 'stock' },
    { id: 5, action: 'Payment received from Party ABC', time: '1 day ago', type: 'payment' }
  ];

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
          <Card key={index} hover className="animate-slide-in" style={{ animationDelay: `${index * 0.1}s` }}>
            <div className="flex items-center">
              <div className={`p-2 rounded-lg ${stat.color} bg-opacity-10`}>
                <div className={stat.color}>
                  {stat.icon}
                </div>
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                <div className="flex items-center">
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <span className={`ml-2 text-sm font-medium ${
                    stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                  }`}>
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
        <Card title="Quick Actions" hover>
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
        <Card title="Recent Activities" hover>
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
        <Card title="Monthly Revenue Trend" hover>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Chart visualization would go here</p>
            </div>
          </div>
        </Card>

        <Card title="Production Overview" hover>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Production chart would go here</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;