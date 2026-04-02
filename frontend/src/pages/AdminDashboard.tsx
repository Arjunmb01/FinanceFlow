import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { 
  ShieldCheck, 
  Search, 
  Loader2, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  XCircle,
  History
} from 'lucide-react';

type Tab = 'users' | 'audit';

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('users');
  const [userSearch, setUserSearch] = useState('');
  const [userPage, setUserPage] = useState(1);
  const [auditSearch, setAuditSearch] = useState('');
  const [auditPage, setAuditPage] = useState(1);
  const queryClient = useQueryClient();

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  // Fetch Users
  const { data: userData, isLoading: loadingUsers } = useQuery({
    queryKey: ['adminUsers', userPage, userSearch],
    queryFn: async () => {
      const res = await api.get(`/users?page=${userPage}&limit=10&search=${userSearch}`);
      return res.data;
    }
  });

  // Fetch Global Audit Records
  const { data: auditData, isLoading: loadingAudit } = useQuery({
    queryKey: ['adminAudit', auditPage, auditSearch],
    queryFn: async () => {
      const res = await api.get(`/records?page=${auditPage}&limit=10&search=${auditSearch}`);
      return res.data;
    }
  });

  // Toggle User Status Mutation
  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string, isActive: boolean }) => {
      await api.patch(`/users/${id}/status`, { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
    }
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
        <div className="flex items-center gap-5">
          <div className="p-4 bg-admin-100 text-admin-600 rounded-3xl shadow-inner shadow-admin-200/50">
            <ShieldCheck className="w-10 h-10" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase italic">
              Admin Command Center
            </h1>
            <p className="text-gray-500 font-bold text-sm tracking-tight flex items-center gap-2 mt-1 uppercase opacity-60">
              System Administration & Global Oversight
            </p>
          </div>
        </div>

        <nav className="flex bg-gray-100 p-1.5 rounded-2xl">
          {(['users', 'audit'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all uppercase tracking-widest ${
                activeTab === tab 
                  ? 'bg-white text-admin-600 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {tab === 'users' ? 'User Management' : 'Global Audit'}
            </button>
          ))}
        </nav>
      </header>

      {/* Main Content */}
      <div className="bg-white rounded-[3rem] shadow-xl shadow-gray-200/40 border border-gray-100 overflow-hidden min-h-[600px] flex flex-col">
        {/* Search & Filter Bar */}
        <div className="p-8 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50/30">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={activeTab === 'users' ? "Search users by name or email..." : "Search records by notes or category..."}
              value={activeTab === 'users' ? userSearch : auditSearch}
              onChange={(e) => {
                if (activeTab === 'users') {
                  setUserSearch(e.target.value);
                  setUserPage(1);
                } else {
                  setAuditSearch(e.target.value);
                  setAuditPage(1);
                }
              }}
              className="w-full pl-12 pr-5 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-admin-100 focus:border-admin-400 outline-none transition-all font-bold text-sm"
            />
          </div>
          
          <div className="flex items-center gap-3">
             <div className="px-5 py-2 bg-admin-50 text-admin-700 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 border border-admin-100">
               <History className="w-4 h-4" />
               Real-time Logs
             </div>
          </div>
        </div>

        {/* Dynamic Table Section */}
        <div className="flex-1 overflow-x-auto">
          {activeTab === 'users' ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 text-xs text-gray-400 font-black uppercase tracking-widest border-b border-gray-100">
                  <th className="p-6 pl-10">User Identity</th>
                  <th className="p-6">Role Power</th>
                  <th className="p-6">Account Status</th>
                  <th className="p-6">Date Joined</th>
                  <th className="p-6 text-right pr-10">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {loadingUsers ? (
                  <tr>
                    <td colSpan={5} className="p-20 text-center">
                      <Loader2 className="w-10 h-10 text-admin-600 animate-spin mx-auto" />
                    </td>
                  </tr>
                ) : userData?.data?.map((user: any) => (
                  <tr key={user.id} className="hover:bg-admin-50/10 transition-colors group">
                    <td className="p-6 pl-10">
                      <div className="flex flex-col">
                        <span className="font-black text-gray-900 text-base tracking-tight">{user.name}</span>
                        <span className="text-gray-400 text-xs font-bold">{user.email}</span>
                      </div>
                    </td>
                    <td className="p-6">
                      <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-tighter ${
                        user.role === 'admin' ? 'bg-admin-100 text-admin-700' :
                        user.role === 'analyst' ? 'bg-teal-100 text-teal-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-2">
                        {user.isActive ? (
                          <div className="flex items-center gap-1.5 text-emerald-600 font-black text-xs uppercase italic tracking-tighter">
                            <CheckCircle2 className="w-4 h-4" /> Active
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-red-600 font-black text-xs uppercase italic tracking-tighter">
                            <XCircle className="w-4 h-4" /> Suspended
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-6 text-gray-500 font-bold">{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td className="p-6 text-right pr-10">
                      <button
                        onClick={() => toggleStatusMutation.mutate({ id: user.id, isActive: !user.isActive })}
                        disabled={toggleStatusMutation.isPending}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                          user.isActive 
                            ? 'bg-red-50 text-red-600 hover:bg-red-100 shadow-sm shadow-red-100' 
                            : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 shadow-sm shadow-emerald-100'
                        }`}
                      >
                        {user.isActive ? 'Suspend' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 text-xs text-gray-400 font-black uppercase tracking-widest border-b border-gray-100">
                  <th className="p-6 pl-10">Timestamp</th>
                  <th className="p-6">Financial Category</th>
                  <th className="p-6">Transaction Type</th>
                  <th className="p-6 text-right pr-10">Financial Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {loadingAudit ? (
                  <tr>
                    <td colSpan={4} className="p-20 text-center">
                      <Loader2 className="w-10 h-10 text-admin-600 animate-spin mx-auto" />
                    </td>
                  </tr>
                ) : auditData?.data?.map((record: any) => (
                  <tr key={record.id} className="hover:bg-admin-50/10 transition-colors group">
                    <td className="p-6 pl-10 text-gray-900 font-black tracking-tight italic">
                      {new Date(record.date).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="p-6 text-gray-600 uppercase font-black text-xs tracking-tighter">
                      {record.category}
                    </td>
                    <td className="p-6">
                      <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase italic tracking-widest ${
                        record.type === 'income' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {record.type}
                      </span>
                    </td>
                    <td className={`p-6 text-right pr-10 font-black text-base italic ${
                      record.type === 'income' ? 'text-emerald-700' : 'text-red-700'
                    }`}>
                      {record.type === 'income' ? '+' : '-'}{formatCurrency(record.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Footer */}
        <div className="p-8 bg-gray-50/30 border-t border-gray-100 flex items-center justify-between mt-auto">
          <div className="text-xs font-black text-gray-400 uppercase tracking-widest">
            Showing Page <span className="text-admin-600 font-black">{activeTab === 'users' ? userPage : auditPage}</span> 
            of <span className="text-admin-600 font-black">{Math.ceil((activeTab === 'users' ? (userData?.total || 1) : (auditData?.total || 1)) / 10)}</span>
          </div>
          <div className="flex gap-4">
            <button
              disabled={(activeTab === 'users' ? userPage : auditPage) === 1}
              onClick={() => activeTab === 'users' ? setUserPage(p => p - 1) : setAuditPage(p => p - 1)}
              className="p-3 bg-white border border-gray-200 rounded-xl text-gray-400 hover:text-admin-600 hover:border-admin-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              disabled={(activeTab === 'users' ? (userData?.total || 0) : (auditData?.total || 0)) <= (activeTab === 'users' ? userPage * 10 : auditPage * 10)}
              onClick={() => activeTab === 'users' ? setUserPage(p => p + 1) : setAuditPage(p => p + 1)}
              className="p-3 bg-white border border-gray-200 rounded-xl text-gray-400 hover:text-admin-600 hover:border-admin-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
