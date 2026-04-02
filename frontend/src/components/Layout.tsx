import React from 'react';
import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Receipt, LogOut } from 'lucide-react';

export const Layout: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // Determine the login path based on current path
    const loginPath = location.pathname.startsWith('/admin') ? '/admin/login' : 
                      location.pathname.startsWith('/analyst') ? '/analyst/login' : '/login';
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  const theme = {
    viewer: {
      sidebar: 'bg-viewer-50/50',
      text: 'text-viewer-700',
      active: 'bg-viewer-100 text-viewer-800 shadow-viewer-100',
      icon: 'text-viewer-600',
      glow: 'bg-viewer-100/40',
      logo: 'from-viewer-600 to-indigo-600',
    },
    analyst: {
      sidebar: 'bg-analyst-50/50',
      text: 'text-analyst-700',
      active: 'bg-analyst-100 text-analyst-800 shadow-analyst-100',
      icon: 'text-analyst-600',
      glow: 'bg-analyst-100/40',
      logo: 'from-analyst-600 to-teal-600',
    },
    admin: {
      sidebar: 'bg-admin-50/50',
      text: 'text-admin-700',
      active: 'bg-admin-100 text-admin-800 shadow-admin-100',
      icon: 'text-admin-600',
      glow: 'bg-admin-100/40',
      logo: 'from-admin-600 to-orange-600',
    }
  }[(user?.role as 'viewer' | 'analyst' | 'admin') || 'viewer'];

  const navItems = [
    { name: 'Dashboard', path: user?.role === 'viewer' ? '/' : user?.role === 'analyst' ? '/analyst' : '/admin', icon: LayoutDashboard },
  ];

  if (user?.role === 'viewer') {
    navItems.push({ name: 'Records', path: '/records', icon: Receipt });
  }

  return (
    <div className="flex h-screen bg-gray-50/20">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200/60 shadow-sm flex flex-col relative z-20">
        <div className="p-6 border-b border-gray-100">
          <div className={`text-2xl font-black bg-gradient-to-r ${theme.logo} bg-clip-text text-transparent`}>
            FinanceFlow
          </div>
          <div className="mt-2 flex items-center">
            <span className={`uppercase text-[10px] px-2.5 py-0.5 rounded-full font-black tracking-tighter ${theme.active}`}>
              {user?.role} Mode
            </span>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 ${
                  isActive 
                    ? theme.active 
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? theme.icon : 'text-gray-400'}`} />
                <span className="font-bold text-sm tracking-tight">{item.name}</span>
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-gray-100 bg-gray-50/30">
          <div className="mb-4 px-4 text-sm font-black text-gray-900 truncate">
            {user?.name}
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-2xl transition-all active:scale-95"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <main className="flex-1 overflow-y-auto p-8 relative z-10">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
        {/* Decorative background glow */}
        <div className={`fixed top-[-10%] right-[-5%] w-[40vw] h-[40vw] rounded-full ${theme.glow} blur-3xl -z-10 pointer-events-none animate-pulse`} />
        <div className={`fixed bottom-[-10%] left-[10%] w-[50vw] h-[50vw] rounded-full ${theme.glow} blur-3xl -z-10 pointer-events-none animate-pulse opacity-50`} />
      </div>
    </div>
  );
};
