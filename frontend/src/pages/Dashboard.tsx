import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { ArrowUpRight, ArrowDownRight, Wallet } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { data: summary, isLoading: loadingSummary } = useQuery({
    queryKey: ['dashboardSummary'],
    queryFn: async () => {
      const res = await api.get('/dashboard/summary');
      return res.data;
    }
  });

  const { data: breakdown, isLoading: loadingBreakdown } = useQuery({
    queryKey: ['dashboardCategoryBreakdown'],
    queryFn: async () => {
      const res = await api.get('/dashboard/category-breakdown?type=expense');
      return res.data;
    }
  });

  if (loadingSummary || loadingBreakdown) {
    return <div className="flex items-center justify-center h-full">Loading...</div>;
  }

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Overview</h1>
        <p className="text-gray-500 mt-1">Here's your financial summary at a glance.</p>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md hover:border-gray-200 transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-full translate-x-12 -translate-y-12 transition-transform group-hover:scale-110" />
          <div className="relative">
            <div className="p-3 bg-green-100 text-green-600 rounded-2xl w-max mb-4">
              <ArrowUpRight className="w-6 h-6" />
            </div>
            <p className="text-gray-500 font-medium text-sm">Total Income</p>
            <h2 className="text-3xl font-bold text-gray-900 mt-1">{formatCurrency(summary?.totalIncome || 0)}</h2>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md hover:border-gray-200 transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-full translate-x-12 -translate-y-12 transition-transform group-hover:scale-110" />
          <div className="relative">
            <div className="p-3 bg-red-100 text-red-600 rounded-2xl w-max mb-4">
              <ArrowDownRight className="w-6 h-6" />
            </div>
            <p className="text-gray-500 font-medium text-sm">Total Expense</p>
            <h2 className="text-3xl font-bold text-gray-900 mt-1">{formatCurrency(summary?.totalExpense || 0)}</h2>
          </div>
        </div>

        <div className="bg-gradient-to-br from-primary-600 to-indigo-700 rounded-3xl p-6 shadow-lg shadow-indigo-200 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full translate-x-12 -translate-y-12 transition-transform group-hover:scale-110" />
          <div className="relative text-white">
            <div className="p-3 bg-white/20 rounded-2xl w-max mb-4 backdrop-blur-sm">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <p className="text-primary-100 font-medium text-sm">Net Balance</p>
            <h2 className="text-3xl font-bold mt-1">{formatCurrency(summary?.balance || 0)}</h2>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Expense Breakdown</h3>
        {breakdown && Object.keys(breakdown).length > 0 ? (
          <div className="space-y-4">
            {Object.entries(breakdown).map(([category, amount]: [string, any]) => (
              <div key={category} className="flex items-center">
                <div className="w-32 text-sm font-medium text-gray-600 capitalize">{category}</div>
                <div className="flex-1 ml-4 h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary-500 rounded-full transition-all duration-1000" 
                    style={{ width: `${Math.min(((amount || 0) / (summary?.totalExpense || 1)) * 100, 100)}%` }}
                  />
                </div>
                <div className="w-24 text-right font-bold text-gray-900 ml-4">{formatCurrency(amount)}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 bg-gray-50/50 rounded-2xl border border-gray-100 border-dashed">
            No expenses recorded yet.
          </div>
        )}
      </div>
    </div>
  );
};
