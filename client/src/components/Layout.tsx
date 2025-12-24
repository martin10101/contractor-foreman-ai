import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { Users, LayoutDashboard, LogOut, Menu, Briefcase, CheckSquare, FileText, Receipt, FolderOpen, BarChart3, Settings, CalendarDays, Wrench } from 'lucide-react';
import { getStoredUser, getUserInitials } from '../lib/session';

const Layout: React.FC = () => {
  const navigate = useNavigate();
  const user = getStoredUser();
  const initials = getUserInitials(user);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('demoMode');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex-shrink-0">
        <div className="p-6">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">CF</div>
            Foreman AI
          </h1>
        </div>
        <nav className="mt-6 px-4 space-y-2">
          <Link to="/" className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-slate-800 rounded-lg transition-colors">
            <LayoutDashboard size={20} />
            Dashboard
          </Link>
          <Link to="/contacts" className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-slate-800 rounded-lg transition-colors">
            <Users size={20} />
            Contacts
          </Link>
          <Link to="/projects" className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-slate-800 rounded-lg transition-colors">
            <Briefcase size={20} />
            Projects
          </Link>
          <Link to="/tasks" className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-slate-800 rounded-lg transition-colors">
            <CheckSquare size={20} />
            Tasks
          </Link>
          <Link to="/calendar" className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-slate-800 rounded-lg transition-colors">
            <CalendarDays size={20} />
            Calendar
          </Link>
          <Link to="/estimates" className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-slate-800 rounded-lg transition-colors">
            <FileText size={20} />
            Estimates
          </Link>
          <Link to="/invoices" className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-slate-800 rounded-lg transition-colors">
            <Receipt size={20} />
            Invoices
          </Link>
          <Link to="/change-orders" className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-slate-800 rounded-lg transition-colors">
            <Wrench size={20} />
            Change Orders
          </Link>
          <Link to="/documents" className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-slate-800 rounded-lg transition-colors">
            <FolderOpen size={20} />
            Documents
          </Link>
          <Link to="/reports" className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-slate-800 rounded-lg transition-colors">
            <BarChart3 size={20} />
            Reports
          </Link>
          <Link to="/settings" className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-slate-800 rounded-lg transition-colors">
            <Settings size={20} />
            Settings
          </Link>
        </nav>
        <div className="absolute bottom-0 w-64 p-4 border-t border-slate-800">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white transition-colors w-full text-left"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        <header className="h-16 bg-white border-b flex items-center justify-between px-8">
          <div className="flex items-center gap-4">
            <button className="lg:hidden">
              <Menu size={24} />
            </button>
            <h2 className="text-lg font-semibold text-gray-800">Project Overview</h2>
          </div>
          <div className="flex items-center gap-4">
             <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
               {initials}
             </div>
          </div>
        </header>
        <div className="p-8 overflow-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
