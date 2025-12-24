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
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('MEMBER');
  const [inviteToken, setInviteToken] = useState<string | null>(null);
  const [invites, setInvites] = useState<any[]>([]);

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
        const inv = await axios.get('/api/invites', { headers });
        setInvites(inv.data);
      } catch (error) {
        console.error('Error fetching settings:', error);
      } finally {
        setLoading(false);
      }
    };
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const createInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isDemoMode()) return;
    try {
      setInviteLoading(true);
      const resp = await axios.post(
        '/api/invites',
        { email: inviteEmail, role: inviteRole, expiresInDays: 7 },
        { headers }
      );
      setInviteToken(resp.data.token);
      const inv = await axios.get('/api/invites', { headers });
      setInvites(inv.data);
    } catch (error) {
      console.error('Error creating invite:', error);
      alert('Error creating invite (need Owner/Admin/Manager role)');
    } finally {
      setInviteLoading(false);
    }
  };

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

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:col-span-2">
            <h2 className="text-lg font-bold mb-4">Invites</h2>
            <p className="text-sm text-gray-500 mb-4">Create an invite token (paste it to the new user for sign-up).</p>

            <form onSubmit={createInvite} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  required
                  className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Role</label>
                <select
                  className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                >
                  <option value="MEMBER">MEMBER</option>
                  <option value="FOREMAN">FOREMAN</option>
                  <option value="ACCOUNTANT">ACCOUNTANT</option>
                  <option value="MANAGER">MANAGER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>
              <button
                disabled={inviteLoading}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-60"
              >
                {inviteLoading ? 'Creating…' : 'Create Invite'}
              </button>
            </form>

            {inviteToken && (
              <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="text-sm font-medium text-gray-800 mb-1">Invite token (copy):</div>
                <div className="font-mono text-xs break-all">{inviteToken}</div>
                <div className="text-xs text-gray-500 mt-2">
                  New user can redeem it with `POST /api/invites/accept` (UI coming next).
                </div>
              </div>
            )}

            <div className="mt-6">
              <div className="text-sm font-medium text-gray-700 mb-2">Recent invites</div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="text-gray-500">
                      <th className="py-2 pr-4">Email</th>
                      <th className="py-2 pr-4">Role</th>
                      <th className="py-2 pr-4">Preview</th>
                      <th className="py-2 pr-4">Expires</th>
                      <th className="py-2 pr-4">Accepted</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-700">
                    {invites.map((inv) => (
                      <tr key={inv.id} className="border-t">
                        <td className="py-2 pr-4">{inv.email}</td>
                        <td className="py-2 pr-4 font-mono text-xs">{inv.role}</td>
                        <td className="py-2 pr-4 font-mono text-xs">{inv.tokenPreview || '—'}</td>
                        <td className="py-2 pr-4">{new Date(inv.expiresAt).toLocaleString()}</td>
                        <td className="py-2 pr-4">{inv.acceptedAt ? new Date(inv.acceptedAt).toLocaleString() : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
