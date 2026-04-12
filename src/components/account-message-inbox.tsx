"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { UserAvatar } from "@/components/user-avatar";
import type { Locale } from "@/lib/i18n";

type MessageRecord = {
  id: string;
  body: string;
  createdAt: string;
  readAt: string | null;
  senderId: string;
  recipientId: string;
  sender: { id: string; username: string; image?: string | null };
  recipient: { id: string; username: string; image?: string | null };
};

type ThreadSummary = {
  userId: string;
  username: string;
  image?: string | null;
  lastMessageAt: string;
  unreadCount: number;
  messages: MessageRecord[];
};

type UserSuggestion = {
  id: string;
  username: string;
  image?: string | null;
};

function copy(locale: Locale) {
  if (locale === "ka") {
    return {
      title: "შეტყობინებები / Inbox",
      subtitle: "პირადი ჩატები ქომუნითის წევრებთან.",
      message: "მესიჯი...",
      send: "გაგზავნა",
      sending: "იგზავნება...",
      selectThread: "აირჩიე ჩატი ან დაიწყე ახალი შეტყობინება.",
      noThreads: "ჩატები ჯერ არ არის.",
      search: "ძებნა username-ით...",
      failedSend: "შეტყობინება ვერ გაიგზავნა.",
      targetHint: "თუ ჩატი არ გაქვს არჩეული - ჩაწერე username ძებნაში ზემოთ.",
      missingRecipient: "ჯერ აირჩიე ჩატი ან ჩაწერე მიმღების username.",
      suggestions: "მინიშნებები",
      now: "ახლა",
    };
  }
  if (locale === "ru") {
    return {
      title: "Сообщения / Inbox",
      subtitle: "Личные чаты с участниками сообщества.",
      message: "Сообщение...",
      send: "Отправить",
      sending: "Отправка...",
      selectThread: "Выберите чат или начните новое сообщение.",
      noThreads: "Чатов пока нет.",
      search: "Поиск по username...",
      failedSend: "Не удалось отправить сообщение.",
      targetHint: "Если чат не выбран - введите username в поиске выше.",
      missingRecipient: "Сначала выберите чат или введите username получателя.",
      suggestions: "Подсказки",
      now: "сейчас",
    };
  }
  return {
    title: "Messages / Inbox",
    subtitle: "Private chats with community members.",
    message: "Message...",
    send: "Send",
    sending: "Sending...",
    selectThread: "Select a chat or start a new message.",
    noThreads: "No chats yet.",
    search: "Search by username...",
    failedSend: "Could not send message.",
    targetHint: "If no chat is selected, type recipient username in search above.",
    missingRecipient: "Select a chat or type recipient username first.",
    suggestions: "Suggestions",
    now: "now",
  };
}

export function AccountMessageInbox({
  locale,
  currentUserId,
  fullPage = false,
  leadAction,
}: {
  locale: Locale;
  currentUserId: string;
  fullPage?: boolean;
  /** e.g. back link on full-page messages - rendered with no card wrapper */
  leadAction?: ReactNode;
}) {
  const t = copy(locale);
  const [messages, setMessages] = useState<MessageRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [filter, setFilter] = useState("");
  const [suggestions, setSuggestions] = useState<UserSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const threads = useMemo<ThreadSummary[]>(() => {
    const map = new Map<string, ThreadSummary>();
    for (const message of messages) {
      const isMine = message.senderId === currentUserId;
      const other = isMine ? message.recipient : message.sender;
      const existing = map.get(other.id);
      if (!existing) {
        map.set(other.id, {
          userId: other.id,
          username: other.username,
          image: other.image,
          lastMessageAt: message.createdAt,
          unreadCount:
            message.recipientId === currentUserId && !message.readAt ? 1 : 0,
          messages: [message],
        });
      } else {
        existing.messages.push(message);
        if (new Date(message.createdAt) > new Date(existing.lastMessageAt)) {
          existing.lastMessageAt = message.createdAt;
        }
        if (message.recipientId === currentUserId && !message.readAt) {
          existing.unreadCount += 1;
        }
      }
    }
    return Array.from(map.values())
      .map((thread) => ({
        ...thread,
        messages: thread.messages.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        ),
      }))
      .sort(
        (a, b) =>
          new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime(),
      );
  }, [messages, currentUserId]);

  const filteredThreads = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return threads;
    return threads.filter((thread) => thread.username.toLowerCase().includes(q));
  }, [threads, filter]);

  const selectedThread = threads.find((entry) => entry.userId === selectedUserId) ?? null;

  async function loadMessages() {
    setLoading(true);
    try {
      const response = await fetch("/api/messages");
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        setMessages([]);
        return;
      }
      setMessages(payload.messages ?? []);
      if (!selectedUserId && payload.messages?.length) {
        const first = payload.messages[0];
        const otherId = first.senderId === currentUserId ? first.recipientId : first.senderId;
        setSelectedUserId(otherId);
      }
    } catch {
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selectedThread || selectedThread.unreadCount === 0) return;
    void fetch("/api/messages/read", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ withUserId: selectedThread.userId }),
    }).then(() => loadMessages());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUserId]);

  useEffect(() => {
    const q = filter.trim();
    if (q.length < 2) {
      setSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(`/api/messages/users?q=${encodeURIComponent(q)}`);
        const payload = await response.json().catch(() => null);
        if (!response.ok) {
          setSuggestions([]);
          return;
        }
        setSuggestions(payload.items ?? []);
      } catch {
        setSuggestions([]);
      }
    }, 180);
    return () => clearTimeout(timer);
  }, [filter]);

  async function sendMessage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!body.trim()) return;
    setSending(true);
    setSendError(null);
    try {
      const targetUsername = selectedThread?.username ?? filter.trim();
      if (!targetUsername) {
        setSendError(t.missingRecipient);
        return;
      }
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toUsername: targetUsername, body }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        setSendError(payload?.error ?? t.failedSend);
        return;
      }
      setBody("");
      await loadMessages();
      const matched = threads.find(
        (thread) => thread.username.toLowerCase() === targetUsername.toLowerCase(),
      );
      if (matched) {
        setSelectedUserId(matched.userId);
      }
    } catch {
      setSendError(t.failedSend);
    } finally {
      setSending(false);
    }
  }

  const inboxSection = (
    <section
      className={
        fullPage
          ? "relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-950/80 via-[#0a1629]/85 to-slate-950/80 p-4 shadow-2xl shadow-lime-950/10 sm:rounded-[2rem] sm:p-6"
          : "rounded-2xl border border-white/10 bg-slate-950/60 p-5 sm:rounded-[2rem] sm:p-8"
      }
    >
      {fullPage ? (
        <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-lime-400/10 blur-2xl sm:h-36 sm:w-36" />
      ) : null}

      <div className="relative">
        <h2 className={fullPage ? "text-xl font-semibold text-white sm:text-3xl" : "text-lg font-semibold text-white sm:text-2xl"}>
          {t.title}
        </h2>
        <p className={fullPage ? "mt-1 text-sm text-slate-300 sm:text-base" : "mt-2 text-sm text-slate-400"}>
          {t.subtitle}
        </p>
      </div>

      <div className={`mt-4 grid gap-3 ${fullPage ? "lg:grid-cols-[320px_1fr]" : "lg:grid-cols-[280px_1fr]"}`}>
        <aside className={`rounded-2xl border border-white/10 ${fullPage ? "bg-slate-900/55 p-3.5" : "bg-white/5 p-3"}`}>
          <input
            value={filter}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 140)}
            onChange={(event) => setFilter(event.target.value)}
            placeholder={t.search}
            className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white placeholder:text-slate-500"
          />
          {showSuggestions && suggestions.length > 0 ? (
            <div className="mt-2 rounded-xl border border-white/10 bg-slate-900/95 p-2">
              <p className="mb-1 px-1 text-[10px] uppercase tracking-[0.14em] text-slate-400">
                {t.suggestions}
              </p>
              <div className="max-h-36 space-y-1 overflow-auto">
                {suggestions.map((entry) => (
                  <button
                    key={entry.id}
                    type="button"
                    onClick={() => {
                      setFilter(entry.username);
                      setShowSuggestions(false);
                      const existing = threads.find(
                        (thread) => thread.username.toLowerCase() === entry.username.toLowerCase(),
                      );
                      if (existing) {
                        setSelectedUserId(existing.userId);
                      }
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs text-slate-200 transition hover:bg-white/10"
                  >
                    <UserAvatar username={entry.username} image={entry.image} size="sm" />
                    <span>@{entry.username}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : null}
          <div className="mt-3 max-h-[300px] space-y-2 overflow-auto">
            {loading ? (
              <p className="text-xs text-slate-400">...</p>
            ) : filteredThreads.length === 0 ? (
              <p className="text-xs text-slate-400">{t.noThreads}</p>
            ) : (
              filteredThreads.map((thread) => (
                <button
                  key={thread.userId}
                  type="button"
                  onClick={() => setSelectedUserId(thread.userId)}
                  className={`flex w-full items-center justify-between gap-2 rounded-xl border px-2.5 py-2 text-left transition ${
                    selectedUserId === thread.userId
                      ? "border-lime-400/30 bg-lime-400/10"
                      : "border-white/10 bg-white/5 hover:bg-white/10"
                  }`}
                >
                  <span className="inline-flex items-center gap-2">
                    <UserAvatar username={thread.username} image={thread.image} size="sm" />
                    <span className="text-xs text-white">@{thread.username}</span>
                  </span>
                  {thread.unreadCount > 0 ? (
                    <span className="rounded-full bg-lime-400/20 px-1.5 py-0.5 text-[10px] text-lime-200">
                      {thread.unreadCount}
                    </span>
                  ) : null}
                </button>
              ))
            )}
          </div>
        </aside>

        <div className={`rounded-2xl border border-white/10 ${fullPage ? "bg-slate-900/50 p-3.5" : "bg-white/5 p-3"}`}>
          <div
            className={`rounded-xl border border-white/10 bg-slate-900/60 p-3 ${
              selectedThread ? (fullPage ? "min-h-[320px]" : "min-h-[220px]") : "min-h-[120px]"
            }`}
          >
            {!selectedThread ? (
              <p className="text-sm text-slate-400">{t.selectThread}</p>
            ) : (
              <div className="space-y-2">
                {selectedThread.messages.map((message) => {
                  const isMine = message.senderId === currentUserId;
                  return (
                    <div
                      key={message.id}
                      className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
                        isMine
                          ? "ml-auto bg-lime-400/15 text-lime-100"
                          : "bg-slate-800 text-slate-200"
                      }`}
                    >
                      <p>{message.body}</p>
                      <p className="mt-1 text-[10px] opacity-70">
                        {new Date(message.createdAt).toLocaleString() || t.now}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <form onSubmit={sendMessage} className="mt-3 grid gap-2">
            {!selectedThread ? <p className="text-xs text-slate-400">{t.targetHint}</p> : null}
            <textarea
              value={body}
              onChange={(event) => setBody(event.target.value)}
              placeholder={t.message}
              rows={3}
              className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white placeholder:text-slate-500"
              required
            />
            {sendError ? <p className="text-xs text-red-300">{sendError}</p> : null}
            <button
              type="submit"
              disabled={sending}
              className="inline-flex w-fit rounded-full bg-lime-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-lime-300 disabled:opacity-60"
            >
              {sending ? t.sending : t.send}
            </button>
          </form>
        </div>
      </div>
    </section>
  );

  if (leadAction) {
    return (
      <div className="flex flex-col gap-5 sm:gap-6">
        {leadAction}
        {inboxSection}
      </div>
    );
  }

  return inboxSection;
}
