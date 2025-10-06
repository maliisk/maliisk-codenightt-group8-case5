import { useEffect, useState } from "react";
const API = import.meta.env.VITE_API_URL || "http://localhost:8080";
async function get(p) {
  const r = await fetch(`${API}${p}`);
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}
async function post(p, b = {}) {
  const r = await fetch(`${API}${p}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(b),
  });
  if (!r.ok) throw new Error(await r.text());
  try {
    return await r.json();
  } catch {
    return {};
  }
}

export default function CardPoll({ eventId, userId }) {
  const [poll, setPoll] = useState(null);
  const [title, setTitle] = useState("");
  const [newChoice, setNewChoice] = useState("");

  const refresh = async () => {
    const ev = await get(`/events/${eventId}/summary`);
    setTitle(ev.title);
    try {
      const p = await get(`/events/${eventId}/poll`);
      setPoll(p || null);
    } catch {
      setPoll(null);
    }
  };
  useEffect(() => {
    if (eventId) refresh();
  }, [eventId]);

  const createIfMissing = async () => {
    await post(`/events/${eventId}/poll`, {
      question: "Mekan seçimi",
      choices: ["Kütüphane", "Kafe 2.Kat", "Müh 101"],
    });
    refresh();
  };

  const vote = async (choiceId) => {
    if (!poll) return;
    // optimistic tek oy
    setPoll((p) => {
      const prev = p.myChoiceId;
      return {
        ...p,
        myChoiceId: choiceId,
        choices: p.choices.map((c) => {
          if (c.choiceId === choiceId)
            return { ...c, votes: (c.votes || 0) + 1 };
          if (c.choiceId === prev)
            return { ...c, votes: Math.max(0, (c.votes || 0) - 1) };
          return c;
        }),
      };
    });
    try {
      await post(`/events/${eventId}/vote`, { userId, choiceId });
    } catch {
      refresh();
    }
  };

  const addChoice = async (e) => {
    e.preventDefault();
    if (!newChoice.trim()) return;
    await post(`/events/${eventId}/poll`, {
      question: poll?.question || "Mekan seçimi",
      choices: [newChoice.trim()],
    });
    setNewChoice("");
    refresh();
  };

  if (!eventId)
    return (
      <div className="text-slate-500">Önce /yeni ile etkinlik oluştur.</div>
    );

  return (
    <div className="rounded-2xl border bg-white overflow-hidden">
      <div className="px-4 py-3 border-b">
        <div className="text-xs text-slate-500">Mekân Oylaması</div>
        <div className="font-semibold">{title || `#${eventId}`}</div>
      </div>

      <div className="p-3 max-h-[360px] overflow-auto space-y-3">
        {!poll && (
          <div className="bg-slate-50 border rounded-xl p-3">
            <div className="text-slate-600">Henüz anket açılmamış.</div>
            <button
              onClick={createIfMissing}
              className="mt-2 px-3 py-1.5 rounded-lg bg-sky-500 text-white hover:bg-sky-600"
            >
              Mekan anketi oluştur
            </button>
          </div>
        )}

        {poll && (
          <>
            <div className="font-medium">{poll.question}</div>
            <div className="grid gap-2">
              {poll.choices.map((c) => {
                const total =
                  poll.choices.reduce((a, b) => a + (b.votes || 0), 0) || 1;
                const ratio = Math.round(((c.votes || 0) / total) * 100);
                const sel = poll.myChoiceId === c.choiceId;
                return (
                  <button
                    key={c.choiceId}
                    onClick={() => vote(c.choiceId)}
                    className={`relative text-left border rounded-xl p-3 hover:bg-slate-50 ${
                      sel ? "border-sky-300 ring-1 ring-sky-200" : ""
                    }`}
                  >
                    <div
                      className="absolute inset-y-0 left-0 bg-sky-100"
                      style={{ width: `${ratio}%` }}
                    />
                    <div className="relative flex items-center justify-between">
                      <div className="font-medium">{c.text}</div>
                      <div className="text-sm text-slate-600">
                        🗳 {c.votes || 0}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <form onSubmit={addChoice} className="mt-3 flex gap-2">
              <input
                className="border rounded-lg px-3 py-1.5 flex-1"
                placeholder="Yeni aday yer"
                value={newChoice}
                onChange={(e) => setNewChoice(e.target.value)}
              />
              <button className="px-3 py-1.5 rounded-lg border hover:bg-slate-50">
                Ekle
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
