// src/pages/PollPage.jsx
import { useEffect, useState } from "react";
import { get, post } from "../api/lib/api";
import EventHeader from "../components/EventHeader";

export default function PollPage({ eventId, userId }) {
  const [title, setTitle] = useState("");
  const [poll, setPoll] = useState(null); // {pollId,question,locked,choices:[{choiceId,text,votes}], myChoiceId}

  const [newChoice, setNewChoice] = useState("");
  const [creating, setCreating] = useState(false);

  const refresh = async () => {
    // BE: GET /events/{id}/poll → {pollId,question,locked,choices:[{choiceId,text,votes}], myChoiceId}
    const p = await get(`/events/${eventId}/poll`);
    const ev = await get(`/events/${eventId}/summary`);
    setTitle(ev.title);
    setPoll(p || null);
  };

  useEffect(() => {
    refresh();
  }, [eventId]);

  const createIfMissing = async () => {
    setCreating(true);
    try {
      await post(`/events/${eventId}/poll`, {
        question: "Mekan seçimi",
        choices: ["Kütüphane", "Kafe 2. Kat", "Mühendislik 101"],
      });
      await refresh();
    } finally {
      setCreating(false);
    }
  };

  const vote = async (choiceId) => {
    // optimistic: her kullanıcı tek oy
    setPoll((p) => {
      if (!p) return p;
      const prev = p.myChoiceId;
      return {
        ...p,
        myChoiceId: choiceId,
        choices: p.choices.map((c) => {
          if (c.choiceId === choiceId) return { ...c, votes: c.votes + 1 };
          if (c.choiceId === prev)
            return { ...c, votes: Math.max(0, c.votes - 1) };
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
    if (!newChoice.trim() || !poll) return;
    // küçük bir hile: poll'u yeniden create etmek yerine backend tarafında
    // "poll'a seçenek ekle" endpointin varsa ona vur; yoksa createPoll paternini uygula.
    await post(`/events/${eventId}/poll`, {
      question: poll.question,
      choices: [newChoice.trim()],
    });
    setNewChoice("");
    refresh();
  };

  if (!poll) {
    return (
      <div className="h-full flex flex-col">
        <EventHeader eventId={eventId} title={title} onRefresh={refresh} />
        <div className="p-6">
          <div className="bg-white p-6 rounded-xl border">
            <div className="text-slate-600">Henüz anket açılmamış.</div>
            <button
              onClick={createIfMissing}
              className="mt-3 px-4 py-2 rounded-lg bg-sky-500 text-white hover:bg-sky-600"
              disabled={creating}
            >
              {creating ? "Oluşturuluyor..." : "Mekan anketi oluştur"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const total = poll.choices.reduce((a, c) => a + (c.votes || 0), 0) || 1;

  return (
    <div className="h-full flex flex-col">
      <EventHeader eventId={eventId} title={title} onRefresh={refresh} />

      <div className="p-4 grid gap-4">
        {/* Soru */}
        <div className="bg-white p-4 rounded-xl border">
          <div className="text-sm text-slate-500 mb-1">Soru</div>
          <div className="text-lg font-semibold">{poll.question}</div>
        </div>

        {/* Seçenekler & oy verme */}
        <div className="bg-white p-4 rounded-xl border">
          <div className="text-sm text-slate-500 mb-3">Seçenekler</div>

          <div className="grid gap-2">
            {poll.choices.map((c) => {
              const ratio = Math.round(((c.votes || 0) / total) * 100);
              const selected = poll.myChoiceId === c.choiceId;
              return (
                <button
                  key={c.choiceId}
                  onClick={() => vote(c.choiceId)}
                  className={`text-left relative overflow-hidden rounded-xl border p-3 hover:bg-slate-50 ${
                    selected ? "border-sky-300 ring-1 ring-sky-300" : ""
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

          <form onSubmit={addChoice} className="mt-4 flex gap-2">
            <input
              className="border rounded-lg px-3 py-2 flex-1"
              placeholder="Yeni aday yer (örn. Ek Bina Kafe)"
              value={newChoice}
              onChange={(e) => setNewChoice(e.target.value)}
            />
            <button className="px-3 py-2 rounded-lg border hover:bg-slate-50">
              Ekle
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
