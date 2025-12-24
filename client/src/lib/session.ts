export type SessionUser = {
  id?: string;
  email?: string;
  firstName?: string | null;
  lastName?: string | null;
  organizationId?: string;
  role?: string;
};

export const getToken = () => localStorage.getItem('token') || '';

export const isDemoMode = () => localStorage.getItem('demoMode') === 'true' || getToken() === 'demo-token';

export const getStoredUser = (): SessionUser | null => {
  const raw = localStorage.getItem('user');
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SessionUser;
  } catch {
    return null;
  }
};

export const getUserInitials = (user: SessionUser | null) => {
  const first = (user?.firstName || '').trim();
  const last = (user?.lastName || '').trim();
  const a = first ? first[0] : 'U';
  const b = last ? last[0] : 'S';
  return `${a}${b}`.toUpperCase();
};

