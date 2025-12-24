import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { Users, LayoutDashboard, LogOut, Menu, Briefcase, CheckSquare } from 'lucide-react';

const Layout: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
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
               JD
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
