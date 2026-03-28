import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/client';
import { useToast } from '../store/ToastContext';

export default function MemberDetail() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    api.get(`/community/members/${id}/`)
      .then((r) => setProfile(r.data))
      .catch(() => setProfile(null))
      .finally(() => setLoading(false));
  }, [id]);

  const handleMessage = async () => {
    try {
      const { data } = await api.post('/messaging/conversations/', { recipient_id: profile.user.id });
      navigate(`/messages/${data.id}`);
    } catch {
      toast?.error('Failed to start conversation.');
    }
  };

  if (loading) return <div className="flex justify-center py-24" role="status" aria-label="Loading profile"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" /></div>;
  if (!profile) return (
    <main className="max-w-3xl mx-auto px-6 md:px-12 py-10">
      <div className="text-center py-20 bg-white border border-gray-100 rounded-xl">
        <span className="material-symbols-outlined text-gray-300 text-5xl mb-4 block" aria-hidden="true">person_off</span>
        <p className="font-headline font-bold text-lg">Member not found</p>
        <p className="text-sm text-gray-500 mt-1 mb-4">This profile may not exist or is no longer available.</p>
        <Link to="/directory" className="text-emerald-600 text-sm font-medium hover:underline">Back to Directory</Link>
      </div>
    </main>
  );

  const { user, district } = profile;

  return (
    <main className="max-w-3xl mx-auto px-6 md:px-12 py-10">
      <Link to="/directory" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 mb-8 transition-colors"
        aria-label="Back to directory">
        <span className="material-symbols-outlined text-sm" aria-hidden="true">arrow_back</span>Back to Directory
      </Link>

      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-8">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-emerald-200 text-emerald-800 rounded-full flex items-center justify-center text-2xl font-bold" aria-hidden="true">
              {(user.first_name?.[0] || '?').toUpperCase()}
            </div>
            <div>
              <h1 className="font-headline text-2xl font-extrabold tracking-tight">{user.first_name} {user.last_name}</h1>
              {profile.title && <p className="text-gray-600">{profile.title}</p>}
              {profile.years_experience > 0 && <p className="text-sm text-gray-500">{profile.years_experience} years experience</p>}
            </div>
          </div>
        </div>

        <div className="p-8 space-y-8">
          {/* Bio */}
          {profile.bio && (
            <div>
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">About</h2>
              <p className="text-sm text-gray-700 leading-relaxed">{profile.bio}</p>
            </div>
          )}

          {/* District Info */}
          {district && (
            <div>
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">District</h2>
              <div className="bg-gray-50 rounded-lg p-5">
                <p className="font-headline font-bold">{district.name}, {district.state}</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                  {[
                    ['Type', district.display_type],
                    ['Size', district.display_size],
                    ['FRL', `${parseFloat(district.free_reduced_lunch_pct).toFixed(1)}%`],
                    ['ESL', `${parseFloat(district.esl_pct).toFixed(1)}%`],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <p className="text-[11px] text-gray-400 uppercase tracking-wider">{label}</p>
                      <p className="text-sm font-medium">{value}</p>
                    </div>
                  ))}
                </div>
                {district.enrollment > 0 && (
                  <p className="text-xs text-gray-500 mt-3">{district.enrollment.toLocaleString()} students enrolled</p>
                )}
              </div>
            </div>
          )}

          {/* Problem Statements */}
          {profile.problem_statements?.length > 0 && (
            <div>
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Literacy Challenges</h2>
              <div className="space-y-2">
                {profile.problem_statements.map((ps) => (
                  <div key={ps.id} className="flex items-start gap-3 p-3 bg-emerald-50 rounded-lg">
                    <span className="material-symbols-outlined text-emerald-600 text-base mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }} aria-hidden="true">check_circle</span>
                    <div>
                      <p className="text-sm font-medium text-emerald-900">{ps.title}</p>
                      {ps.description && <p className="text-xs text-emerald-700 mt-0.5">{ps.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="pt-4 border-t border-gray-100">
            <button onClick={handleMessage}
              className="px-6 py-3 bg-gray-900 text-white rounded-lg text-sm font-semibold hover:bg-gray-800 transition-all flex items-center gap-2">
              <span className="material-symbols-outlined text-base" aria-hidden="true">chat</span>
              Send Message
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
