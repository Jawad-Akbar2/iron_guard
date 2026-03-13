import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { reportAPI } from '../services/api.js';
import { SkeletonLoader } from '../components/SkeletonLoader.jsx';
import { formatCurrency, formatDateTime } from '../utils/dateFormatter.js';
import toast from 'react-hot-toast';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export const DashboardPage = () => {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  // Fetch KPIs
  const { data: kpisData, isLoading: kpisLoading } = useQuery({
    queryKey: ['dashboard-kpis', dateRange],
    queryFn: () => reportAPI.getDashboardKPIs(dateRange),
    staleTime: 5 * 60 * 1000
  });

  // Fetch Daily Report
  const { data: dailyData, isLoading: dailyLoading } = useQuery({
    queryKey: ['daily-report', dateRange],
    queryFn: () => reportAPI.getDailyReport(dateRange),
    staleTime: 5 * 60 * 1000
  });

  const kpis = kpisData?.data?.summary?.[0] || {};
  const topItems = kpisData?.data?.topItems || [];
  const topCustomers = kpisData?.data?.topCustomers || [];
  const dailyStats = dailyData?.data || [];

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <div className="flex gap-2">
          <input
            type="date"
            value={dateRange.startDate}
            onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          />
          <input
            type="date"
            value={dateRange.endDate}
            onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard
          label="Total Sales"
          value={formatCurrency(kpis.totalSales || 0)}
          color="blue"
          loading={kpisLoading}
        />
        <KPICard
          label="Total Purchases"
          value={formatCurrency(kpis.totalPurchases || 0)}
          color="orange"
          loading={kpisLoading}
        />
        <KPICard
          label="Total Payments"
          value={formatCurrency(kpis.totalPayments || 0)}
          color="green"
          loading={kpisLoading}
        />
        <KPICard
          label="Total Profit"
          value={formatCurrency(kpis.totalProfit || 0)}
          color="purple"
          loading={kpisLoading}
        />
        <KPICard
          label="Discounts"
          value={formatCurrency(kpis.totalDiscount || 0)}
          color="red"
          loading={kpisLoading}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Sales Chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Daily Sales & Purchases</h2>
          {dailyLoading ? (
            <SkeletonLoader rows={3} />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dailyStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="totalSales" fill="#3b82f6" name="Sales" />
                <Bar dataKey="totalPurchases" fill="#f59e0b" name="Purchases" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Top Items Chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Selling Items</h2>
          {kpisLoading ? (
            <SkeletonLoader rows={3} />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topItems} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="_id" width={100} />
                <Tooltip />
                <Bar dataKey="quantity" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Top Customers */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Customers</h2>
        {kpisLoading ? (
          <SkeletonLoader rows={5} columns={3} />
        ) : (
          <div className="space-y-2">
            {topCustomers.map((customer, idx) => (
              <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span className="font-medium text-gray-900">{customer._id}</span>
                <span className="text-blue-600">{formatCurrency(customer.totalAmount)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const KPICard = ({ label, value, color, loading }) => {
  const colorClass = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    orange: 'bg-orange-50 text-orange-600 border-orange-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    red: 'bg-red-50 text-red-600 border-red-200'
  }[color];

  return (
    <div className={`border rounded-lg p-4 ${colorClass}`}>
      <p className="text-sm font-medium opacity-80">{label}</p>
      <p className="text-2xl font-bold mt-2">{loading ? '...' : value}</p>
    </div>
  );
};