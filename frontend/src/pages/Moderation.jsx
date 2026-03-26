import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { useToast } from '../store/ToastContext';

export default function Moderation() {
  const [tab, setTab] = useState('flags');
  const [flags, setFlags] = useState([]);
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewNotes, setReviewNotes] = useState({});
  const toast = useToast();

  useEffect(() => {
    setLoading(true);
    if (tab === 'flags') {
      api.get('/moderation/flagged/').then((r) => setFlags(r.data || [])).catch(() => {}).finally(() => setLoading(false));
    } else {
      api.get('/moderation/actions/').then((r) => setActions(r.data || [])).catch(() => {}).finally(() => setLoading(false));
    }
  }, [tab]);

  const reviewFlag = async (flagId, status) => {
    try {
      await api.post(`/moderation/flagged/${flagId}/review/`, {
        status, moderator_notes: reviewNotes[flagId] || '',
      });
      toast?.success(`Flag ${status}.`);
      setFlags((prev) => prev.map((f) => f.id === flagId ? { ...f, status } : f));
    } catch {
      toast?.error('Failed to review flag.');
    }
  };

  const takeAction = async (userId, action, reason) => {
    try {
      await api.post(`/moderation/users/${userId}/action/`, { action, reason });
      toast?.success(`User ${action} action taken.`);
    } catch {
      toast?.error('Failed to take action.');
    }
  };

  return (
    <main className="max-w-5xl mx-auto px-6 md:px-12 py-10">
      <div className="mb-8">
        <h1 className="font-headline text-3xl font-extrabold tracking-tight">Moderation</h1>
        <p className="text-gray-500 mt-1">Review flagged content and manage community members</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-8 bg-gray-100 rounded-lg p-1 w-fit">
        {[['flags', 'Flagged Messages'], ['actions', 'Action Log']].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              tab === key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}>
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
        </div>
      ) : tab === 'flags' ? (
        flags.length === 0 ? (
          <div className="text-center py-20 bg-white border border-gray-100 rounded-xl">
            <span className="material-symbols-outlined text-gray-300 text-5xl mb-4 block">verified_user</span>
            <p className="font-headline font-bold text-lg">No flagged messages</p>
            <p className="text-sm text-gray-500 mt-1">The community is in good shape</p>
          </div>
        ) : (
          <div className="space-y-4">
            {flags.map((flag) => (
              <div key={flag.id} className={`bg-white border rounded-xl p-6 ${
                flag.status === 'pending' ? 'border-amber-200' : 'border-gray-100'
              }`}>
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold uppercase ${
                        flag.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                        flag.status === 'reviewed' ? 'bg-emerald-100 text-emerald-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>{flag.status}</span>
                      <span className="text-xs text-gray-400">{new Date(flag.created_at).toLocaleString()}</span>
                    </div>
                    <p className="text-sm"><span className="font-medium">Flagged by:</span> {flag.flagged_by_user?.first_name} {flag.flagged_by_user?.last_name}</p>
                    <p className="text-sm text-gray-500 mt-1"><span className="font-medium text-gray-700">Reason:</span> {flag.reason}</p>
                  </div>
                  {flag.conversation_id && (
                    <Link to={`/messages/${flag.conversation_id}`}
                      className="text-xs text-emerald-600 hover:underline shrink-0">View Conversation</Link>
                  )}
                </div>

                {/* Flagged message content */}
                {flag.message_detail && (
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <p className="text-xs text-gray-400 mb-1">Message from <strong>{flag.message_detail.sender_name}</strong></p>
                    <p className="text-sm text-gray-700">{flag.message_detail.content}</p>
                  </div>
                )}

                {flag.status === 'pending' && (
                  <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-gray-100">
                    <input type="text" placeholder="Moderator notes (optional)..."
                      value={reviewNotes[flag.id] || ''}
                      onChange={(e) => setReviewNotes((prev) => ({ ...prev, [flag.id]: e.target.value }))}
                      className="flex-1 min-w-[200px] bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                    <button onClick={() => reviewFlag(flag.id, 'reviewed')}
                      className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-500">
                      Action Needed
                    </button>
                    <button onClick={() => reviewFlag(flag.id, 'dismissed')}
                      className="px-4 py-2 border border-gray-200 text-sm font-medium rounded-lg hover:bg-gray-50">
                      Dismiss
                    </button>
                    {flag.message_detail?.sender && (
                      <button onClick={() => {
                        const reason = prompt('Reason for warning this user:');
                        if (reason) takeAction(flag.message_detail.sender, 'warn', reason);
                      }}
                        className="px-4 py-2 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-500">
                        Warn User
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      ) : (
        actions.length === 0 ? (
          <div className="text-center py-20 bg-white border border-gray-100 rounded-xl">
            <p className="font-headline font-bold text-lg">No actions taken yet</p>
          </div>
        ) : (
          <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left">
                <tr>
                  <th className="px-6 py-3 font-medium text-gray-500">Date</th>
                  <th className="px-6 py-3 font-medium text-gray-500">Moderator</th>
                  <th className="px-6 py-3 font-medium text-gray-500">Target</th>
                  <th className="px-6 py-3 font-medium text-gray-500">Action</th>
                  <th className="px-6 py-3 font-medium text-gray-500">Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {actions.map((a) => (
                  <tr key={a.id}>
                    <td className="px-6 py-3 text-gray-500">{new Date(a.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-3">{a.moderator_user?.first_name} {a.moderator_user?.last_name}</td>
                    <td className="px-6 py-3">{a.target?.first_name} {a.target?.last_name}</td>
                    <td className="px-6 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold uppercase ${
                        a.action === 'warn' ? 'bg-amber-100 text-amber-700' :
                        a.action === 'ban' ? 'bg-red-100 text-red-700' :
                        a.action === 'suspend' ? 'bg-orange-100 text-orange-700' :
                        'bg-emerald-100 text-emerald-700'
                      }`}>{a.action}</span>
                    </td>
                    <td className="px-6 py-3 text-gray-500 truncate max-w-[200px]">{a.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </main>
  );
}
