import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const startDemo = (providedEmail?: string) => {
    const safeEmail = (providedEmail || 'demo@example.com').trim() || 'demo@example.com';
    localStorage.setItem('token', 'demo-token');
    localStorage.setItem(
      'user',
      JSON.stringify({
        firstName: 'Demo',
        lastName: 'User',
        email: safeEmail,
      })
    );
    localStorage.setItem('demoMode', 'true');
    navigate('/');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      localStorage.setItem('token', response.data.token);
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      localStorage.removeItem('demoMode');
      navigate('/');
    } catch (err: any) {
      const message = err.response?.data?.message || 'Login failed';
      const status = err.response?.status;

      if (!status || status >= 500) {
        setError('Backend not set up yet. Starting in demo mode so you can preview the app.');
        startDemo(email);
        return;
      }

      setError(message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">
            CF
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Contractor Foreman AI</h1>
          <p className="text-gray-500 mt-2">Sign in to manage your construction projects</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input 
              required
              type="email" 
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input 
              required
              type="password" 
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button 
            type="submit"
            className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors mt-2"
          >
            Sign In
          </button>

          <button
            type="button"
            onClick={() => startDemo(email)}
            className="w-full border border-gray-200 text-gray-700 font-semibold py-3 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Continue in Demo Mode
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          New here? Contact your administrator for access.
        </p>
        
        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-400">
                Lego-block modular architecture v1.0
            </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
