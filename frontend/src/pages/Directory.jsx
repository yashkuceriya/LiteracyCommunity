import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useToast } from '../store/ToastContext';
import MemberCard from '../components/MemberCard';

const STATES = [
  'AL','AR','CA','CO','FL','GA','IA','ID','IL','IN','KS','KY','MA','MD','ME','MI','MN','MO','MS','NC','PA','SD','TN','TX','VA','WV',
];

export default function Directory() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [problemStatements, setProblemStatements] = useState([]);
  const [filters, setFilters] = useState({ search: '', state: '', district_type: '', size: '', problem: '' });
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    api.get('/community/problem-statements/').then((r) => setProblemStatements(r.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(false);
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
    params.set('page', page);
    api.get(`/community/directory/?${params}`)
      .then((r) => { setMembers(r.data.results || []); setTotalCount(r.data.count || 0); })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [filters, page]);

  const updateFilter = (key, value) => { setFilters((f) => ({ ...f, [key]: value })); setPage(1); };

  const handleMessage = async (userId) => {
    try {
      const { data } = await api.post('/messaging/conversations/', { recipient_id: userId });
      navigate(`/messages/${data.id}`);
    } catch {
      toast?.error('Failed to start conversation.');
    }
  };

  const totalPages = Math.ceil(totalCount / 20);

  return (
    <main className="max-w-7xl mx-auto px-6 md:px-12 py-10">
      <div className="mb-8">
        <h1 className="font-headline text-3xl font-extrabold tracking-tight">Member Directory</h1>
        <p className="text-gray-500 mt-1">{totalCount} community members</p>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-100 rounded-xl p-5 mb-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <input type="text" placeholder="Search members..." value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            aria-label="Search members"
            className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
          <select value={filters.state} onChange={(e) => updateFilter('state', e.target.value)}
            aria-label="Filter by state"
            className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
            <option value="">All States</option>
            {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={filters.district_type} onChange={(e) => updateFilter('district_type', e.target.value)}
            aria-label="Filter by district type"
            className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
            <option value="">All Types</option>
            <option value="urban">Urban</option>
            <option value="suburban">Suburban</option>
            <option value="rural">Rural</option>
            <option value="town">Town</option>
          </select>
          <select value={filters.size} onChange={(e) => updateFilter('size', e.target.value)}
            aria-label="Filter by district size"
            className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
            <option value="">All Sizes</option>
            <option value="small">Small (&lt;1K)</option>
            <option value="medium">Medium (1K–5K)</option>
            <option value="large">Large (5K–25K)</option>
            <option value="very_large">Very Large (25K+)</option>
          </select>
          <select value={filters.problem} onChange={(e) => updateFilter('problem', e.target.value)}
            aria-label="Filter by challenge area"
            className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
            <option value="">All Challenges</option>
            {problemStatements.map((ps) => <option key={ps.id} value={ps.id}>{ps.title}</option>)}
          </select>
        </div>
        {Object.values(filters).some((v) => v) && (
          <button onClick={() => { setFilters({ search: '', state: '', district_type: '', size: '', problem: '' }); setPage(1); }}
            className="mt-3 text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
            aria-label="Clear all filters">
            <span className="material-symbols-outlined text-sm" aria-hidden="true">close</span>Clear filters
          </button>
        )}
      </div>

      {/* Results */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white border border-gray-100 rounded-xl p-6 animate-pulse">
              <div className="flex gap-4"><div className="w-12 h-12 bg-gray-200 rounded-full" /><div className="flex-1 space-y-2"><div className="h-4 bg-gray-200 rounded w-3/4" /><div className="h-3 bg-gray-200 rounded w-1/2" /></div></div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-20 bg-white border border-gray-100 rounded-xl">
          <span className="material-symbols-outlined text-gray-300 text-5xl mb-4 block" aria-hidden="true">error</span>
          <p className="font-headline font-bold text-lg">Failed to load directory</p>
          <p className="text-sm text-gray-500 mt-1">Please try refreshing the page.</p>
        </div>
      ) : members.length > 0 ? (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {members.map((m) => <MemberCard key={m.id} profile={m} onMessage={handleMessage} />)}
          </div>
          {totalPages > 1 && (
            <nav className="mt-10 flex items-center justify-center gap-2" aria-label="Pagination">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                aria-label="Previous page"
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-30">
                Previous
              </button>
              <span className="text-sm text-gray-500 px-4">Page {page} of {totalPages}</span>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                aria-label="Next page"
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-30">
                Next
              </button>
            </nav>
          )}
        </>
      ) : (
        <div className="text-center py-20 bg-white border border-gray-100 rounded-xl">
          <span className="material-symbols-outlined text-gray-300 text-5xl mb-4 block" aria-hidden="true">search_off</span>
          <p className="font-headline font-bold text-lg">No members found</p>
          <p className="text-sm text-gray-500 mt-1">Try adjusting your filters</p>
        </div>
      )}
    </main>
  );
}
