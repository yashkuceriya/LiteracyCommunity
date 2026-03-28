import { useState, useEffect } from 'react';
import api from '../api/client';

function Bar({ label, value, maxValue, color = 'bg-emerald-500' }) {
  const pct = maxValue > 0 ? (value / maxValue) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-gray-500 w-28 truncate text-right">{label}</span>
      <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
        <div className={`${color} h-full rounded-full transition-all duration-500`} style={{ width: `${Math.max(pct, 2)}%` }} />
      </div>
      <span className="text-xs font-medium text-gray-700 w-8 text-right">{value}</span>
    </div>
  );
}

function StatCard({ icon, label, value, sub }) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-6 text-center">
      <span className="material-symbols-outlined text-gray-300 text-3xl mb-2 block">{icon}</span>
      <p className="font-headline text-3xl font-extrabold">{value}</p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
      {sub && <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

const TYPE_LABELS = { urban: 'Urban', suburban: 'Suburban', rural: 'Rural', town: 'Town' };
const TYPE_COLORS = { urban: 'bg-blue-500', suburban: 'bg-emerald-500', rural: 'bg-amber-500', town: 'bg-purple-500' };

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/community/analytics/').then((r) => setData(r.data)).catch(() => setData(null)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-24"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" /></div>;
  if (!data) return <div className="text-center py-24 text-gray-500">Unable to load analytics</div>;

  const maxByState = Math.max(...(data.members_by_state || []).map((s) => s.count), 1);
  const maxByProblem = Math.max(...(data.top_problem_statements || []).map((p) => p.member_count), 1);

  return (
    <main className="max-w-7xl mx-auto px-6 md:px-12 py-10">
      <div className="mb-10">
        <h1 className="font-headline text-3xl font-extrabold tracking-tight">Community Insights</h1>
        <p className="text-gray-500 mt-1">Analytics and trends across the literacy leaders network</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        <StatCard icon="groups" label="Active Members" value={data.total_members} />
        <StatCard icon="location_city" label="Districts Represented" value={data.total_districts} />
        <StatCard icon="forum" label="Conversations" value={data.total_conversations} />
        <StatCard icon="chat" label="Messages Exchanged" value={data.total_messages} />
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Members by District Type */}
        <section className="bg-white border border-gray-100 rounded-xl p-6">
          <h2 className="font-headline font-bold text-lg mb-6">Members by District Type</h2>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(TYPE_LABELS).map(([key, label]) => {
              const count = data.members_by_district_type?.[key] || 0;
              const total = Object.values(data.members_by_district_type || {}).reduce((a, b) => a + b, 0) || 1;
              const pct = Math.round((count / total) * 100);
              return (
                <div key={key} className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className={`w-12 h-12 ${TYPE_COLORS[key]} bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-2`}>
                    <span className={`text-lg font-bold ${TYPE_COLORS[key].replace('bg-', 'text-')}`}>{count}</span>
                  </div>
                  <p className="text-sm font-medium">{label}</p>
                  <p className="text-xs text-gray-400">{pct}% of members</p>
                </div>
              );
            })}
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
            <div className="text-center">
              <p className="text-2xl font-headline font-extrabold">{data.avg_free_reduced_lunch}%</p>
              <p className="text-xs text-gray-500">Avg Free/Reduced Lunch</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-headline font-extrabold">{data.avg_esl}%</p>
              <p className="text-xs text-gray-500">Avg ESL Population</p>
            </div>
          </div>
        </section>

        {/* Members by State */}
        <section className="bg-white border border-gray-100 rounded-xl p-6">
          <h2 className="font-headline font-bold text-lg mb-6">Top States</h2>
          <div className="space-y-3">
            {(data.members_by_state || []).map((s) => (
              <Bar key={s.district__state} label={s.district__state} value={s.count} maxValue={maxByState} />
            ))}
          </div>
        </section>

        {/* Top Problem Statements */}
        <section className="bg-white border border-gray-100 rounded-xl p-6 lg:col-span-2">
          <h2 className="font-headline font-bold text-lg mb-6">Top Literacy Challenges</h2>
          <div className="space-y-3">
            {(data.top_problem_statements || []).map((p) => (
              <Bar key={p.id} label={p.title} value={p.member_count} maxValue={maxByProblem} color="bg-emerald-500" />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
