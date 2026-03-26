import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import api from '../api/client';
import MemberCard from '../components/MemberCard';

export default function Dashboard() {
  const { user } = useAuth();
  const [hasProfile, setHasProfile] = useState(null);
  const [topMatches, setTopMatches] = useState([]);
  const [stats, setStats] = useState({ members: 0, districts: 0, problems: 0 });

  useEffect(() => {
    api.get('/community/profile/')
      .then((r) => {
        setHasProfile(!!(r.data.district || r.data.problem_statements?.length));
      })
      .catch(() => setHasProfile(false));

    api.get('/community/matches/')
      .then((r) => setTopMatches((r.data || []).slice(0, 3)))
      .catch(() => {});

    api.get('/community/directory/').then((r) => setStats((s) => ({ ...s, members: r.data.count || 0 }))).catch(() => {});
    api.get('/community/districts/').then((r) => setStats((s) => ({ ...s, districts: (r.data || []).length }))).catch(() => {});
    api.get('/community/problem-statements/').then((r) => setStats((s) => ({ ...s, problems: (r.data || []).length }))).catch(() => {});
  }, []);

  const nav = [
    { to: '/profile', icon: 'person', title: 'My Profile', desc: 'Update your district info and literacy challenges.' },
    { to: '/directory', icon: 'groups', title: 'Directory', desc: 'Browse and search all community members.' },
    { to: '/matches', icon: 'hub', title: 'Find Matches', desc: 'Discover leaders facing similar challenges.' },
    { to: '/messages', icon: 'chat', title: 'Messages', desc: 'Private conversations with your network.' },
  ];

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
          <Link to="/profile" className="px-6 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-500 transition-all">
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
