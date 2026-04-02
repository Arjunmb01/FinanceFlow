import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { 
  Plus, 
  Trash2, 
  Search, 
  Filter, 
  X, 
  ChevronLeft, 
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Calendar
} from 'lucide-react';

export const Records: React.FC = () => {
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [category, setCategory] = useState('');
  
  const [newRecord, setNewRecord] = useState({ 
    amount: '', 
    type: 'expense', 
    category: 'food', 
    date: new Date().toISOString().split('T')[0], 
    notes: '' 
  });

  const { data: recordsData, isLoading } = useQuery({
    queryKey: ['records', page, search, type, category],
    queryFn: async () => {
      let url = `/records?page=${page}&limit=10`;
      if (search) url += `&search=${search}`;
      if (type) url += `&type=${type}`;
      if (category) url += `&category=${category}`;
      const res = await api.get(url);
      return res.data;
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      await api.post('/records', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['records'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardCategoryBreakdown'] });
      setIsAdding(false);
      setNewRecord({ 
        amount: '', 
        type: 'expense', 
        category: 'food', 
        date: new Date().toISOString().split('T')[0], 
        notes: '' 
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/records/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['records'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardCategoryBreakdown'] });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      ...newRecord,
      amount: parseFloat(newRecord.amount),
    });
  };

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  const totalPages = Math.ceil((recordsData?.total || 1) / 10);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            Financial Records
          </h1>
          <p className="text-gray-500 mt-1 font-medium italic">Track every cent with precision.</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className={`flex items-center gap-2 px-6 py-3.5 rounded-2xl font-black transition-all shadow-lg active:scale-95 ${
            isAdding 
              ? 'bg-gray-100 text-gray-500 hover:bg-gray-200 shadow-none' 
              : 'bg-primary-600 hover:bg-primary-700 text-white shadow-primary-200'
          }`}
        >
          {isAdding ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          {isAdding ? 'Cancel' : 'New Record'}
        </button>
      </header>

      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-gray-200/40 border border-gray-100 grid grid-cols-1 md:grid-cols-5 gap-6 items-end relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary-50 rounded-full translate-x-12 -translate-y-12 opacity-50" />
          
          <div className="md:col-span-1">
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Amount</label>
            <input 
              type="number" 
              required 
              step="0.01" 
              placeholder="0.00"
              className="w-full border border-gray-200 rounded-2xl px-5 py-3.5 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none transition-all font-bold text-gray-900 bg-gray-50/30" 
              value={newRecord.amount} 
              onChange={e => setNewRecord({...newRecord, amount: e.target.value})} 
            />
          </div>
          
          <div className="md:col-span-1">
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Type</label>
            <select 
              className="w-full border border-gray-200 rounded-2xl px-5 py-3.5 outline-none bg-gray-50/30 font-bold appearance-none transition-all focus:ring-4 focus:ring-primary-100 focus:border-primary-500" 
              value={newRecord.type} 
              onChange={e => setNewRecord({...newRecord, type: e.target.value})}
            >
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>

          <div className="md:col-span-1">
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Category</label>
            <select 
              className="w-full border border-gray-200 rounded-2xl px-5 py-3.5 outline-none bg-gray-50/30 font-bold appearance-none transition-all focus:ring-4 focus:ring-primary-100 focus:border-primary-500" 
              value={newRecord.category} 
              onChange={e => setNewRecord({...newRecord, category: e.target.value})}
            >
              <option value="salary">Salary</option>
              <option value="food">Food</option>
              <option value="transport">Transport</option>
              <option value="utilities">Utilities</option>
              <option value="entertainment">Entertainment</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="md:col-span-1">
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Date</label>
            <input 
              type="date" 
              required 
              className="w-full border border-gray-200 rounded-2xl px-5 py-3.5 outline-none bg-gray-50/30 font-bold transition-all focus:ring-4 focus:ring-primary-100 focus:border-primary-500" 
              value={newRecord.date} 
              onChange={e => setNewRecord({...newRecord, date: e.target.value})} 
            />
          </div>

          <button 
            type="submit" 
            disabled={createMutation.isPending}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3.5 rounded-2xl font-black transition-all shadow-lg active:scale-95 disabled:opacity-50"
          >
            {createMutation.isPending ? 'Saving...' : 'Add Record'}
          </button>
        </form>
      )}

      {/* Filter Bar */}
      <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[250px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search category or notes..." 
            className="w-full pl-12 pr-5 py-3 bg-gray-50 border-none rounded-xl focus:ring-4 focus:ring-primary-50 outline-none transition-all font-medium text-sm"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>

        <div className="flex items-center gap-3">
          <select 
            value={type}
            onChange={(e) => { setType(e.target.value); setPage(1); }}
            className="px-4 py-3 bg-gray-50 border-none rounded-xl text-sm font-bold text-gray-600 outline-none focus:ring-4 focus:ring-primary-50 cursor-pointer"
          >
            <option value="">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>

          <select 
            value={category}
            onChange={(e) => { setCategory(e.target.value); setPage(1); }}
            className="px-4 py-3 bg-gray-50 border-none rounded-xl text-sm font-bold text-gray-600 outline-none focus:ring-4 focus:ring-primary-50 cursor-pointer"
          >
            <option value="">All Categories</option>
            <option value="salary">Salary</option>
            <option value="food">Food</option>
            <option value="transport">Transport</option>
            <option value="utilities">Utilities</option>
            <option value="entertainment">Entertainment</option>
            <option value="other">Other</option>
          </select>
          
          <button 
            onClick={() => { setSearch(''); setType(''); setCategory(''); setPage(1); }}
            className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
            title="Reset Filters"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/30 border border-gray-100 overflow-hidden flex flex-col min-h-[500px]">
        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
            <p className="font-black text-gray-400 uppercase tracking-widest text-sm">Synchronizing Portal...</p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100 text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">
                    <th className="p-6 pl-10 font-black uppercase tracking-widest">Date</th>
                    <th className="p-6">Flow</th>
                    <th className="p-6">Category</th>
                    <th className="p-6 text-right pr-20">Value</th>
                    <th className="p-6 text-right pr-10">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {recordsData?.data?.map((record: any) => (
                    <tr key={record.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="p-6 pl-10 text-gray-900 font-bold whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <Calendar className="w-4 h-4 text-gray-300" />
                          {new Date(record.date).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="p-6">
                        <span className={`flex items-center gap-1.5 w-max px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-tighter ${
                          record.type === 'income' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {record.type === 'income' ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                          {record.type}
                        </span>
                      </td>
                      <td className="p-6 text-gray-600 capitalize font-black italic tracking-tight">{record.category}</td>
                      <td className={`p-6 text-right pr-20 font-black text-base italic ${
                        record.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {record.type === 'income' ? '+' : '-'}{formatCurrency(record.amount)}
                      </td>
                      <td className="p-6 text-right pr-10">
                        <button 
                          onClick={() => deleteMutation.mutate(record.id)} 
                          className="text-gray-300 hover:text-red-500 p-3 hover:bg-red-50 rounded-2xl transition-all active:scale-90"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {recordsData?.data?.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-24 text-center">
                        <div className="flex flex-col items-center gap-3 opacity-30">
                          <Filter className="w-12 h-12" />
                          <p className="font-black uppercase tracking-widest text-sm italic">No records matching your criteria.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <footer className="p-8 bg-gray-50/30 border-t border-gray-100 flex items-center justify-between mt-auto">
              <div className="text-xs font-black text-gray-400 uppercase tracking-widest italic">
                Portal Page <span className="text-primary-600 font-black">{page}</span> of {totalPages}
              </div>
              <div className="flex gap-4">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                  className="p-3.5 bg-white border border-gray-200 rounded-2xl text-gray-400 hover:text-primary-600 hover:border-primary-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm active:scale-90"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage(p => p + 1)}
                  className="p-3.5 bg-white border border-gray-200 rounded-2xl text-gray-400 hover:text-primary-600 hover:border-primary-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm active:scale-90"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>
            </footer>
          </>
        )}
      </div>
    </div>
  );
};
