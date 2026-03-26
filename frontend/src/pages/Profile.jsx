import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useToast } from '../store/ToastContext';

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [districts, setDistricts] = useState([]);
  const [problemStatements, setProblemStatements] = useState([]);
  const [districtSearch, setDistrictSearch] = useState('');
  const [selectedPS, setSelectedPS] = useState([]);
  const [form, setForm] = useState({ title: '', district_id: null, years_experience: 0, bio: '', is_public: true });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      api.get('/community/profile/'),
      api.get('/community/problem-statements/'),
    ]).then(([profileRes, psRes]) => {
      const p = profileRes.data;
      setProfile(p);
      setForm({
        title: p.title || '',
        district_id: p.district?.id || null,
        years_experience: p.years_experience || 0,
        bio: p.bio || '',
        is_public: p.is_public,
      });
      setSelectedPS(p.problem_statements?.map((ps) => ps.id) || []);
      setProblemStatements(psRes.data || []);
      if (p.district) {
        setDistrictSearch(p.district.name);
        setDistricts([p.district]);
      }
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (districtSearch.length < 2) { setDistricts([]); return; }
    const t = setTimeout(() => {
      api.get(`/community/districts/?search=${encodeURIComponent(districtSearch)}`).then((r) => setDistricts(r.data || [])).catch(() => {});
    }, 300);
    return () => clearTimeout(t);
  }, [districtSearch]);

  const togglePS = (id) => {
    setSelectedPS((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/community/profile/', { ...form, problem_statement_ids: selectedPS });
      toast?.success('Profile updated!');
      navigate('/dashboard');
    } catch (err) {
      toast?.error('Failed to save profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-24"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" /></div>;

  const grouped = problemStatements.reduce((acc, ps) => {
    if (!acc[ps.display_category]) acc[ps.display_category] = [];
    acc[ps.display_category].push(ps);
    return acc;
  }, {});

  return (
    <main className="max-w-3xl mx-auto px-6 md:px-12 py-10">
      <h1 className="font-headline text-3xl font-extrabold tracking-tight mb-2">My Profile</h1>
      <p className="text-gray-500 mb-8">Your profile helps our matching algorithm find the best connections for you.</p>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info */}
        <section className="bg-white border border-gray-100 rounded-xl p-6 space-y-5">
          <h2 className="font-headline font-bold text-lg">About You</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Title / Role</label>
              <input type="text" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="e.g. Curriculum Director"
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Years of Experience</label>
              <input type="number" min={0} max={50} value={form.years_experience}
                onChange={(e) => setForm((f) => ({ ...f, years_experience: parseInt(e.target.value) || 0 }))}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Bio</label>
            <textarea value={form.bio} onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
              rows={3} maxLength={500} placeholder="Tell other members about your work..."
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
            <p className="text-xs text-gray-400 text-right">{form.bio.length}/500</p>
          </div>
        </section>

        {/* District Selection */}
        <section className="bg-white border border-gray-100 rounded-xl p-6 space-y-5">
          <h2 className="font-headline font-bold text-lg">Your District</h2>
          <p className="text-sm text-gray-500">Search for your school district. Demographic data is automatically populated from public NCES records.</p>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Search Districts</label>
            <input type="text" value={districtSearch} onChange={(e) => setDistrictSearch(e.target.value)}
              placeholder="Type district name..."
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
          </div>
          {districts.length > 0 && (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {districts.map((d) => (
                <button key={d.id} type="button" onClick={() => { setForm((f) => ({ ...f, district_id: d.id })); setDistrictSearch(d.name); }}
                  className={`w-full text-left p-4 rounded-lg border transition-all ${
                    form.district_id === d.id ? 'border-emerald-500 bg-emerald-50' : 'border-gray-100 hover:border-gray-300'
                  }`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-sm">{d.name}, {d.state}</p>
                      <p className="text-xs text-gray-500">{d.display_type} &middot; {d.display_size}</p>
                    </div>
                    <div className="text-right text-xs text-gray-400">
                      <p>FRL: {parseFloat(d.free_reduced_lunch_pct).toFixed(0)}%</p>
                      <p>ESL: {parseFloat(d.esl_pct).toFixed(0)}%</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Problem Statements */}
        <section className="bg-white border border-gray-100 rounded-xl p-6 space-y-5">
          <h2 className="font-headline font-bold text-lg">Literacy Challenges</h2>
          <p className="text-sm text-gray-500">Select the challenges you're currently working on. This is the most important factor for matching.</p>
          {Object.entries(grouped).map(([category, items]) => (
            <div key={category}>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">{category}</h3>
              <div className="space-y-2">
                {items.map((ps) => (
                  <button key={ps.id} type="button" onClick={() => togglePS(ps.id)}
                    className={`w-full text-left p-3.5 rounded-lg border transition-all text-sm ${
                      selectedPS.includes(ps.id) ? 'border-emerald-500 bg-emerald-50 text-emerald-900' : 'border-gray-100 hover:border-gray-300 text-gray-700'
                    }`}>
                    <div className="flex items-center gap-3">
                      <span className={`material-symbols-outlined text-base ${selectedPS.includes(ps.id) ? 'text-emerald-600' : 'text-gray-300'}`}
                        style={selectedPS.includes(ps.id) ? { fontVariationSettings: "'FILL' 1" } : {}}>
                        {selectedPS.includes(ps.id) ? 'check_circle' : 'radio_button_unchecked'}
                      </span>
                      <div className="min-w-0">
                        <p className="font-medium truncate">{ps.title}</p>
                        {ps.description && <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{ps.description}</p>}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
          <p className="text-sm text-gray-500">{selectedPS.length} challenge{selectedPS.length !== 1 ? 's' : ''} selected</p>
        </section>

        {/* Visibility */}
        <section className="bg-white border border-gray-100 rounded-xl p-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.is_public}
              onChange={(e) => setForm((f) => ({ ...f, is_public: e.target.checked }))}
              className="w-5 h-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
            <div>
              <p className="font-medium text-sm">Public Profile</p>
              <p className="text-xs text-gray-500">Visible in the directory and available for matching</p>
            </div>
          </label>
        </section>

        <button type="submit" disabled={saving}
          className="w-full py-3.5 bg-gray-900 text-white rounded-lg font-semibold text-sm hover:bg-gray-800 transition-all disabled:opacity-50">
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </form>
    </main>
  );
}
