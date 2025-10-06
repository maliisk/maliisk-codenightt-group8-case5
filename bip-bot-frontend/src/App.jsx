import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useParams,
  useNavigate,
  Navigate,
  useLocation,
} from "react-router-dom";

import Sidebar from "./components/Sidebar";
import ChatHeader from "./components/ChatHeader";
import MessageList from "./components/MessageList";
import Composer from "./components/Composer";

const API = import.meta.env.VITE_API_URL || "http://localhost:8080";
const COMMANDS = [
  "/yeni",
  "/slot",
  "/katıl",
  "/mekan",
  "/oy",
  "/gider",
  "/ozet",
];

async function apiGet(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
async function apiPost(url, body) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body ?? {}),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

function AppShell() {
  const { userId: routeUserId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [currentUserId, setCurrentUserId] = useState(routeUserId);
  const [chats, setChats] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState(null);

  const [messagesByChat, setMessagesByChat] = useState({});
  const messages = messagesByChat[selectedChatId] || [];

  const [usersById, setUsersById] = useState({});
  const [eventMeta, setEventMeta] = useState(null);

  const [survey, setSurvey] = useState(null);
  const [surveyStats, setSurveyStats] = useState(null);
  const [surveySubmitting, setSurveySubmitting] = useState(false);

  const urlParams = new URLSearchParams(location.search);
  const initialGroupId = urlParams.get("group") || null;

  const nameOf = useCallback(
    (uid) => (uid === "BOT" ? "Bot" : usersById[uid] || uid || "Bilinmeyen"),
    [usersById]
  );

  useEffect(() => {
    (async () => {
      try {
        const list = await apiGet(`${API}/users`);
        const map = {};
        (Array.isArray(list) ? list : []).forEach((u) => {
          if (u.userId) map[u.userId] = u.name || u.userId;
        });
        setUsersById(map);
      } catch {
        setUsersById({});
      }
    })();
  }, []);

  useEffect(() => {
    setCurrentUserId(routeUserId);
    (async () => {
      try {
        const data = await apiGet(`${API}/ui/chats?userId=${routeUserId}`);
        const mapped =
          Array.isArray(data) && data.length
            ? data.map((c) => ({
                id: c.id || c.groupId || c.chatId,
                title: c.title || c.name || "Grup",
                groupId: c.groupId || c.id,
              }))
            : [];
        setChats(mapped);

        let pickId = null;
        if (initialGroupId) {
          const found = mapped.find((m) => m.groupId === initialGroupId);
          if (found) pickId = found.id;
        }
        if (!pickId && mapped.length) pickId = mapped[0].id;
        setSelectedChatId(pickId || null);
      } catch (e) {
        console.error("Sohbet listesi alınamadı:", e);
        setChats([]);
        setSelectedChatId(null);
      }
    })();
  }, [routeUserId]);

  const chat = useMemo(
    () => chats.find((c) => c.id === selectedChatId) || null,
    [chats, selectedChatId]
  );

  useEffect(() => {
    (async () => {
      if (!selectedChatId) return;
      const c = chats.find((x) => x.id === selectedChatId);
      if (!c) return;
      try {
        const data = await apiGet(
          `${API}/ui/messages?groupId=${encodeURIComponent(
            c.groupId
          )}&userId=${encodeURIComponent(currentUserId)}`
        );
        const mapped = (Array.isArray(data) ? data : []).map((m) => {
          const authorId = m.userId ?? m.authorId ?? "BOT";
          const author = nameOf(authorId);
          const isBot = String(authorId).toUpperCase() === "BOT";
          const isMine = !isBot && authorId === currentUserId;
          return {
            id: m.id || crypto.randomUUID(),
            text: `${author}: ${m.text ?? ""}`,
            createdAt: m.createdAt || new Date().toISOString(),
            fromMe: isMine,
            system: !!m.system,
            authorId,
          };
        });
        setMessagesByChat((prev) => ({ ...prev, [selectedChatId]: mapped }));
      } catch (e) {
        console.error("Mesajlar alınamadı:", e);
        setMessagesByChat((prev) => ({ ...prev, [selectedChatId]: [] }));
      }
    })();
  }, [selectedChatId, chats, currentUserId, nameOf]);

  const refreshEventMeta = useCallback(async () => {
    if (!selectedChatId) return;
    const picked = chats.find((c) => c.id === selectedChatId);
    if (!picked) return;
    try {
      const meta = await apiGet(
        `${API}/ui/event-meta?groupId=${encodeURIComponent(picked.groupId)}`
      );
      setEventMeta(meta);
    } catch {
      setEventMeta(null);
    }
  }, [selectedChatId, chats]);

  useEffect(() => {
    refreshEventMeta();
  }, [refreshEventMeta]);

  const isModeratorOfEvent =
    !!eventMeta && eventMeta.createdBy === currentUserId;

  const computeSurveyStats = useCallback((s) => {
    if (!s) return null;

    const slotTotalYes = (s.slots || []).reduce(
      (acc, it) => acc + (Number(it.yesCount) || 0),
      0
    );
    const slotStats = (s.slots || []).map((it) => {
      const count = Number(it.yesCount) || 0;
      const pct =
        slotTotalYes > 0 ? Math.round((count / slotTotalYes) * 100) : 0;
      return { slotId: it.slotId, start: it.start, end: it.end, count, pct };
    });

    const choiceTotal = (s.choices || []).reduce(
      (acc, it) => acc + (Number(it.count) || 0),
      0
    );
    const choiceStats = (s.choices || []).map((it) => {
      const count = Number(it.count) || 0;
      const pct = choiceTotal > 0 ? Math.round((count / choiceTotal) * 100) : 0;
      return { choiceId: it.choiceId, text: it.text, count, pct };
    });

    return { slotStats, slotTotalYes, choiceStats, choiceTotal };
  }, []);

  const refreshSurvey = useCallback(async () => {
    const canSee = (eventMeta?.published ?? false) || isModeratorOfEvent;
    if (!canSee) {
      setSurvey(null);
      setSurveyStats(null);
      return;
    }
    const picked = chats.find((c) => c.id === selectedChatId);
    if (!picked) return;

    try {
      const s = await apiGet(
        `${API}/ui/survey?groupId=${encodeURIComponent(
          picked.groupId
        )}&userId=${encodeURIComponent(currentUserId)}`
      );
      setSurvey(s);
      setSurveyStats(computeSurveyStats(s));
    } catch (e) {
      console.error("Survey alınamadı:", e);
      setSurvey(null);
      setSurveyStats(null);
    }
  }, [
    eventMeta?.published,
    isModeratorOfEvent,
    chats,
    selectedChatId,
    currentUserId,
    computeSurveyStats,
  ]);

  useEffect(() => {
    refreshSurvey();
  }, [refreshSurvey]);

  useEffect(() => {
    if (!isModeratorOfEvent) return;
    const id = setInterval(() => {
      refreshSurvey();
    }, 5000);
    return () => clearInterval(id);
  }, [isModeratorOfEvent, refreshSurvey]);

  const handleSurveySubmit = useCallback(
    async (payload) => {
      if (!eventMeta?.eventId) return;
      try {
        setSurveySubmitting(true);
        await apiPost(`${API}/ui/survey/submit`, {
          eventId: eventMeta.eventId,
          userId: currentUserId,
          slotId: payload.slotId ?? null,
          choiceId: payload.choiceId ?? null,
          participate: payload.participate ?? null,
          amount: payload.amount ?? null,
        });
        await refreshSurvey();
      } catch (e) {
        console.error("Survey submit hatası:", e);
      } finally {
        setSurveySubmitting(false);
      }
    },
    [eventMeta?.eventId, currentUserId, refreshSurvey]
  );

  const sendingRef = useRef(false);
  const sendMessage = useCallback(
    async (text) => {
      if (!text?.trim() || !chat) return;
      if (sendingRef.current) return;
      sendingRef.current = true;

      const trimmed = text.trim();
      const myName = nameOf(currentUserId);

      const myMsg = {
        id: crypto.randomUUID(),
        text: `${myName}: ${text}`,
        createdAt: new Date().toISOString(),
        fromMe: true,
        authorId: currentUserId,
      };
      setMessagesByChat((prev) => ({
        ...prev,
        [selectedChatId]: [...(prev[selectedChatId] || []), myMsg],
      }));

      try {
        if (trimmed.startsWith("/")) {
          const payload = {
            userId: currentUserId,
            groupId: chat.groupId,
            text,
          };
          const reply = await apiPost(`${API}/webhook/bip`, payload);

          const botText =
            typeof reply?.text === "string" && reply.text.trim()
              ? reply.text
              : "✅ Komut işlendi";

          const botName = nameOf("BOT");
          setMessagesByChat((prev) => ({
            ...prev,
            [selectedChatId]: [
              ...(prev[selectedChatId] || []),
              {
                id: crypto.randomUUID(),
                text: `${botName}: ${botText}`,
                createdAt: new Date().toISOString(),
                fromMe: false,
                system: false,
                authorId: "BOT",
              },
            ],
          }));

          await refreshEventMeta();
          await refreshSurvey();
        }
      } catch {
        setMessagesByChat((prev) => ({
          ...prev,
          [selectedChatId]: [
            ...(prev[selectedChatId] || []),
            {
              id: crypto.randomUUID(),
              text: "⚠️ Sunucuya ulaşılamadı",
              createdAt: new Date().toISOString(),
              fromMe: false,
              system: true,
              authorId: "BOT",
            },
          ],
        }));
      } finally {
        setTimeout(() => (sendingRef.current = false), 300);
      }
    },
    [
      chat,
      currentUserId,
      selectedChatId,
      nameOf,
      refreshEventMeta,
      refreshSurvey,
    ]
  );

  const handleClearChat = useCallback(async () => {
    if (!chat?.groupId) return;
    try {
      await fetch(
        `${API}/ui/messages?groupId=${encodeURIComponent(chat.groupId)}`,
        { method: "DELETE" }
      );
    } finally {
      setMessagesByChat((prev) => ({ ...prev, [selectedChatId]: [] }));
    }
  }, [chat, selectedChatId]);

  const switchUser = (u) => {
    if (!u || u === currentUserId) return;
    setMessagesByChat({});
    navigate(
      `/${encodeURIComponent(u)}${chat ? `?group=${chat.groupId}` : ""}`
    );
  };

  const showCards = !!survey && !!(eventMeta?.published || isModeratorOfEvent);

  return (
    <div className="w-screen h-screen bg-slate-100">
      <div className="max-w-[1600px] mx-auto h-full grid grid-cols-[360px_1fr]">
        <Sidebar
          chats={chats}
          activeId={selectedChatId}
          onSelect={(id) => {
            setSelectedChatId(id);
            const picked = chats.find((c) => c.id === id);
            if (picked) {
              navigate(
                `/${encodeURIComponent(currentUserId)}?group=${picked.groupId}`,
                { replace: true }
              );
            }
          }}
        />

        <div className="flex flex-col h-full border-l border-slate-200">
          <ChatHeader
            chat={chat || { title: "Sohbet" }}
            onClearChat={handleClearChat}
          />

          <div className="border-b bg-white px-4 py-2">
            <span className="text-sm text-slate-500">
              Kullanıcı:{" "}
              <select
                className="border rounded px-2 py-1"
                value={currentUserId}
                onChange={(e) => switchUser(e.target.value)}
              >
                <option value="U1">U1</option>
                <option value="U2">U2</option>
                <option value="U3">U3</option>
                <option value="U4">U4</option>
                <option value="U5">U5</option>
                <option value="U6">U6</option>
                <option value="U7">U7</option>
                <option value="U8">U8</option>
                <option value="U9">U9</option>
                <option value="U10">U10</option>
              </select>
            </span>
          </div>

          <div className="flex-1 bg-white relative overflow-hidden">
            <div className="absolute inset-0 bg-bip-doodles opacity-40 pointer-events-none" />
            <div className="absolute inset-0 overflow-y-auto">
              <MessageList
                messages={messages}
                showCards={showCards}
                survey={survey}
                surveyStats={surveyStats}
                onSurveySubmit={handleSurveySubmit}
                surveySubmitting={surveySubmitting}
                isModerator={isModeratorOfEvent}
              />
            </div>
          </div>

          <Composer
            onSend={sendMessage}
            onEvent={() => {}}
            commands={COMMANDS}
          />
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/U1" replace />} />
        <Route path="/:userId" element={<AppShell />} />
      </Routes>
    </BrowserRouter>
  );
}
