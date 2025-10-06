import { useEffect, useMemo, useState } from "react";
const API = import.meta.env.VITE_API_URL || "http://localhost:8080";

async function get(path) {
  const r = await fetch(`${API}${path}`);
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}
async function post(path, body = {}) {
  const r = await fetch(`${API}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(await r.text());
  try {
    return await r.json();
  } catch {
    return {};
  }
}

function fmt(dt) {
  const d = new Date(dt.replace(" ", "T").replace("Z", "") + "Z");
  return d.toLocaleString();
}

export default function CardSlots({ eventId, userId }) {
  const [title, setTitle] = useState("");
  const [slots, setSlots] = useState([]);
  const [form, setForm] = useState({ date: "", start: "", end: "" });
  const [loading, setLoading] = useState(false);

  const refresh = async () => {
    setLoading(true);
    try {
      const list = await get(`/events/${eventId}/slots`);
      const ev = await get(`/events/${eventId}/summary`);
      setTitle(ev.title);
      setSlots(Array.isArray(list) ? list : []);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (eventId) refresh();
  }, [eventId]);

  const best = useMemo(() => {
    if (!slots.length) return null;
    return [...slots].sort(
      (a, b) => b.yesCount - b.noCount - (a.yesCount - a.noCount)
    )[0];
  }, [slots]);

  const addSlot = async (e) => {
    e.preventDefault();
    if (!form.date || !form.start || !form.end) return;
    const tempId = `tmp_${Date.now()}`;
    const optimistic = {
      slotId: tempId,
      start: `${form.date}T${form.start}:00Z`,
      end: `${form.date}T${form.end}:00Z`,
      yesCount: 0,
      noCount: 0,
      myChoice: null,
    };
    setSlots((s) => [optimistic, ...s]);
    try {
      await post(`/events/${eventId}/slots`, {
        start: optimistic.start,
        end: optimistic.end,
      });
      setForm({ date: "", start: "", end: "" });
      refresh();
    } catch {
      setSlots((s) => s.filter((x) => x.slotId !== tempId));
    }
  };

  const vote = async (slotId, choice) => {
    setSlots((s) =>
      s.map((x) => {
        if (x.slotId !== slotId) return x;
        const dec =
          x.myChoice === "YES"
            ? { yesCount: x.yesCount - 1 }
            : x.myChoice === "NO"
            ? { noCount: x.noCount - 1 }
            : {};
        const inc =
          choice === "YES"
            ? { yesCount: x.yesCount + 1 }
            : choice === "NO"
            ? { noCount: x.noCount + 1 }
            : {};
        return { ...x, ...dec, ...inc, myChoice: choice };
      })
    );
    try {
      await post(`/events/${eventId}/vote-slot`, { userId, slotId, choice });
    } catch {
      refresh();
    }
  };

  if (!eventId)
    return (
      <div className="text-slate-500">Önce /yeni ile bir etkinlik oluştur.</div>
    );

  return (
    <div className="rounded-2xl border bg-white overflow-hidden">
      <div className="px-4 py-3 border-b">
        <div className="text-xs text-slate-500">Tarih Slotları</div>
        <div className="font-semibold">{title || `#${eventId}`}</div>
        {best && (
          <div className="mt-2 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-2 py-1 inline-block">
            Önerilen: <b>{fmt(best.start)}</b> – <b>{fmt(best.end)}</b>
          </div>
        )}
      </div>

      <div className="p-3 max-h-[360px] overflow-auto space-y-3">
        <form
          onSubmit={addSlot}
          className="grid grid-cols-2 md:grid-cols-4 gap-2"
        >
          <input
            className="border rounded-lg px-2 py-1"
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            required
          />
          <input
            className="border rounded-lg px-2 py-1"
            type="time"
            value={form.start}
            onChange={(e) => setForm({ ...form, start: e.target.value })}
            required
          />
          <input
            className="border rounded-lg px-2 py-1"
            type="time"
            value={form.end}
            onChange={(e) => setForm({ ...form, end: e.target.value })}
            required
          />
          <button className="rounded-lg border px-2 py-1 hover:bg-slate-50">
            Slot Ekle
          </button>
        </form>

        {slots.map((s) => (
          <div key={s.slotId} className="border rounded-xl p-3">
            <div className="flex items-center justify-between">
              <div className="font-medium">
                {fmt(s.start)} — {fmt(s.end)}
              </div>
              <div className="text-sm text-slate-600">
                ✓ {s.yesCount} / ✗ {s.noCount}
              </div>
            </div>
            <div className="mt-2 flex gap-2">
              <button
                onClick={() => vote(s.slotId, "YES")}
                className={`px-3 py-1.5 rounded-lg border text-sm ${
                  s.myChoice === "YES"
                    ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                    : "hover:bg-slate-50"
                }`}
              >
                Katılırım
              </button>
              <button
                onClick={() => vote(s.slotId, "NO")}
                className={`px-3 py-1.5 rounded-lg border text-sm ${
                  s.myChoice === "NO"
                    ? "bg-rose-50 border-rose-300 text-rose-700"
                    : "hover:bg-slate-50"
                }`}
              >
                Uygun değil
              </button>
            </div>
          </div>
        ))}
        {!loading && !slots.length && (
          <div className="text-center text-slate-400 py-6">Henüz slot yok.</div>
        )}
      </div>
    </div>
  );
}
