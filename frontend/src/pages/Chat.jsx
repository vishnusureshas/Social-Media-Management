import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import {
  useGetConversationsQuery,
  useGetConversationQuery,
  useGetMessagesQuery,
  useMarkReadMutation,
} from '../api/chatApi';
import { useAuth } from '../hooks/useAuth';
import useChatSocket from '../hooks/useChatSocket';
import { Avatar } from '../components/user/UserCard';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import AuroraBackground from '../components/ui/AuroraBackground';
import { formatRelative } from '../utils/postUtils';
import { getApiErrorMessage } from '../utils/errorUtils';

const messageTime = (iso) => {
  if (!iso) return '';
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const ConversationRow = ({ conversation, active, onClick }) => {
  const { user: me } = useAuth();
  const presence = useSelector((s) => s.messages.presence);

  const peer = conversation.peer || null;
  const displayName = peer ? peer.fullName || `@${peer.username}` : conversation.groupName || 'Group';
  const displayUsername = peer ? `@${peer.username}` : `${conversation.participants?.length || 0} members`;
  const isGroup = conversation.type === 'group';

  const lastPreview = () => {
    const lm = conversation.lastMessage;
    if (!lm) return 'No messages yet. Say hi!';
    const prefix = lm.sender && String(lm.sender._id) === String(me?._id) ? 'You: ' : '';
    if (lm.type !== 'text') return `${prefix}[${lm.type}]`;
    return `${prefix}${lm.content || 'Attachment'}`;
  };

  const peerOnline =
    !isGroup && peer && presence[String(peer._id)]?.online === true;

  return (
    <button
      onClick={onClick}
      className={`w-full rounded-3xl p-3 text-left transition-all duration-200 ${
        active ? 'bg-gradient-to-r from-brand-500/10 to-fuchsia-500/10 ring-1 ring-brand-200' : 'bg-white/60 hover:bg-white'
      }`}
    >
      <div className="flex items-center gap-3">
        <span className="relative shrink-0">
          <Avatar user={peer} size="sm" />
          {isGroup ? (
            <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-brand-500 text-[8px] font-bold text-white">
              #
            </span>
          ) : (
            peerOnline && (
              <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-emerald-500 ring-2 ring-white" />
            )
          )}
        </span>
        <div className="min-w-0 flex-1">
          <p className="flex items-center justify-between gap-2">
            <span className="truncate text-sm font-semibold text-slate-800">{displayName}</span>
            {conversation.lastMessage && (
              <span className="shrink-0 text-[11px] text-slate-400">
                {formatRelative(conversation.lastMessage.createdAt)}
              </span>
            )}
          </p>
          <p className="flex items-center justify-between gap-2">
            <span className="truncate text-xs text-slate-500">
              {active ? displayUsername || lastPreview() : lastPreview()}
            </span>
            {conversation.unread > 0 && (
              <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-brand-500 px-1.5 text-[11px] font-bold text-white">
                {conversation.unread}
              </span>
            )}
          </p>
        </div>
      </div>
    </button>
  );
};

const MessagesPane = ({ conversationId }) => {
  const { user: me } = useAuth();
  const thread = useSelector((s) => s.messages.threads[conversationId] || []);
  const typingUsers = useSelector((s) => s.messages.typing[conversationId] || []);

  const { data: convoData } = useGetConversationQuery(conversationId, { skip: !conversationId });
  const conversation = convoData?.data?.conversation;

  const [cursor, setCursor] = useState(undefined);
  const { data, isFetching } = useGetMessagesQuery(
    { id: conversationId, cursor, limit: 50 },
    { skip: !conversationId }
  );

  const messages = useMemo(() => {
    const byId = new Map(thread.map((m) => [String(m._id), m]));
    (data?.data?.messages || []).forEach((m) => {
      byId.set(String(m._id), m);
    });
    return [...byId.values()].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  }, [thread, data]);

  const hasMore = !!data?.data?.pagination?.hasMore;

  const bottomRef = useRef(null);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const { sendMessage, emitTyping, emitRead } = useChatSocket();
  const [markRead] = useMarkReadMutation();

  useEffect(() => {
    if (conversationId) emitRead(conversationId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (conversationId && conversation?.unread > 0) {
      markRead(conversationId);
    }
  }, [conversationId, conversation?.unread, markRead]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' });
  }, [messages.length, typingUsers.length]);

  const handleSend = async () => {
    const content = text.trim();
    if (!content || sending) return;
    setSending(true);
    try {
      await sendMessage(conversationId, content);
      setText('');
      emitTyping(conversationId, false);
    } catch (err) {
      toast.error(err?.message || 'Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  const peer = conversation?.peer || null;
  const displayName = peer ? peer.fullName || `@${peer.username}` : conversation?.groupName || 'Chat';
  const typers = typingUsers
    .map((id) => conversation?.participants?.find((p) => String(p._id) === id))
    .filter(Boolean);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-slate-200/70 px-5 py-3">
        <Avatar user={peer} size="sm" />
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-slate-900">{displayName}</p>
          <p className="truncate text-xs text-slate-400">
            {typers.length > 0
              ? `${typers.map((t) => t.fullName || `@${t.username}`).join(', ')} typing…`
              : isGroupLabel(conversation)}
          </p>
        </div>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto px-5 py-4">
        {hasMore && (
          <div className="text-center">
            <Button variant="ghost" size="sm" loading={isFetching} onClick={() => setCursor(data?.data?.pagination?.cursor)}>
              Load older
            </Button>
          </div>
        )}
        {messages.map((m) => {
          const mine = String(m.sender?._id || m.sender) === String(me?._id);
          const sender = m.sender?._id ? m.sender : (mine ? me : null);
          return (
            <div key={m._id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[75%] rounded-3xl px-4 py-2.5 text-sm ${
                  mine
                    ? 'bg-gradient-to-r from-brand-500 to-fuchsia-500 text-white shadow-glow'
                    : 'bg-white text-slate-800 ring-1 ring-slate-200/70'
                }`}
              >
                {!mine && (
                  <p className="mb-0.5 text-[11px] font-bold text-brand-600">
                    {sender?.fullName || `@${sender?.username}`}
                  </p>
                )}
                {m.type === 'text' ? (
                  <p className="whitespace-pre-wrap break-words">{m.content}</p>
                ) : m.media?.length ? (
                  <div className="space-y-2">
                    {m.media.map((med, i) => (
                      <div key={i}>
                        {med.mediaType === 'image' ? (
                          <img src={med.url} alt="attachment" className="max-h-64 rounded-2xl object-cover" />
                        ) : (
                          <a href={med.url} target="_blank" rel="noreferrer" className="underline">
                            Open attachment
                          </a>
                        )}
                      </div>
                    ))}
                    {m.content && <p className="whitespace-pre-wrap break-words">{m.content}</p>}
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap break-words">{m.content}</p>
                )}
                <p className={`mt-1 text-right text-[10px] ${mine ? 'text-white/70' : 'text-slate-400'}`}>
                  {m._optimistic ? '…' : messageTime(m.createdAt)}
                  {mine && !m._optimistic && (
                    <span className="ml-1.5 inline-block">
                      {(m.readBy || []).some((r) => String(r) !== String(me?._id)) ? '✓✓' : '✓'}
                    </span>
                  )}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-slate-200/70 p-3">
        <div className="flex items-end gap-2">
          <textarea
            value={text}
            rows={1}
            placeholder="Type a message…"
            className="input-base max-h-32 min-h-[44px] flex-1 resize-none"
            onChange={(e) => {
              setText(e.target.value);
              emitTyping(conversationId, e.target.value.trim().length > 0);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <Button onClick={handleSend} loading={sending} className="shrink-0">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Send
          </Button>
        </div>
      </div>
    </div>
  );
};

const isGroupLabel = (conversation) => {
  if (!conversation) return '';
  if (conversation.type === 'group') return `${conversation.participants?.length || 0} members · Group`;
  return '';
};

const EmptyState = () => (
  <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
    <span className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-brand-500 to-fuchsia-500 text-white shadow-glow">
      <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
    <p className="font-display text-lg font-bold text-slate-800">Select a conversation</p>
    <p className="text-sm text-slate-500">Choose a chat from your inbox, or start a new one from someone's profile.</p>
  </div>
);

const Chat = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user: me } = useAuth();
  const activeId = useSelector((s) => s.messages.activeConversation);
  const { joinConversation } = useChatSocket();

  const { data, isLoading, isError, refetch } = useGetConversationsQuery();

  const conversations = data?.data?.conversations || [];
  const requestedId = searchParams.get('conversation');

  useEffect(() => {
    const target = requestedId;
    if (target) {
      joinConversation(target);
      setSearchParams({}, { replace: true });
      return;
    }
    if (!activeId && conversations.length > 0) {
      const first = conversations.find((c) => c.unread > 0) || conversations[0];
      joinConversation(first._id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversations.length, requestedId]);

  const handleSelect = (id) => {
    joinConversation(id);
    window.scrollTo({ top: 0 });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="glass-strong mx-auto max-w-md rounded-3xl p-8 text-center animate-fade-up">
        <p className="text-sm text-rose-500">
          <span className="block font-semibold">Couldn't load conversations.</span>
          <span className="mt-1 block text-slate-500">{getApiErrorMessage(data)}</span>
        </p>
        <Button variant="secondary" size="sm" className="mt-4" onClick={refetch}>
          Retry
        </Button>
        <Button variant="ghost" size="sm" className="mt-2" onClick={() => navigate('/')}>
          Back to profile
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 md:px-6">
      <AuroraBackground />
      <div className="mt-2 mb-4">
        <h1 className="font-display text-2xl font-bold text-slate-900">Messages</h1>
        <p className="mt-1 text-sm text-slate-500">
          Conversations, {me?.username ? `@${me.username}` : ''} — real-time chat.
        </p>
      </div>

      <div className="glass grid gap-4 lg:grid-cols-[320px_1fr] xl:grid-cols-[360px_1fr]" style={{ height: '70vh', minHeight: 480 }}>
        <aside className="flex flex-col overflow-hidden border-r border-slate-200/70 lg:rounded-l-3xl">
          <div className="border-b border-slate-200/70 p-3">
            <p className="px-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Inbox</p>
          </div>
          <div className="flex-1 space-y-1 overflow-y-auto p-2">
            {conversations.length === 0 ? (
              <div className="p-6 text-center text-sm text-slate-500">
                <p className="font-semibold text-slate-700">No conversations yet.</p>
                <p className="mt-1">Visit someone's profile to send them a message.</p>
              </div>
            ) : (
              conversations.map((c) => (
                <ConversationRow
                  key={c._id}
                  conversation={c}
                  active={String(c._id) === String(activeId)}
                  onClick={() => handleSelect(c._id)}
                />
              ))
            )}
          </div>
        </aside>

        <section className="flex overflow-hidden bg-white/30 backdrop-blur lg:rounded-r-3xl">
          {activeId ? <MessagesPane key={activeId} conversationId={activeId} /> : <EmptyState />}
        </section>
      </div>
    </div>
  );
};

export default Chat;