import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../store/AuthContext';

export default function Messages() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    api.get('/messaging/conversations/')
      .then((r) => setConversations(r.data || []))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-24" role="status" aria-label="Loading messages"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" /></div>;

  if (error) {
    return (
      <main className="max-w-3xl mx-auto px-6 md:px-12 py-10">
        <div className="text-center py-20 bg-white border border-gray-100 rounded-xl">
          <span className="material-symbols-outlined text-gray-300 text-5xl mb-4 block" aria-hidden="true">error</span>
          <p className="font-headline font-bold text-lg">Failed to load messages</p>
          <p className="text-sm text-gray-500 mt-1">Please try refreshing the page.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto px-6 md:px-12 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-headline text-3xl font-extrabold tracking-tight">Messages</h1>
          <p className="text-gray-500 mt-1">Your conversations with community members</p>
        </div>
        <Link to="/directory" className="px-4 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-semibold hover:bg-gray-800 transition-all flex items-center gap-2"
          aria-label="Start new conversation">
          <span className="material-symbols-outlined text-base" aria-hidden="true">add</span>New
        </Link>
      </div>

      {conversations.length === 0 ? (
        <div className="text-center py-20 bg-white border border-gray-100 rounded-xl">
          <span className="material-symbols-outlined text-gray-300 text-5xl mb-4 block" aria-hidden="true">forum</span>
          <p className="font-headline font-bold text-lg">No conversations yet</p>
          <p className="text-sm text-gray-500 mt-1 mb-6">Find a match and start a conversation</p>
          <Link to="/matches" className="text-emerald-600 text-sm font-medium hover:underline">Find Matches</Link>
        </div>
      ) : (
        <div className="space-y-2">
          {conversations.map((conv) => {
            const others = conv.participants.filter((p) => p.id !== user?.id);
            const primary = others[0];
            const names = others.map((p) => `${p.first_name} ${p.last_name}`.trim()).join(', ');
            return (
              <Link key={conv.id} to={`/messages/${conv.id}`}
                className="flex items-center gap-4 bg-white border border-gray-100 rounded-xl p-5 hover:border-gray-300 hover:shadow-sm transition-all"
                aria-label={`Conversation with ${names}${conv.unread_count > 0 ? `, ${conv.unread_count} unread` : ''}`}>
                <div className="w-11 h-11 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-sm font-bold shrink-0" aria-hidden="true">
                  {(primary?.first_name?.[0] || '?').toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-headline font-bold text-sm truncate">{names}</p>
                    <span className="text-[11px] text-gray-400 shrink-0">
                      {new Date(conv.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                  {conv.last_message && (
                    <p className="text-sm text-gray-500 truncate mt-0.5">{conv.last_message.content}</p>
                  )}
                </div>
                {conv.unread_count > 0 && (
                  <span className="w-5 h-5 bg-emerald-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center shrink-0" aria-label={`${conv.unread_count} unread messages`}>
                    {conv.unread_count}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
