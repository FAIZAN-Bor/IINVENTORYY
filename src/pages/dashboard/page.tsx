import { useEffect, useState } from 'react';
import { inventoryItems, recentTransactions } from '../../data/mockData';
import { Link } from 'react-router-dom';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalItems: 0,
    lowStockItems: 0,
    totalValue: 0,
    categories: 6,
  });

  const [salesData, setSalesData] = useState<any[]>([]);

  useEffect(() => {
    // Calculate stats
    const lowStock = inventoryItems.filter(item => item.currentStock <= item.minStock);
    const totalValue = inventoryItems.reduce((sum, item) => sum + (item.currentStock * item.rate), 0);
    
    setStats({
      totalItems: inventoryItems.length,
      lowStockItems: lowStock.length,
      totalValue: totalValue,
      categories: 6,
    });

    // Generate sales data for the chart
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const data = months.map(month => ({
      month,
      sales: Math.floor(Math.random() * 50000) + 30000,
      purchases: Math.floor(Math.random() * 30000) + 15000,
    }));
    setSalesData(data);
  }, []);

  const statCards = [
    {
      title: 'Total Items',
      value: stats.totalItems,
      icon: '📦',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      change: '+12%',
    },
    {
      title: 'Low Stock Items',
      value: stats.lowStockItems,
      icon: '⚠️',
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      change: '-5%',
      alert: true,
    },
    {
      title: 'Total Inventory Value',
      value: `₨${(stats.totalValue / 1000).toFixed(0)}K`,
      icon: '💰',
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      change: '+8%',
    },
    {
      title: 'Categories',
      value: stats.categories,
      icon: '🗂️',
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      change: '0%',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's your inventory overview.</p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/dashboard/sales"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg transition-all"
          >
            New Sale
          </Link>
          <Link
            to="/dashboard/inventory"
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg transition-all"
          >
            Add Item
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className={`${stat.bgColor} rounded-xl shadow-lg p-6 card-hover animate-fadeIn`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center text-2xl shadow-md`}>
                {stat.icon}
              </div>
              <span className={`text-sm font-semibold ${stat.alert ? 'text-orange-600' : 'text-green-600'}`}>
                {stat.change}
              </span>
            </div>
            <h3 className="text-gray-700 text-sm font-semibold mb-1">{stat.title}</h3>
            <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Charts and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Overview */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-100">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Sales Overview</h2>
          <div className="space-y-3">
            {salesData.map((data, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-gray-600 font-semibold w-12">{data.month}</span>
                <div className="flex-1 mx-4">
                  <div className="bg-gray-200 rounded-full h-6 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${(data.sales / 80000) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <span className="text-gray-900 font-bold w-20 text-right">₨{(data.sales / 1000).toFixed(0)}K</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Recent Transactions</h2>
            <Link to="/dashboard/transactions" className="text-blue-600 hover:text-blue-800 font-semibold text-sm transition-colors">
              View All →
            </Link>
          </div>
          <div className="space-y-3">
            {recentTransactions.slice(0, 5).map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    transaction.type === 'sale' ? 'bg-green-100' : 'bg-blue-100'
                  }`}>
                    <span className="text-xl">{transaction.type === 'sale' ? '💰' : '🛒'}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{transaction.customerName}</p>
                    <p className="text-xs text-gray-600 font-medium">{transaction.invoiceNo} • {transaction.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${transaction.type === 'sale' ? 'text-green-600' : 'text-blue-600'}`}>
                    {transaction.type === 'sale' ? '+' : '-'}₨{transaction.amount.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-600 font-medium">{transaction.items} items</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Low Stock Alert */}
      {stats.lowStockItems > 0 && (
        <div className="bg-orange-50 border-l-4 border-orange-500 rounded-lg p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center text-2xl">
                ⚠️
              </div>
              <div>
                <h3 className="text-xl font-bold text-orange-900">Low Stock Alert!</h3>
                <p className="text-orange-700">
                  You have {stats.lowStockItems} items running low on stock. Please reorder soon.
                </p>
              </div>
            </div>
            <Link
              to="/dashboard/low-stock"
              className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg transition-all"
            >
              View Items
            </Link>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: 'Add New Item', icon: '➕', href: '/dashboard/inventory', color: 'blue' },
            { label: 'Create Invoice', icon: '📄', href: '/dashboard/sales', color: 'green' },
            { label: 'View Reports', icon: '📊', href: '/dashboard/reports', color: 'purple' },
            { label: 'Manage Categories', icon: '🗂️', href: '/dashboard/categories', color: 'pink' },
          ].map((action, index) => (
            <Link
              key={index}
              to={action.href}
              className={`bg-${action.color}-50 hover:bg-${action.color}-100 p-4 rounded-lg text-center transition card-hover border border-${action.color}-200`}
            >
              <div className="text-3xl mb-2">{action.icon}</div>
              <p className={`font-semibold text-${action.color}-900`}>{action.label}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
