import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Plus, FileText } from 'lucide-react';
import { isDemoMode } from '../lib/session';

type Project = { id: string; name: string };

type Estimate = {
  id: string;
  number: string;
  title: string;
  status: string;
  subtotal: number;
  taxAmount: number;
  total: number;
  project: Project;
};

const Estimates: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    projectId: '',
    title: '',
    taxRate: '0.08875',
    lineDescription: 'Labor + materials',
    quantity: '1',
    unitPrice: '0',
  });

  const token = localStorage.getItem('token');
  const headers = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);

  const computedTotal = useMemo(() => {
    const qty = Number(form.quantity || 0);
    const price = Number(form.unitPrice || 0);
    const subtotal = qty * price;
    const rate = Number(form.taxRate || 0);
    const tax = subtotal * rate;
    return { subtotal, tax, total: subtotal + tax };
  }, [form.quantity, form.unitPrice, form.taxRate]);

  const fetchData = async () => {
    try {
      if (isDemoMode()) {
        setProjects([{ id: 'demo-project', name: 'Demo Project' }]);
        setEstimates([
          {
            id: 'demo-est-1',
            number: 'EST-0001',
            title: 'Foundation Scope',
            status: 'DRAFT',
            subtotal: 12500,
            taxAmount: 1109.38,
            total: 13609.38,
            project: { id: 'demo-project', name: 'Demo Project' },
          },
        ]);
        return;
      }

      const [p, e] = await Promise.all([
        axios.get('/api/projects', { headers }),
        axios.get('/api/estimates', { headers }),
      ]);
      setProjects(p.data);
      setEstimates(e.data);
    } catch (error) {
      console.error('Error fetching estimates:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setForm((prev) => ({ ...prev, projectId: projects[0]?.id || '' }));
    setShowModal(true);
  };

  const createEstimate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isDemoMode()) {
      setShowModal(false);
      return;
    }
    try {
      const payload = {
        projectId: form.projectId,
        title: form.title,
        taxRate: Number(form.taxRate || 0),
        lineItems: [
          {
            description: form.lineDescription,
            quantity: Number(form.quantity || 1),
            unitPrice: Number(form.unitPrice || 0),
          },
        ],
      };
      await axios.post('/api/estimates', payload, { headers });
      setShowModal(false);
      await fetchData();
    } catch (error) {
      console.error('Error creating estimate:', error);
      alert('Error creating estimate');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Estimates</h1>
          <p className="text-gray-500">Create and track estimates with line items and tax.</p>
        </div>
        <button
          onClick={openCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          New Estimate
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm font-medium">
                <th className="px-6 py-4">Estimate</th>
                <th className="px-6 py-4">Project</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-gray-500">
                    Loading estimates...
                  </td>
                </tr>
              ) : estimates.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-gray-500">
                    No estimates found.
                  </td>
                </tr>
              ) : (
                estimates.map((estimate) => (
                  <tr key={estimate.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                          <FileText size={20} />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{estimate.number}</div>
                          <div className="text-sm text-gray-500">{estimate.title}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{estimate.project?.name || '—'}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                        {estimate.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-sm text-gray-900">
                      ${Number(estimate.total || 0).toFixed(2)}
                    </td>
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
            <h2 className="text-xl font-bold mb-4">New Estimate</h2>
            <form onSubmit={createEstimate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Project</label>
                  <select
                    className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={form.projectId}
                    onChange={(e) => setForm({ ...form, projectId: e.target.value })}
                    required
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
                  <label className="block text-sm font-medium text-gray-700">Tax Rate</label>
                  <input
                    type="number"
                    step="0.00001"
                    className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={form.taxRate}
                    onChange={(e) => setForm({ ...form, taxRate: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input
                  type="text"
                  className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Kitchen remodel - scope"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-3">
                  <label className="block text-sm font-medium text-gray-700">Line Item</label>
                  <input
                    type="text"
                    className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={form.lineDescription}
                    onChange={(e) => setForm({ ...form, lineDescription: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Qty</label>
                  <input
                    type="number"
                    step="0.01"
                    className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={form.quantity}
                    onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Unit Price</label>
                  <input
                    type="number"
                    step="0.01"
                    className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={form.unitPrice}
                    onChange={(e) => setForm({ ...form, unitPrice: e.target.value })}
                  />
                </div>
                <div className="flex items-end">
                  <div className="w-full bg-gray-50 rounded-lg px-3 py-2 text-sm">
                    Total: <span className="font-mono">${computedTotal.total.toFixed(2)}</span>
                  </div>
                </div>
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

export default Estimates;

