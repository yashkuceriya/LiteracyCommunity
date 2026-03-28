import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import { useToast } from '../store/ToastContext';

export default function Register() {
  const [form, setForm] = useState({
    username: '', email: '', password: '', password2: '', first_name: '', last_name: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const update = (f, v) => setForm((p) => ({ ...p, [f]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await register(form);
      toast?.success(`Welcome, ${form.first_name}! Let's set up your profile.`);
      navigate('/onboarding');
    } catch (err) {
      const d = err.response?.data;
      setError(d ? Object.values(d).flat().join(' ') : 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-headline text-2xl font-extrabold tracking-tight">Join the Community</h1>
          <p className="text-sm text-gray-500 mt-2">Create your account to connect with literacy leaders</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm space-y-5">
          {error && <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">{error}</div>}
          <div className="grid grid-cols-2 gap-4">
            {[['first_name', 'First Name'], ['last_name', 'Last Name']].map(([f, label]) => (
              <div key={f} className="space-y-1.5">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</label>
                <input type="text" required value={form[f]} onChange={(e) => update(f, e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all" />
              </div>
            ))}
          </div>
          {[['username', 'Username', 'text'], ['email', 'Email', 'email']].map(([f, label, type]) => (
            <div key={f} className="space-y-1.5">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</label>
              <input type={type} required value={form[f]} onChange={(e) => update(f, e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all" />
            </div>
          ))}
          <div className="grid grid-cols-2 gap-4">
            {[['password', 'Password'], ['password2', 'Confirm Password']].map(([f, label]) => (
              <div key={f} className="space-y-1.5">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</label>
                <input type="password" required minLength={8} value={form[f]} onChange={(e) => update(f, e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all" />
              </div>
            ))}
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-3 bg-gray-900 text-white rounded-lg font-semibold text-sm hover:bg-gray-800 transition-all disabled:opacity-50">
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
          <p className="text-center text-xs text-gray-500">
            Already a member? <Link to="/login" className="text-emerald-600 font-medium hover:underline">Sign In</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
