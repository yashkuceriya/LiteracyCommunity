import { useState, useEffect } from 'react';
import api from '../api/client';
import { useAuth } from '../store/AuthContext';
import { useToast } from '../store/ToastContext';

const TYPES = [
  { value: '', label: 'All Types' },
  { value: 'article', label: 'Articles' },
  { value: 'guide', label: 'Guides' },
  { value: 'research', label: 'Research' },
  { value: 'tool', label: 'Tools & Templates' },
  { value: 'video', label: 'Videos' },
  { value: 'webinar', label: 'Webinars' },
];

const TYPE_ICONS = {
  article: 'article', guide: 'menu_book', research: 'science',
  tool: 'handyman', video: 'play_circle', webinar: 'videocam', other: 'link',
};

export default function Resources() {
  const { user } = useAuth();
  const toast = useToast();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ type: '', search: '', ordering: '-created_at' });
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', url: '', resource_type: 'article' });
  const [problemStatements, setProblemStatements] = useState([]);
  const [selectedPS, setSelectedPS] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get('/community/problem-statements/').then((r) => setProblemStatements(r.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filter.type) params.set('type', filter.type);
    if (filter.search) params.set('search', filter.search);
    if (filter.ordering) params.set('ordering', filter.ordering);
    api.get(`/resources/?${params}`)
      .then((r) => setResources(r.data || []))
      .catch(() => setResources([]))
      .finally(() => setLoading(false));
  }, [filter]);

  const handleUpvote = async (id) => {
    try {
      const { data } = await api.post(`/resources/${id}/upvote/`);
      setResources((prev) => prev.map((r) =>
        r.id === id ? { ...r, upvote_count: data.upvote_count, is_upvoted: data.upvoted } : r
      ));
    } catch { toast?.error('Failed to upvote.'); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/resources/', { ...form, problem_statement_ids: selectedPS });
      toast?.success('Resource shared!');
      setShowCreate(false);
      setForm({ title: '', description: '', url: '', resource_type: 'article' });
      setSelectedPS([]);
      setFilter((f) => ({ ...f })); // re-fetch
    } catch {
      toast?.error('Failed to share resource.');
    } finally { setSubmitting(false); }
  };

  return (
    <main className="max-w-7xl mx-auto px-6 md:px-12 py-10">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="font-headline text-3xl font-extrabold tracking-tight">Resource Library</h1>
          <p className="text-gray-500 mt-1">Community-shared literacy resources, tools, and research</p>
        </div>
        <button onClick={() => setShowCreate(!showCreate)}
          className="px-5 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-semibold hover:bg-gray-800 transition-all flex items-center gap-2">
          <span className="material-symbols-outlined text-base">add</span>Share Resource
        </button>
      </div>

      {/* Create Form */}
      {showCreate && (
        <form onSubmit={handleCreate} className="bg-white border border-gray-100 rounded-xl p-6 mb-8 space-y-4">
          <h2 className="font-headline font-bold text-lg">Share a Resource</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <input type="text" required placeholder="Resource title" value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm" />
            <select value={form.resource_type} onChange={(e) => setForm((f) => ({ ...f, resource_type: e.target.value }))}
              className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm">
              {TYPES.filter((t) => t.value).map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <input type="url" placeholder="URL (https://...)" value={form.url}
            onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm" />
          <textarea placeholder="Brief description..." rows={3} value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm" />
          <div>
            <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wider">Related Challenges (optional)</p>
            <div className="flex flex-wrap gap-2">
              {problemStatements.map((ps) => (
                <button key={ps.id} type="button" onClick={() => setSelectedPS((prev) => prev.includes(ps.id) ? prev.filter((x) => x !== ps.id) : [...prev, ps.id])}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                    selectedPS.includes(ps.id) ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-200 text-gray-500 hover:border-gray-400'
                  }`}>{ps.title}</button>
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={submitting}
              className="px-6 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-semibold hover:bg-gray-800 disabled:opacity-50">
              {submitting ? 'Sharing...' : 'Share'}
            </button>
            <button type="button" onClick={() => setShowCreate(false)}
              className="px-6 py-2.5 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50">Cancel</button>
          </div>
        </form>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-8">
        <input type="text" placeholder="Search resources..." value={filter.search}
          onChange={(e) => setFilter((f) => ({ ...f, search: e.target.value }))}
          className="bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm w-64" />
        <select value={filter.type} onChange={(e) => setFilter((f) => ({ ...f, type: e.target.value }))}
          className="bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm">
          {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
        <select value={filter.ordering} onChange={(e) => setFilter((f) => ({ ...f, ordering: e.target.value }))}
          className="bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm">
          <option value="-created_at">Newest</option>
          <option value="popular">Most Popular</option>
        </select>
      </div>

      {/* Results */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => <div key={i} className="bg-white border border-gray-100 rounded-xl p-6 animate-pulse h-32" />)}
        </div>
      ) : resources.length === 0 ? (
        <div className="text-center py-20 bg-white border border-gray-100 rounded-xl">
          <span className="material-symbols-outlined text-gray-300 text-5xl mb-4 block">library_books</span>
          <p className="font-headline font-bold text-lg">No resources yet</p>
          <p className="text-sm text-gray-500 mt-1">Be the first to share a literacy resource</p>
        </div>
      ) : (
        <div className="space-y-4">
          {resources.map((r) => (
            <div key={r.id} className="bg-white border border-gray-100 rounded-xl p-6 hover:shadow-sm transition-all">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-xl">{TYPE_ICONS[r.resource_type] || 'link'}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="font-headline font-bold truncate">{r.title}</h3>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{r.description}</p>
                    </div>
                    <button onClick={() => handleUpvote(r.id)}
                      aria-label={r.is_upvoted ? 'Remove upvote' : 'Upvote this resource'}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border text-sm transition-all shrink-0 ${
                        r.is_upvoted ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-200 text-gray-500 hover:border-emerald-500'
                      }`}>
                      <span className="material-symbols-outlined text-base" style={r.is_upvoted ? { fontVariationSettings: "'FILL' 1" } : {}}>thumb_up</span>
                      {r.upvote_count}
                    </button>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 mt-3">
                    <span className="text-[11px] text-gray-400 px-2 py-0.5 bg-gray-50 rounded-full">{r.display_type}</span>
                    {r.url && (
                      <a href={r.url} target="_blank" rel="noopener noreferrer"
                        className="text-[11px] text-emerald-600 hover:underline flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">open_in_new</span>Visit
                      </a>
                    )}
                    <span className="text-[11px] text-gray-400">
                      by {r.author_detail?.first_name} {r.author_detail?.last_name} &middot; {new Date(r.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {r.problem_statements_detail?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {r.problem_statements_detail.slice(0, 3).map((ps) => (
                        <span key={ps.id} className="text-[10px] px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full truncate max-w-[180px]">{ps.title}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
