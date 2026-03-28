import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useToast } from '../store/ToastContext';
import MemberCard from '../components/MemberCard';

export default function Matches() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasProfile, setHasProfile] = useState(true);
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    api.get('/community/matches/')
      .then((r) => setMatches(r.data || []))
      .catch((err) => {
        if (err.response?.status === 400) setHasProfile(false);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleMessage = async (userId) => {
    try {
      const { data } = await api.post('/messaging/conversations/', { recipient_id: userId });
      navigate(`/messages/${data.id}`);
    } catch {
      toast?.error('Failed to start conversation.');
    }
  };

  if (loading) return <div className="flex justify-center py-24"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" /></div>;

  return (
    <main className="max-w-7xl mx-auto px-6 md:px-12 py-10">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="font-headline text-3xl font-extrabold tracking-tight">Your Matches</h1>
          <p className="text-gray-500 mt-1">Leaders matched by district demographics and shared challenges</p>
        </div>
        {matches.length > 0 && (
          <a href="/api/community/matches/export/" target="_blank" rel="noopener noreferrer"
            className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:border-gray-400 transition-all flex items-center gap-2">
            <span className="material-symbols-outlined text-base">download</span>Export CSV
          </a>
        )}
      </div>

      {!hasProfile ? (
        <div className="text-center py-20 bg-white border border-gray-100 rounded-xl">
          <span className="material-symbols-outlined text-gray-300 text-5xl mb-4 block">person_add</span>
          <p className="font-headline font-bold text-lg mb-2">Complete Your Profile First</p>
          <p className="text-sm text-gray-500 mb-6">We need your district and challenge selections to find matches.</p>
          <Link to="/profile" className="px-6 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-semibold hover:bg-gray-800 transition-all">
            Set Up Profile
          </Link>
        </div>
      ) : matches.length === 0 ? (
        <div className="text-center py-20 bg-white border border-gray-100 rounded-xl">
          <span className="material-symbols-outlined text-gray-300 text-5xl mb-4 block">hub</span>
          <p className="font-headline font-bold text-lg">No matches found yet</p>
          <p className="text-sm text-gray-500 mt-1">Try updating your profile with more challenge areas</p>
        </div>
      ) : (
        <>
          {/* Score Legend */}
          <div className="flex flex-wrap gap-4 mb-8 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-emerald-100" />
              <span className="text-gray-600">Strong match (60%+)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-amber-100" />
              <span className="text-gray-600">Good match (30–59%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-gray-100" />
              <span className="text-gray-600">Partial match (&lt;30%)</span>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {matches.map((m) => (
              <MemberCard
                key={m.profile.id}
                profile={m.profile}
                score={m.score}
                breakdown={m.breakdown}
                onMessage={handleMessage}
              />
            ))}
          </div>
        </>
      )}
    </main>
  );
}
