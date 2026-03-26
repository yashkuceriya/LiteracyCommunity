import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import { useToast } from '../store/ToastContext';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const from = location.state?.from || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(username, password);
      toast?.success('Welcome back!');
      navigate(from, { replace: true });
    } catch (err) {
      const s = err.response?.status;
      setError(
        s === 401 ? 'Incorrect username or password.' :
        s === 403 ? 'Your account has been suspended.' :
        'Unable to sign in. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-headline text-2xl font-extrabold tracking-tight">Welcome Back</h1>
          <p className="text-sm text-gray-500 mt-2">Sign in to your community account</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm space-y-5">
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">{error}</div>
          )}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Username</label>
            <input type="text" required value={username} onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Password</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-3 bg-gray-900 text-white rounded-lg font-semibold text-sm hover:bg-gray-800 transition-all disabled:opacity-50">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
          <p className="text-center text-xs text-gray-500">
            No account? <Link to="/register" className="text-emerald-600 font-medium hover:underline">Join the community</Link>
          </p>
        </form>
        <p className="text-center text-[11px] text-gray-400 mt-4">
          Demo: username <strong>sarah_chen</strong> / password <strong>password123</strong>
        </p>
      </div>
    </div>
  );
}
