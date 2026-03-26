import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import api from '../api/client';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    navigate('/');
  };

  useEffect(() => {
    if (!user) return;
    const f = () => api.get('/messaging/unread-count/').then((r) => setUnreadCount(r.data.unread_count || 0)).catch(() => {});
    f();
    const i = setInterval(f, 30000);
    return () => clearInterval(i);
  }, [user]);

  return (
    <header className="sticky top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/60">
      <nav className="flex items-center justify-between px-6 md:px-12 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-10">
          <Link to="/" className="font-headline text-xl font-extrabold tracking-tight text-gray-900">
            Literacy Leaders
          </Link>
          {user && (
            <div className="hidden md:flex items-center gap-6">
              <Link to="/dashboard" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Dashboard</Link>
              <Link to="/directory" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Directory</Link>
              <Link to="/matches" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Matches</Link>
              <Link to="/messages" className="relative text-sm text-gray-600 hover:text-gray-900 transition-colors">
                Messages
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-4 min-w-[18px] h-[18px] flex items-center justify-center bg-emerald-600 text-white text-[10px] font-bold rounded-full px-1">
                    {unreadCount}
                  </span>
                )}
              </Link>
              {user.role !== 'member' && (
                <Link to="/moderation" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Moderation</Link>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="w-8 h-8 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-sm font-bold">
                  {(user.first_name?.[0] || user.username[0]).toUpperCase()}
                </div>
                <span className="hidden sm:inline text-sm font-medium text-gray-700">{user.first_name}</span>
              </button>
              {profileOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 z-20 py-2 text-sm">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="font-headline font-bold">{user.first_name} {user.last_name}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                    <Link to="/profile" onClick={() => setProfileOpen(false)} className="block px-4 py-2.5 hover:bg-gray-50 transition-colors">My Profile</Link>
                    <Link to="/dashboard" onClick={() => setProfileOpen(false)} className="block px-4 py-2.5 hover:bg-gray-50 transition-colors">Dashboard</Link>
                    <hr className="my-1 border-gray-100" />
                    <button onClick={handleLogout} className="block w-full text-left px-4 py-2.5 hover:bg-gray-50 text-red-600 transition-colors">Sign Out</button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:border-gray-900 hover:bg-gray-50 transition-all">
                Sign In
              </Link>
              <Link to="/register" className="px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-all">
                Join Community
              </Link>
            </div>
          )}

          <button className="md:hidden p-2" onClick={() => setMenuOpen(!menuOpen)}>
            <span className="material-symbols-outlined text-xl">
              {menuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </nav>

      {menuOpen && user && (
        <div className="md:hidden px-6 pb-4 space-y-1 border-t border-gray-100">
          {[
            ['/dashboard', 'Dashboard'],
            ['/directory', 'Directory'],
            ['/matches', 'Matches'],
            ['/messages', `Messages${unreadCount > 0 ? ` (${unreadCount})` : ''}`],
            ['/profile', 'My Profile'],
            ...(user.role !== 'member' ? [['/moderation', 'Moderation']] : []),
          ].map(([to, label]) => (
            <Link key={to} to={to} onClick={() => setMenuOpen(false)} className="block py-2.5 text-sm text-gray-600 hover:text-gray-900">
              {label}
            </Link>
          ))}
          <button onClick={() => { handleLogout(); setMenuOpen(false); }} className="block py-2.5 text-sm text-red-600">
            Sign Out
          </button>
        </div>
      )}
    </header>
  );
}
