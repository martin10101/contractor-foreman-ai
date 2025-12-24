import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Plus, Receipt, DollarSign, Download, Send } from 'lucide-react';
import { isDemoMode } from '../lib/session';

type Project = { id: string; name: string };

type Invoice = {
  id: string;
  number: string;
  status: string;
  total: number;
  project: Project;
  payments?: { id: string; amount: number }[];
};

const Invoices: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [showPay, setShowPay] = useState<Invoice | null>(null);
  const [form, setForm] = useState({
    projectId: '',
    taxRate: '0',
    lineDescription: 'Invoice line item',
    quantity: '1',
    unitPrice: '0',
  });
  const [paymentAmount, setPaymentAmount] = useState('0');

  const token = localStorage.getItem('token');
  const headers = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);

  const fetchData = async () => {
    try {
      if (isDemoMode()) {
        setProjects([{ id: 'demo-project', name: 'Demo Project' }]);
        setInvoices([
          {
            id: 'demo-inv-1',
            number: 'INV-0001',
            status: 'SENT',
            total: 2500,
            project: { id: 'demo-project', name: 'Demo Project' },
            payments: [{ id: 'demo-pay-1', amount: 500 }],
          },
        ]);
        return;
      }
      const [p, inv] = await Promise.all([
        axios.get('/api/projects', { headers }),
        axios.get('/api/invoices', { headers }),
      ]);
      setProjects(p.data);
      setInvoices(inv.data);
    } catch (error) {
      console.error('Error fetching invoices:', error);
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
    setShowCreate(true);
  };

  const createInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isDemoMode()) {
      setShowCreate(false);
      return;
    }
    try {
      const qty = Number(form.quantity || 1);
      const price = Number(form.unitPrice || 0);
      await axios.post(
        '/api/invoices',
        {
          projectId: form.projectId,
          taxRate: Number(form.taxRate || 0),
          lineItems: [{ description: form.lineDescription, quantity: qty, unitPrice: price }],
        },
        { headers }
      );
      setShowCreate(false);
      await fetchData();
    } catch (error) {
      console.error('Error creating invoice:', error);
      alert('Error creating invoice');
    }
  };

  const paidAmount = (invoice: Invoice) => (invoice.payments || []).reduce((s, p) => s + (p.amount || 0), 0);

  const recordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showPay) return;
    if (isDemoMode()) {
      setShowPay(null);
      return;
    }
    try {
      await axios.post(
        `/api/invoices/${showPay.id}/payments`,
        { amount: Number(paymentAmount || 0), method: 'OTHER' },
        { headers }
      );
      setShowPay(null);
      await fetchData();
    } catch (error) {
      console.error('Error recording payment:', error);
      alert('Error recording payment');
    }
  };

  const downloadPdf = (invoiceId: string) => {
    const url = `/api/invoices/${invoiceId}/pdf`;
    window.open(url, '_blank', 'noreferrer');
  };

  const markSent = async (invoiceId: string) => {
    if (isDemoMode()) return;
    try {
      await axios.post(`/api/invoices/${invoiceId}/send`, {}, { headers });
      await fetchData();
    } catch (error) {
      console.error('Error sending invoice:', error);
      alert('Error sending invoice');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
          <p className="text-gray-500">Issue invoices and record payments.</p>
        </div>
        <button
          onClick={openCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          New Invoice
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm font-medium">
                <th className="px-6 py-4">Invoice</th>
                <th className="px-6 py-4">Project</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Total</th>
                <th className="px-6 py-4 text-right">Paid</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                    Loading invoices...
                  </td>
                </tr>
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                    No invoices found.
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                          <Receipt size={20} />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{inv.number}</div>
                          <div className="text-xs text-gray-500">{inv.project?.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{inv.project?.name || '—'}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-sm">${Number(inv.total || 0).toFixed(2)}</td>
                    <td className="px-6 py-4 text-right font-mono text-sm">${paidAmount(inv).toFixed(2)}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex gap-2">
                        <button
                          onClick={() => downloadPdf(inv.id)}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
                          title="Open PDF"
                        >
                          <Download size={16} />
                          PDF
                        </button>
                        <button
                          onClick={() => markSent(inv.id)}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
                          title="Mark as sent"
                        >
                          <Send size={16} />
                          Send
                        </button>
                        <button
                          onClick={() => {
                            setShowPay(inv);
                            setPaymentAmount('0');
                          }}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
                          title="Record payment"
                        >
                          <DollarSign size={16} />
                          Payment
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-xl w-full p-6 shadow-2xl">
            <h2 className="text-xl font-bold mb-4">New Invoice</h2>
            <form onSubmit={createInvoice} className="space-y-4">
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
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
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

      {showPay && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
            <h2 className="text-xl font-bold mb-2">Record Payment</h2>
            <p className="text-sm text-gray-500 mb-4">
              {showPay.number} • Balance ${Math.max(0, (showPay.total || 0) - paidAmount(showPay)).toFixed(2)}
            </p>
            <form onSubmit={recordPayment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Amount</label>
                <input
                  type="number"
                  step="0.01"
                  className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPay(null)}
                  className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Invoices;
