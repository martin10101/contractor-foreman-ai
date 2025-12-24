import React, { useState, useEffect } from 'react';
import { Users, BarChart3, Clock, AlertCircle } from 'lucide-react';
import axios from 'axios';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState([
    { label: 'Total Contacts', value: '0', icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Active Projects', value: '0', icon: BarChart3, color: 'text-green-600', bg: 'bg-green-100' },
    { label: 'Pending Tasks', value: '0', icon: Clock, color: 'text-orange-600', bg: 'bg-orange-100' },
    { label: 'Issues', value: '0', icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-100' },
  ]);
  const [userName, setUserName] = useState('User');

  useEffect(() => {
    fetchDashboardStats();
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserName(user.firstName || 'User');
      } catch (e) {
        console.error('Error parsing user from localStorage');
      }
    }
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      const [contacts, projects, tasks] = await Promise.all([
        axios.get('/api/contacts', { headers }),
        axios.get('/api/projects', { headers }),
        axios.get('/api/tasks', { headers }),
      ]);

      setStats([
        { label: 'Total Contacts', value: contacts.data.length.toString(), icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
        { label: 'Active Projects', value: projects.data.filter((p: any) => p.status === 'In Progress').length.toString(), icon: BarChart3, color: 'text-green-600', bg: 'bg-green-100' },
        { label: 'Pending Tasks', value: tasks.data.filter((t: any) => t.status !== 'Completed').length.toString(), icon: Clock, color: 'text-orange-600', bg: 'bg-orange-100' },
        { label: 'Issues', value: tasks.data.filter((t: any) => t.status === 'Blocked').length.toString(), icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-100' },
      ]);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {userName}!</h1>
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
          <p className="text-gray-500 text-sm">Tasks module is now live! Check out the Tasks page.</p>
          <div className="mt-4 flex items-center justify-center h-40 border-2 border-dashed border-gray-100 rounded-lg">
            <span className="text-gray-400">Scheduling module in progress</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;