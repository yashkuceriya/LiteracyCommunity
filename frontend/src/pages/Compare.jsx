import { useState, useEffect } from 'react';
import api from '../api/client';
import { useToast } from '../store/ToastContext';

function MetricRow({ label, values, format, highlight }) {
  const max = Math.max(...values.filter((v) => v != null).map((v) => parseFloat(v) || 0));
  return (
    <tr className="border-t border-gray-50">
      <td className="py-3 pr-4 text-xs text-gray-500 font-medium whitespace-nowrap">{label}</td>
      {values.map((v, i) => {
        const isMax = highlight && parseFloat(v) === max && max > 0;
        return (
          <td key={i} className={`py-3 px-4 text-sm text-center ${isMax ? 'font-bold text-emerald-700' : ''}`}>
            {v != null ? (format ? format(v) : v) : '-'}
          </td>
        );
      })}
    </tr>
  );
}

export default function Compare() {
  const toast = useToast();
  const [districts, setDistricts] = useState([]);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selected, setSelected] = useState([]);
  const [comparison, setComparison] = useState([]);

  useEffect(() => {
    if (search.length < 2) { setSearchResults([]); return; }
    const t = setTimeout(() => {
      api.get(`/community/districts/?search=${encodeURIComponent(search)}`).then((r) => setSearchResults(r.data || [])).catch(() => setSearchResults([]));
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const addDistrict = (d) => {
    if (selected.length >= 4) return;
    if (selected.find((s) => s.id === d.id)) return;
    const next = [...selected, d];
    setSelected(next);
    setSearch('');
    setSearchResults([]);
    if (next.length >= 2) {
      api.post('/community/compare-districts/', { district_ids: next.map((s) => s.id) })
        .then((r) => setComparison(r.data || []))
        .catch(() => toast?.error('Failed to compare districts.'));
    }
  };

  const removeDistrict = (id) => {
    const next = selected.filter((s) => s.id !== id);
    setSelected(next);
    if (next.length >= 2) {
      api.post('/community/compare-districts/', { district_ids: next.map((s) => s.id) })
        .then((r) => setComparison(r.data || []))
        .catch(() => toast?.error('Failed to compare districts.'));
    } else {
      setComparison([]);
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-6 md:px-12 py-10">
      <div className="mb-8">
        <h1 className="font-headline text-3xl font-extrabold tracking-tight">Compare Districts</h1>
        <p className="text-gray-500 mt-1">Side-by-side demographic comparison of school districts</p>
      </div>

      {/* Search & Add */}
      <div className="bg-white border border-gray-100 rounded-xl p-6 mb-8">
        <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 block">
          Add districts to compare (up to 4)
        </label>
        <div className="relative">
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by district name..." disabled={selected.length >= 4}
            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm disabled:opacity-50" />
          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
              {searchResults.map((d) => (
                <button key={d.id} onClick={() => addDistrict(d)}
                  disabled={selected.find((s) => s.id === d.id)}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-50 disabled:opacity-30 text-sm">
                  <span className="font-medium">{d.name}, {d.state}</span>
                  <span className="text-gray-400 ml-2">{d.display_type} &middot; {d.display_size}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {selected.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {selected.map((d) => (
              <span key={d.id} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 text-sm rounded-full">
                {d.name}, {d.state}
                <button onClick={() => removeDistrict(d.id)} className="text-emerald-500 hover:text-red-500" aria-label={`Remove ${d.name}`}>
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Comparison Table */}
      {comparison.length >= 2 ? (
        <div className="bg-white border border-gray-100 rounded-xl overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Metric</th>
                {comparison.map((d) => (
                  <th key={d.id} className="py-3 px-4 text-center text-xs font-medium text-gray-900 uppercase tracking-wider">
                    {d.name}, {d.state}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <MetricRow label="District Type" values={comparison.map((d) => d.display_type)} />
              <MetricRow label="Size Category" values={comparison.map((d) => d.display_size)} />
              <MetricRow label="Enrollment" values={comparison.map((d) => d.enrollment)} format={(v) => parseInt(v).toLocaleString()} highlight />
              <MetricRow label="Free/Reduced Lunch" values={comparison.map((d) => d.free_reduced_lunch_pct)} format={(v) => `${parseFloat(v).toFixed(1)}%`} highlight />
              <MetricRow label="ESL Population" values={comparison.map((d) => d.esl_pct)} format={(v) => `${parseFloat(v).toFixed(1)}%`} highlight />
              <MetricRow label="State" values={comparison.map((d) => d.state)} />
              <MetricRow label="NCES ID" values={comparison.map((d) => d.nces_id || '-')} />
            </tbody>
          </table>

          {/* Visual comparison bars */}
          <div className="p-6 border-t border-gray-100 space-y-6">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Visual Comparison</h3>
            {[
              { label: 'Free/Reduced Lunch %', key: 'free_reduced_lunch_pct', max: 100 },
              { label: 'ESL %', key: 'esl_pct', max: 50 },
            ].map(({ label, key, max }) => (
              <div key={key}>
                <p className="text-xs text-gray-500 mb-2">{label}</p>
                {comparison.map((d, i) => {
                  const val = parseFloat(d[key]) || 0;
                  const colors = ['bg-emerald-500', 'bg-blue-500', 'bg-amber-500', 'bg-purple-500'];
                  return (
                    <div key={d.id} className="flex items-center gap-3 mb-1.5">
                      <span className="text-[11px] text-gray-500 w-20 truncate text-right">{d.state}</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                        <div className={`${colors[i]} h-full rounded-full`} style={{ width: `${(val / max) * 100}%` }} />
                      </div>
                      <span className="text-xs font-medium w-12 text-right">{val.toFixed(1)}%</span>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-20 bg-white border border-gray-100 rounded-xl">
          <span className="material-symbols-outlined text-gray-300 text-5xl mb-4 block">compare_arrows</span>
          <p className="font-headline font-bold text-lg">Select at least 2 districts</p>
          <p className="text-sm text-gray-500 mt-1">Search and add districts above to see a side-by-side comparison</p>
        </div>
      )}
    </main>
  );
}
