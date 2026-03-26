import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../store/AuthContext';
import { useToast } from '../store/ToastContext';

export default function Conversation() {
  const { id } = useParams();
  const { user } = useAuth();
  const toast = useToast();
  const [conversation, setConversation] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [flagReason, setFlagReason] = useState('');
  const [flaggingId, setFlaggingId] = useState(null);
  const messagesEnd = useRef(null);

  const fetchConvo = () =>
    api.get(`/messaging/conversations/${id}/`).then((r) => setConversation(r.data)).catch(() => {}).finally(() => setLoading(false));

  useEffect(() => {
    fetchConvo();
    const i = setInterval(fetchConvo, 8000);
    return () => clearInterval(i);
  }, [id]);

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation?.messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    setSending(true);
    try {
      await api.post(`/messaging/conversations/${id}/messages/`, { content: newMessage });
      setNewMessage('');
      fetchConvo();
    } catch {} finally { setSending(false); }
  };

  const handleFlag = async (messageId) => {
    if (!flagReason.trim()) return;
    try {
      await api.post('/moderation/flag/', { message_id: messageId, reason: flagReason });
      toast?.success('Message flagged for review.');
      setFlaggingId(null);
      setFlagReason('');
    } catch {
      toast?.error('Failed to flag message.');
    }
  };

  if (loading) return <div className="flex justify-center py-24"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" /></div>;
  if (!conversation) return <div className="text-center py-24 text-gray-500">Conversation not found</div>;

  const others = conversation.participants.filter((p) => p.id !== user?.id);

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 py-4 flex flex-col h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="bg-white border border-gray-100 rounded-t-xl px-6 py-4 flex items-center gap-4 shrink-0">
        <Link to="/messages" className="material-symbols-outlined text-gray-400 hover:text-gray-700 text-xl">arrow_back</Link>
        <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-sm font-bold shrink-0">
          {(others[0]?.first_name?.[0] || '?').toUpperCase()}
        </div>
        <div className="min-w-0">
          <h2 className="font-headline font-bold truncate">
            {others.map((p) => `${p.first_name} ${p.last_name}`.trim()).join(', ')}
          </h2>
          <p className="text-xs text-gray-400">{conversation.participants.length} participants</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 bg-gray-50 border-x border-gray-100 overflow-y-auto px-6 py-6 space-y-4">
        {conversation.messages.map((msg) => {
          const isMe = msg.sender === user?.id;
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} items-end gap-2`}>
              {!isMe && (
                <div className="w-7 h-7 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center shrink-0">
                  <span className="text-[10px] font-bold">{(msg.sender_name?.[0] || '?').toUpperCase()}</span>
                </div>
              )}
              <div className="max-w-[70%] group">
                {!isMe && <p className="text-[10px] text-gray-400 font-medium ml-1 mb-1">{msg.sender_name}</p>}
                <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  isMe ? 'bg-gray-900 text-white rounded-br-md' : 'bg-white text-gray-900 rounded-bl-md border border-gray-100'
                }`}>
                  {msg.content}
                </div>
                <div className={`flex items-center gap-2 mt-1 mx-1 ${isMe ? 'justify-end' : ''}`}>
                  <span className="text-[10px] text-gray-400">
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {!isMe && (
                    <button onClick={() => setFlaggingId(flaggingId === msg.id ? null : msg.id)}
                      className="text-[10px] text-gray-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      Flag
                    </button>
                  )}
                </div>
                {flaggingId === msg.id && (
                  <div className="mt-2 p-3 bg-white border border-gray-200 rounded-lg space-y-2">
                    <input type="text" value={flagReason} onChange={(e) => setFlagReason(e.target.value)}
                      placeholder="Reason for flagging..."
                      className="w-full bg-gray-50 border border-gray-200 rounded px-3 py-2 text-xs" />
                    <div className="flex gap-2">
                      <button onClick={() => handleFlag(msg.id)}
                        className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-500">Submit</button>
                      <button onClick={() => { setFlaggingId(null); setFlagReason(''); }}
                        className="px-3 py-1 border border-gray-200 text-xs rounded hover:bg-gray-50">Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEnd} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="bg-white border border-gray-100 rounded-b-xl p-4 flex items-center gap-3 shrink-0">
        <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-5 py-3 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
        <button type="submit" disabled={sending || !newMessage.trim()}
          className="px-5 py-3 bg-gray-900 text-white rounded-full text-sm font-semibold hover:bg-gray-800 transition-all disabled:opacity-30 flex items-center gap-1.5">
          Send <span className="material-symbols-outlined text-sm">send</span>
        </button>
      </form>
    </div>
  );
}
