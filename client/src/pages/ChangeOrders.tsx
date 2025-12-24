import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Plus, Wrench } from 'lucide-react';
import { isDemoMode } from '../lib/session';

type Project = { id: string; name: string };
type ChangeOrder = {
  id: string;
  number: string;
  title: string;
  description?: string | null;
  amount: number;
  status: string;
  project: Project;
  createdAt: string;
};

const ChangeOrders: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<ChangeOrder[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    projectId: '',
    title: '',
    description: '',
    amount: '0',
  });

  const token = localStorage.getItem('token');
  const headers = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);

  const fetchData = async () => {
    try {
      if (isDemoMode()) {
        setProjects([{ id: 'demo-project-1', name: 'Demo Renovation' }]);
        setOrders([
          {
            id: 'demo-co-1',
            number: 'CO-0001',
            title: 'Upgrade insulation',
            description: 'Owner request to upgrade.',
            amount: 1800,
            status: 'PENDING',
            project: { id: 'demo-project-1', name: 'Demo Renovation' },
            createdAt: new Date().toISOString(),
          },
        ]);
        return;
      }
      const [p, o] = await Promise.all([
        axios.get('/api/projects', { headers }),
        axios.get('/api/change-orders', { headers }),
      ]);
      setProjects(p.data);
      setOrders(o.data);
    } catch (error) {
      console.error('Error fetching change orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setForm({ projectId: projects[0]?.id || '', title: '', description: '', amount: '0' });
    setShowModal(true);
  };

  const createOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isDemoMode()) {
      setShowModal(false);
      return;
    }
    try {
      await axios.post(
        '/api/change-orders',
        {
          projectId: form.projectId,
          title: form.title,
          description: form.description || null,
          amount: Number(form.amount || 0),
          status: 'DRAFT',
        },
        { headers }
      );
      setShowModal(false);
      await fetchData();
    } catch (error) {
      console.error('Error creating change order:', error);
      alert('Error creating change order');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Change Orders</h1>
          <p className="text-gray-500">Track scope changes and approvals.</p>
        </div>
        <button
          onClick={openCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          New Change Order
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm font-medium">
                <th className="px-6 py-4">Change Order</th>
                <th className="px-6 py-4">Project</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Amount</th>
                <th className="px-6 py-4">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                    Loading change orders...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                    No change orders found.
                  </td>
                </tr>
              ) : (
                orders.map((co) => (
                  <tr key={co.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                          <Wrench size={20} />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{co.number}</div>
                          <div className="text-sm text-gray-500">{co.title}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{co.project?.name || '—'}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                        {co.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-sm">${Number(co.amount || 0).toFixed(2)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{new Date(co.createdAt).toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-xl w-full p-6 shadow-2xl">
            <h2 className="text-xl font-bold mb-4">New Change Order</h2>
            <form onSubmit={createOrder} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Project</label>
                <select
                  required
                  className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={form.projectId}
                  onChange={(e) => setForm({ ...form, projectId: e.target.value })}
                >
                  <option value="" disabled>
                    Select a project
                  </option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input
                  required
                  className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <input
                  className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Amount</label>
                <input
                  type="number"
                  step="0.01"
                  className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChangeOrders;

