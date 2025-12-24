import React from 'react';
import { Users, BarChart3, Clock, AlertCircle } from 'lucide-react';

const Dashboard: React.FC = () => {
  const stats = [
    { label: 'Total Contacts', value: '12', icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Active Projects', value: '3', icon: BarChart3, color: 'text-green-600', bg: 'bg-green-100' },
    { label: 'Pending Tasks', value: '8', icon: Clock, color: 'text-orange-600', bg: 'bg-orange-100' },
    { label: 'Issues', value: '2', icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-100' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, John!</h1>
        <p className="text-gray-500">Here's what's happening on your projects today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-lg flex items-center justify-center`}>
                <stat.icon size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold mb-4">Recent Contacts</h3>
          <p className="text-gray-500 text-sm">Module 1: Contacts integration active.</p>
          <div className="mt-4 space-y-4">
             {/* Placeholder for list */}
             <div className="h-12 bg-gray-50 rounded-lg animate-pulse" />
             <div className="h-12 bg-gray-50 rounded-lg animate-pulse" />
             <div className="h-12 bg-gray-50 rounded-lg animate-pulse" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold mb-4">Upcoming Schedule</h3>
          <p className="text-gray-500 text-sm">Next modules: Scheduling & Tasks.</p>
          <div className="mt-4 flex items-center justify-center h-40 border-2 border-dashed border-gray-100 rounded-lg">
            <span className="text-gray-400">Roadmap Item</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
