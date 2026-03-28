import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useToast } from '../store/ToastContext';

const STEPS = [
  { key: 'about', title: 'About You', desc: 'Tell us about your role and experience' },
  { key: 'district', title: 'Your District', desc: 'Select your school district' },
  { key: 'challenges', title: 'Literacy Challenges', desc: 'What are you working on?' },
  { key: 'done', title: 'All Set!', desc: 'Your profile is ready' },
];

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ title: '', years_experience: 0, bio: '' });
  const [districtSearch, setDistrictSearch] = useState('');
  const [districts, setDistricts] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [problemStatements, setProblemStatements] = useState([]);
  const [selectedPS, setSelectedPS] = useState([]);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    api.get('/community/problem-statements/').then((r) => setProblemStatements(r.data || [])).catch(() => toast?.error('Failed to load challenges.'));
  }, []);

  useEffect(() => {
    if (districtSearch.length < 2) { setDistricts([]); return; }
    const t = setTimeout(() => {
      api.get(`/community/districts/?search=${encodeURIComponent(districtSearch)}`).then((r) => setDistricts(r.data || [])).catch(() => setDistricts([]));
    }, 300);
    return () => clearTimeout(t);
  }, [districtSearch]);

  const handleFinish = async () => {
    setSaving(true);
    try {
      await api.put('/community/profile/', {
        ...form,
        district_id: selectedDistrict?.id || null,
        problem_statement_ids: selectedPS,
        is_public: true,
      });
      toast?.success('Profile created! Welcome to the community.');
      navigate('/dashboard');
    } catch {
      toast?.error('Failed to save profile.');
    } finally { setSaving(false); }
  };

  const grouped = problemStatements.reduce((acc, ps) => {
    if (!acc[ps.display_category]) acc[ps.display_category] = [];
    acc[ps.display_category].push(ps);
    return acc;
  }, {});

  return (
    <main className="max-w-2xl mx-auto px-6 py-10">
      {/* Progress bar */}
      <div className="flex items-center gap-2 mb-10">
        {STEPS.map((s, i) => (
          <div key={s.key} className="flex items-center gap-2 flex-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all ${
              i < step ? 'bg-emerald-600 text-white' : i === step ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-400'
            }`}>
              {i < step ? <span className="material-symbols-outlined text-sm">check</span> : i + 1}
            </div>
            {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 ${i < step ? 'bg-emerald-500' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>

      <h1 className="font-headline text-2xl font-extrabold tracking-tight">{STEPS[step].title}</h1>
      <p className="text-gray-500 mt-1 mb-8">{STEPS[step].desc}</p>

      {/* Step 1: About */}
      {step === 0 && (
        <div className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Your Title / Role</label>
            <input type="text" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="e.g. Curriculum Director, Literacy Coach, Principal"
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Years of Experience</label>
            <input type="number" min={0} max={50} value={form.years_experience}
              onChange={(e) => setForm((f) => ({ ...f, years_experience: parseInt(e.target.value) || 0 }))}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Short Bio</label>
            <textarea rows={3} maxLength={500} value={form.bio}
              onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
              placeholder="Tell other members about your work and interests..."
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm" />
          </div>
          <button onClick={() => setStep(1)} disabled={!form.title}
            className="w-full py-3 bg-gray-900 text-white rounded-lg font-semibold text-sm hover:bg-gray-800 disabled:opacity-30">
            Continue
          </button>
        </div>
      )}

      {/* Step 2: District */}
      {step === 1 && (
        <div className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Search for your district</label>
            <input type="text" value={districtSearch} onChange={(e) => setDistrictSearch(e.target.value)}
              placeholder="Start typing your district name..."
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm" />
          </div>
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {districts.map((d) => (
              <button key={d.id} onClick={() => { setSelectedDistrict(d); setDistrictSearch(d.name); }}
                className={`w-full text-left p-4 rounded-lg border transition-all ${
                  selectedDistrict?.id === d.id ? 'border-emerald-500 bg-emerald-50' : 'border-gray-100 hover:border-gray-300'
                }`}>
                <p className="font-medium text-sm">{d.name}, {d.state}</p>
                <p className="text-xs text-gray-500">{d.display_type} &middot; {d.display_size} &middot; FRL: {parseFloat(d.free_reduced_lunch_pct).toFixed(0)}% &middot; ESL: {parseFloat(d.esl_pct).toFixed(0)}%</p>
              </button>
            ))}
          </div>
          {selectedDistrict && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
              <p className="text-sm font-medium text-emerald-900">Selected: {selectedDistrict.name}, {selectedDistrict.state}</p>
              <p className="text-xs text-emerald-700">Demographics will be auto-populated from public NCES data</p>
            </div>
          )}
          <div className="flex gap-3">
            <button onClick={() => setStep(0)} className="flex-1 py-3 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50">Back</button>
            <button onClick={() => setStep(2)} className="flex-1 py-3 bg-gray-900 text-white rounded-lg font-semibold text-sm hover:bg-gray-800">
              {selectedDistrict ? 'Continue' : 'Skip for Now'}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Challenges */}
      {step === 2 && (
        <div className="space-y-5">
          <p className="text-sm text-gray-500">Select the challenges you're currently facing. This is the most important factor in matching you with other leaders.</p>
          {Object.entries(grouped).map(([cat, items]) => (
            <div key={cat}>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{cat}</h3>
              <div className="space-y-1.5">
                {items.map((ps) => (
                  <button key={ps.id} onClick={() => setSelectedPS((prev) => prev.includes(ps.id) ? prev.filter((x) => x !== ps.id) : [...prev, ps.id])}
                    className={`w-full text-left p-3 rounded-lg border transition-all text-sm flex items-center gap-3 ${
                      selectedPS.includes(ps.id) ? 'border-emerald-500 bg-emerald-50 text-emerald-900' : 'border-gray-100 hover:border-gray-300 text-gray-700'
                    }`}>
                    <span className={`material-symbols-outlined text-base ${selectedPS.includes(ps.id) ? 'text-emerald-600' : 'text-gray-300'}`}
                      style={selectedPS.includes(ps.id) ? { fontVariationSettings: "'FILL' 1" } : {}}>
                      {selectedPS.includes(ps.id) ? 'check_circle' : 'radio_button_unchecked'}
                    </span>
                    {ps.title}
                  </button>
                ))}
              </div>
            </div>
          ))}
          <p className="text-sm text-emerald-600 font-medium">{selectedPS.length} challenge{selectedPS.length !== 1 ? 's' : ''} selected</p>
          <div className="flex gap-3">
            <button onClick={() => setStep(1)} className="flex-1 py-3 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50">Back</button>
            <button onClick={() => setStep(3)} disabled={selectedPS.length === 0}
              className="flex-1 py-3 bg-gray-900 text-white rounded-lg font-semibold text-sm hover:bg-gray-800 disabled:opacity-30">
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Done */}
      {step === 3 && (
        <div className="text-center py-10 space-y-6">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-4xl">check_circle</span>
          </div>
          <div>
            <p className="font-headline text-xl font-extrabold">You're all set!</p>
            <p className="text-gray-500 mt-2">Your profile is ready. You can now find matches and connect with other literacy leaders.</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 text-left space-y-2 max-w-sm mx-auto">
            <p className="text-sm"><span className="font-medium">Role:</span> {form.title}</p>
            {selectedDistrict && <p className="text-sm"><span className="font-medium">District:</span> {selectedDistrict.name}, {selectedDistrict.state}</p>}
            <p className="text-sm"><span className="font-medium">Challenges:</span> {selectedPS.length} selected</p>
          </div>
          <button onClick={handleFinish} disabled={saving}
            className="px-8 py-3 bg-emerald-600 text-white rounded-lg font-semibold text-sm hover:bg-emerald-500 disabled:opacity-50">
            {saving ? 'Saving...' : 'Go to Dashboard'}
          </button>
        </div>
      )}
    </main>
  );
}
