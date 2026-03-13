import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { reportAPI } from '../services/api.js';
import { SkeletonLoader } from '../components/SkeletonLoader.jsx';
import { formatCurrency, formatDateTime } from '../utils/dateFormatter.js';
import toast from 'react-hot-toast';
import { Download } from 'lucide-react';

export const ReportsPage = () => {
  const [filters, setFilters] = useState({
    startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  const { data: reportsData, isLoading } = useQuery({
    queryKey: ['aggregated-reports', filters],
    queryFn: () => reportAPI.getAggregatedReports(filters),
    staleTime: 5 * 60 * 1000
  });

  const reports = reportsData?.data || [];

  const totalSales = reports.reduce((sum, r) => sum + (r.totalSales || 0), 0);
  const totalPurchases = reports.reduce((sum, r) => sum + (r.totalPurchases || 0), 0);
  const totalPayments = reports.reduce((sum, r) => sum + (r.totalPayments || 0), 0);
  const totalProfit = reports.reduce((sum, r) => sum + (r.totalProfit || 0), 0);

  const handleExportCSV = () => {
    if (reports.length === 0) {
      toast.error('No data to export');
      return;
    }

    const csv = [
      ['Entity/Type', 'Total Sales', 'Total Purchases', 'Total Payments', 'Remaining Balance', 'Total Profit', 'Transactions'],
      ...reports.map(report => [
        report._id,
        formatCurrency(report.totalSales || 0),
        formatCurrency(report.totalPurchases || 0),
        formatCurrency(report.totalPayments || 0),
        formatCurrency(report.remainingBalance || 0),
        formatCurrency(report.totalProfit || 0),
        report.transactionCount || 0
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reports-${Date.now()}.csv`;
    a.click();
    toast.success('Report exported');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
        >
          <Download size={18} />
          Export CSV
        </button>
      </div>

      {/* Date Filters */}
      <div className="bg-white p-4 rounded-lg shadow flex gap-2">
        <input
          type="date"
          value={filters.startDate}
          onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
          className="px-4 py-2 border border-gray-300 rounded-lg"
        />
        <input
          type="date"
          value={filters.endDate}
          onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
          className="px-4 py-2 border border-gray-300 rounded-lg"
        />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-700">Total Sales</p>
          <p className="text-2xl font-bold text-blue-900">{isLoading ? '...' : formatCurrency(totalSales)}</p>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-4">
          <p className="text-sm text-orange-700">Total Purchases</p>
          <p className="text-2xl font-bold text-orange-900">{isLoading ? '...' : formatCurrency(totalPurchases)}</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-700">Total Payments</p>
          <p className="text-2xl font-bold text-green-900">{isLoading ? '...' : formatCurrency(totalPayments)}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-4">
          <p className="text-sm text-purple-700">Total Profit</p>
          <p className="text-2xl font-bold text-purple-900">{isLoading ? '...' : formatCurrency(totalProfit)}</p>
        </div>
      </div>

      {/* Details Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="p-6">
            <SkeletonLoader rows={5} columns={7} />
          </div>
        ) : reports.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No data available</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Entity/Type</th>
                <th className="px-6 py-3 text-right text-sm font-medium text-gray-700">Total Sales</th>
                <th className="px-6 py-3 text-right text-sm font-medium text-gray-700">Total Purchases</th>
                <th className="px-6 py-3 text-right text-sm font-medium text-gray-700">Total Payments</th>
                <th className="px-6 py-3 text-right text-sm font-medium text-gray-700">Remaining Balance</th>
                <th className="px-6 py-3 text-right text-sm font-medium text-gray-700">Total Profit</th>
                <th className="px-6 py-3 text-center text-sm font-medium text-gray-700">Transactions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {reports.map((report, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900 font-medium">{report._id}</td>
                  <td className="px-6 py-4 text-sm text-right text-gray-900">{formatCurrency(report.totalSales || 0)}</td>
                  <td className="px-6 py-4 text-sm text-right text-gray-900">{formatCurrency(report.totalPurchases || 0)}</td>
                  <td className="px-6 py-4 text-sm text-right text-gray-900">{formatCurrency(report.totalPayments || 0)}</td>
                  <td className="px-6 py-4 text-sm text-right font-medium text-blue-600">{formatCurrency(report.remainingBalance || 0)}</td>
                  <td className="px-6 py-4 text-sm text-right font-medium text-green-600">{formatCurrency(report.totalProfit || 0)}</td>
                  <td className="px-6 py-4 text-sm text-center text-gray-900">{report.transactionCount || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};