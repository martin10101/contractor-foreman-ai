import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { getStoredUser, isDemoMode } from '../lib/session';

type MeResponse = {
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    organizationId: string;
    role: string;
  };
  organization: {
    id: string;
    name: string;
  };
};

const Settings: React.FC = () => {
  const [me, setMe] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token');
  const headers = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);

  useEffect(() => {
    const run = async () => {
      try {
        if (isDemoMode()) {
          const user = getStoredUser();
          setMe(
            user
              ? ({
                  user: {
                    id: user.id || 'demo',
                    email: user.email || 'demo@example.com',
                    firstName: user.firstName || 'Demo',
                    lastName: user.lastName || 'User',
                    organizationId: user.organizationId || 'demo-org',
                    role: user.role || 'DEMO',
                  },
                  organization: { id: 'demo-org', name: 'Demo Organization' },
                } as MeResponse)
              : null
          );
          return;
        }
        const resp = await axios.get('/api/me', { headers });
        setMe(resp.data);
      } catch (error) {
        console.error('Error fetching settings:', error);
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
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500">Organization and account details.</p>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-10 text-center text-gray-500">
          Loading...
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold mb-4">Account</h2>
            {me ? (
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-500">Name</span>
                  <div className="font-medium">
                    {me.user.firstName || '—'} {me.user.lastName || ''}
                  </div>
                </div>
                <div>
                  <span className="text-gray-500">Email</span>
                  <div className="font-mono">{me.user.email}</div>
                </div>
                <div>
                  <span className="text-gray-500">Role</span>
                  <div className="font-mono">{me.user.role}</div>
                </div>
              </div>
            ) : (
              <div className="text-gray-500">Not signed in.</div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold mb-4">Organization</h2>
            {me ? (
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-500">Name</span>
                  <div className="font-medium">{me.organization.name}</div>
                </div>
                <div>
                  <span className="text-gray-500">ID</span>
                  <div className="font-mono text-xs break-all">{me.organization.id}</div>
                </div>
              </div>
            ) : (
              <div className="text-gray-500">—</div>
            )}
          </div>

          <div className="bg-blue-50 rounded-xl border border-blue-100 p-6 lg:col-span-2">
            <h2 className="text-lg font-bold text-blue-900 mb-2">Local Dev Login</h2>
            <div className="text-sm text-blue-900/80">
              Default seeded admin credentials:
              <div className="mt-2 font-mono text-xs bg-white/60 rounded-lg p-3 border border-blue-100">
                email: admin@fastbuild.local
                <br />
                password: Admin123!
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;

