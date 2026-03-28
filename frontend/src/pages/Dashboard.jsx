import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import api from '../api/client';
import MemberCard from '../components/MemberCard';

export default function Dashboard() {
  const { user } = useAuth();
  const [hasProfile, setHasProfile] = useState(null);
  const [topMatches, setTopMatches] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [stats, setStats] = useState({ members: 0, districts: 0, problems: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    Promise.allSettled([
      api.get('/community/profile/').then((r) => {
        setHasProfile(!!(r.data.district || r.data.problem_statements?.length));
      }),
      api.get('/community/matches/').then((r) => setTopMatches((r.data || []).slice(0, 3))),
      api.get('/community/announcements/').then((r) => setAnnouncements((r.data || []).slice(0, 3))),
      api.get('/community/directory/').then((r) => setStats((s) => ({ ...s, members: r.data.count || 0 }))),
      api.get('/community/districts/').then((r) => setStats((s) => ({ ...s, districts: (r.data || []).length }))),
      api.get('/community/problem-statements/').then((r) => setStats((s) => ({ ...s, problems: (r.data || []).length }))),
    ]).then((results) => {
      // Profile check failing means profile doesn't exist yet
      if (results[0].status === 'rejected') setHasProfile(false);
      // If critical calls fail, show error
      const criticalFailed = results[3].status === 'rejected' && results[4].status === 'rejected';
      if (criticalFailed) setError(true);
      setLoading(false);
    });
  }, []);

  const nav = [
    { to: '/matches', icon: 'hub', title: 'Find Matches', desc: 'Discover leaders facing similar challenges.' },
    { to: '/directory', icon: 'groups', title: 'Directory', desc: 'Browse and search all community members.' },
    { to: '/messages', icon: 'chat', title: 'Messages', desc: 'Private conversations with your network.' },
    { to: '/resources', icon: 'library_books', title: 'Resources', desc: 'Shared literacy tools, guides, and research.' },
    { to: '/compare', icon: 'compare_arrows', title: 'Compare Districts', desc: 'Side-by-side demographic comparisons.' },
    { to: '/analytics', icon: 'insights', title: 'Insights', desc: 'Community analytics and trends.' },
    { to: '/profile', icon: 'person', title: 'My Profile', desc: 'Update your district info and challenges.' },
    ...(user?.role !== 'member' ? [{ to: '/moderation', icon: 'shield', title: 'Moderation', desc: 'Review flagged content and manage users.' }] : []),
  ];

  if (loading) {
    return (
      <main className="max-w-7xl mx-auto px-6 md:px-12 py-10">
        <div className="mb-10">
          <div className="h-8 w-72 bg-gray-100 rounded animate-pulse" />
          <div className="h-4 w-56 bg-gray-50 rounded animate-pulse mt-3" />
        </div>
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[1, 2, 3].map((i) => <div key={i} className="bg-white border border-gray-100 rounded-xl p-5 h-24 animate-pulse" />)}
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <div key={i} className="bg-white border border-gray-100 rounded-xl p-6 h-32 animate-pulse" />)}
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="max-w-7xl mx-auto px-6 md:px-12 py-10">
        <div className="text-center py-24 bg-white border border-gray-100 rounded-xl">
          <span className="material-symbols-outlined text-gray-300 text-5xl mb-4 block">error</span>
          <p className="font-headline font-bold text-lg">Something went wrong</p>
          <p className="text-sm text-gray-500 mt-1">Unable to load dashboard data. Please try refreshing.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-6 md:px-12 py-10">
      <div className="mb-10">
        <h1 className="font-headline text-3xl font-extrabold tracking-tight">
          Welcome back, {user?.first_name || user?.username}
        </h1>
        <p className="text-gray-500 mt-1">Your literacy leadership community dashboard.</p>
      </div>

      {hasProfile === false && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="material-symbols-outlined text-emerald-600 text-2xl">person_add</span>
            <div>
              <p className="font-headline font-bold text-emerald-900">Complete Your Profile</p>
              <p className="text-sm text-emerald-700">Select your district and challenges to start getting matched.</p>
            </div>
          </div>
          <Link to="/onboarding" className="px-6 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-500 transition-all">
            Set Up Profile
          </Link>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        {[
          { label: 'Members', value: stats.members, icon: 'groups' },
          { label: 'Districts', value: stats.districts, icon: 'location_city' },
          { label: 'Challenge Areas', value: stats.problems, icon: 'checklist' },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-gray-100 rounded-xl p-5 text-center">
            <span className="material-symbols-outlined text-gray-400 mb-2 block">{s.icon}</span>
            <p className="font-headline text-2xl font-extrabold">{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Announcements */}
      {announcements.length > 0 && (
        <div className="mb-10 space-y-3">
          {announcements.map((a) => (
            <div key={a.id} className={`bg-white border rounded-xl p-5 flex items-start gap-4 ${a.pinned ? 'border-emerald-200 bg-emerald-50/50' : 'border-gray-100'}`}>
              <span className="material-symbols-outlined text-emerald-600 mt-0.5">{a.pinned ? 'push_pin' : 'campaign'}</span>
              <div className="min-w-0">
                <h3 className="font-headline font-bold text-sm">{a.title}</h3>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{a.content}</p>
                <p className="text-[11px] text-gray-400 mt-2">
                  {a.author_detail?.first_name} {a.author_detail?.last_name} &middot; {new Date(a.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Nav */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        {nav.map((item) => (
          <Link key={item.to} to={item.to}
            className="bg-white border border-gray-100 rounded-xl p-6 hover:border-gray-300 hover:shadow-sm transition-all group">
            <span className="material-symbols-outlined text-2xl text-gray-400 group-hover:text-emerald-600 transition-colors mb-3 block">{item.icon}</span>
            <h3 className="font-headline font-bold mb-1">{item.title}</h3>
            <p className="text-sm text-gray-500">{item.desc}</p>
          </Link>
        ))}
      </div>

      {/* Top Matches Preview */}
      {topMatches.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-headline text-xl font-extrabold tracking-tight">Top Matches</h2>
            <Link to="/matches" className="text-sm font-medium text-emerald-600 hover:underline">View All</Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {topMatches.map((m) => (
              <MemberCard key={m.profile.id} profile={m.profile} score={m.score} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
