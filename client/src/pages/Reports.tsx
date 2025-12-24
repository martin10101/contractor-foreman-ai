import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { BarChart3 } from 'lucide-react';
import { isDemoMode } from '../lib/session';

type Report = {
  counts: {
    contacts: number;
    projects: number;
    activeProjects: number;
    tasks: number;
    openTasks: number;
    estimates: number;
    invoices: number;
    openInvoices: number;
  };
  financials: {
    totalInvoiced: number;
    totalPaid: number;
    totalOutstanding: number;
  };
};

const Reports: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<Report | null>(null);

  const token = localStorage.getItem('token');
  const headers = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);

  useEffect(() => {
    const run = async () => {
      try {
        if (isDemoMode()) {
          setReport({
            counts: {
              contacts: 12,
              projects: 5,
              activeProjects: 3,
              tasks: 17,
              openTasks: 7,
              estimates: 8,
              invoices: 6,
              openInvoices: 2,
            },
            financials: {
              totalInvoiced: 25000,
              totalPaid: 12000,
              totalOutstanding: 13000,
            },
          });
          return;
        }
        const resp = await axios.get('/api/reports/overview', { headers });
        setReport(resp.data);
      } catch (error) {
        console.error('Error fetching report:', error);
      } finally {
        setLoading(false);
      }
    };
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="text-gray-500">Overview of workload and cashflow.</p>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-10 text-center text-gray-500">
          Loading report...
        </div>
      ) : !report ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-10 text-center text-gray-500">
          Report unavailable.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                <BarChart3 size={20} />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Operations</h2>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-gray-500">Contacts</div>
                <div className="text-2xl font-bold">{report.counts.contacts}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-gray-500">Projects</div>
                <div className="text-2xl font-bold">{report.counts.projects}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-gray-500">Active Projects</div>
                <div className="text-2xl font-bold">{report.counts.activeProjects}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-gray-500">Open Tasks</div>
                <div className="text-2xl font-bold">{report.counts.openTasks}</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center text-green-700">
                $
              </div>
              <h2 className="text-lg font-bold text-gray-900">Cashflow</h2>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between bg-gray-50 rounded-lg p-4">
                <span className="text-gray-600">Total invoiced</span>
                <span className="font-mono">${report.financials.totalInvoiced.toFixed(2)}</span>
              </div>
              <div className="flex justify-between bg-gray-50 rounded-lg p-4">
                <span className="text-gray-600">Total paid</span>
                <span className="font-mono">${report.financials.totalPaid.toFixed(2)}</span>
              </div>
              <div className="flex justify-between bg-blue-600 rounded-lg p-4 text-white">
                <span>Outstanding</span>
                <span className="font-mono">${report.financials.totalOutstanding.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;

