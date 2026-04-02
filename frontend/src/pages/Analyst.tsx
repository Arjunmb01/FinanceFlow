import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { Users, ArrowUpRight, ArrowDownRight, Wallet, Loader2, Search } from 'lucide-react';

export const Analyst: React.FC = () => {
  const [selectedUserId, setSelectedUserId] = useState<string>('');

  // Fetch all users
  const { data: userData, isLoading: loadingUsers } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await api.get('/users?limit=100'); // Higher limit for selection
      return res.data;
    }
  });

  const users = userData?.data || [];

  // Fetch summary for selected user
  const { data: summary, isLoading: loadingSummary } = useQuery({
    queryKey: ['analystSummary', selectedUserId],
    queryFn: async () => {
      if (!selectedUserId) return null;
      const res = await api.get(`/dashboard/summary?userId=${selectedUserId}`);
      return res.data;
    },
    enabled: !!selectedUserId
  });

  // Fetch records for selected user
  const { data: recordsData, isLoading: loadingRecords } = useQuery({
    queryKey: ['analystRecords', selectedUserId],
    queryFn: async () => {
      if (!selectedUserId) return null;
      const res = await api.get(`/records?userId=${selectedUserId}&limit=20`);
      return res.data;
    },
    enabled: !!selectedUserId
  });

  const records = recordsData?.data || [];

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
            <Users className="w-8 h-8 text-primary-600" />
            Analyst Dashboard
          </h1>
          <p className="text-gray-500 mt-1">Review and analyze financial data across all users.</p>
        </div>

        <div className="relative min-w-[280px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <select 
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            className="w-full pl-12 pr-10 py-3.5 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-primary-100 focus:border-primary-400 outline-none transition-all appearance-none font-medium text-gray-700 shadow-sm"
          >
            <option value="">Select a user to analyze...</option>
            {users?.map((user: any) => (
              <option key={user.id} value={user.id}>
                {user.name} ({user.email})
              </option>
            ))}
          </select>
          {loadingUsers && (
            <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-500 animate-spin" />
          )}
        </div>
      </header>

      {!selectedUserId ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white/50 rounded-[2.5rem] border-2 border-dashed border-gray-200">
          <div className="p-6 bg-primary-50 text-primary-600 rounded-3xl mb-4">
            <Users className="w-12 h-12" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">No User Selected</h2>
          <p className="text-gray-500 mt-2 max-w-sm text-center">
            Select a user from the dropdown above to view their financial overview and transaction history.
          </p>
        </div>
      ) : (
        <>
          {loadingSummary ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-full translate-x-12 -translate-y-12" />
                <div className="relative">
                  <div className="p-3 bg-green-100 text-green-600 rounded-2xl w-max mb-4">
                    <ArrowUpRight className="w-6 h-6" />
                  </div>
                  <p className="text-gray-500 font-medium text-sm">Target Income</p>
                  <h2 className="text-3xl font-bold text-gray-900 mt-1">{formatCurrency(summary?.totalIncome || 0)}</h2>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-full translate-x-12 -translate-y-12" />
                <div className="relative">
                  <div className="p-3 bg-red-100 text-red-600 rounded-2xl w-max mb-4">
                    <ArrowDownRight className="w-6 h-6" />
                  </div>
                  <p className="text-gray-500 font-medium text-sm">Target Expense</p>
                  <h2 className="text-3xl font-bold text-gray-900 mt-1">{formatCurrency(summary?.totalExpense || 0)}</h2>
                </div>
              </div>

              <div className="bg-gradient-to-br from-primary-600 to-indigo-700 rounded-3xl p-6 shadow-lg shadow-indigo-200 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full translate-x-12 -translate-y-12" />
                <div className="relative text-white">
                  <div className="p-3 bg-white/20 rounded-2xl w-max mb-4 backdrop-blur-sm">
                    <Wallet className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-primary-100 font-medium text-sm">Net Balance</p>
                  <h2 className="text-3xl font-bold mt-1">{formatCurrency(summary?.balance || 0)}</h2>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-8 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">User Records</h3>
              <span className="px-4 py-1.5 bg-gray-100 text-gray-600 text-xs font-bold rounded-full uppercase tracking-wider">
                Read Only Access
              </span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 text-sm text-gray-500 font-bold">
                    <th className="p-6 pl-8">Date</th>
                    <th className="p-6">Type</th>
                    <th className="p-6">Category</th>
                    <th className="p-6 text-right pr-8">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {loadingRecords ? (
                    <tr>
                      <td colSpan={4} className="p-12 text-center">
                        <Loader2 className="w-6 h-6 text-primary-600 animate-spin mx-auto" />
                      </td>
                    </tr>
                  ) : records?.map((record: any) => (
                    <tr key={record.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="p-6 pl-8 text-gray-900 font-medium">{new Date(record.date).toLocaleDateString()}</td>
                      <td className="p-6">
                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${record.type === 'income' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {record.type}
                        </span>
                      </td>
                      <td className="p-6 text-gray-600 capitalize font-semibold">{record.category}</td>
                      <td className="p-6 text-right pr-8 font-black text-gray-900">{formatCurrency(record.amount)}</td>
                    </tr>
                  ))}
                  {records?.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-12 text-center text-gray-500 italic">No records found for this user.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
