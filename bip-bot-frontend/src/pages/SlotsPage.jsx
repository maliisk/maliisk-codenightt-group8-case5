import { useEffect, useMemo, useState } from "react";
import { get, post } from "../api/lib/api";
import EventHeader from "../components/EventHeader";

function fmt(dt) {
  const d = new Date(dt.replace(" ", "T").replace("Z", "") + "Z");
  return d.toLocaleString();
}

export default function SlotsPage({ eventId, userId }) {
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
    refresh();
  }, [eventId]);

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
        start: `${form.date}T${form.start}:00Z`,
        end: `${form.date}T${form.end}:00Z`,
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
        const decMine =
          x.myChoice === "YES"
            ? { yesCount: x.yesCount - 1 }
            : x.myChoice === "NO"
            ? { noCount: x.noCount - 1 }
            : {};
        const incNew =
          choice === "YES"
            ? { yesCount: x.yesCount + 1 }
            : choice === "NO"
            ? { noCount: x.noCount + 1 }
            : {};
        return { ...x, ...decMine, ...incNew, myChoice: choice };
      })
    );
    try {
      await post(`/events/${eventId}/vote-slot`, { userId, slotId, choice });
    } catch {
      refresh();
    }
  };

  const best = useMemo(() => {
    if (!slots.length) return null;
    return [...slots].sort(
      (a, b) => b.yesCount - b.noCount - (a.yesCount - a.noCount)
    )[0];
  }, [slots]);

  return (
    <div className="h-full flex flex-col">
      <EventHeader eventId={eventId} title={title} onRefresh={refresh} />
      <div className="p-4 overflow-auto">
        {/* Slot ekleme */}
        <form
          onSubmit={addSlot}
          className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-2 bg-white p-3 rounded-xl border"
        >
          <input
            type="date"
            className="border rounded-lg px-3 py-2"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            required
          />
          <input
            type="time"
            className="border rounded-lg px-3 py-2"
            value={form.start}
            onChange={(e) => setForm({ ...form, start: e.target.value })}
            required
          />
          <input
            type="time"
            className="border rounded-lg px-3 py-2"
            value={form.end}
            onChange={(e) => setForm({ ...form, end: e.target.value })}
            required
          />
          <button className="rounded-lg bg-sky-500 text-white px-3 py-2 hover:bg-sky-600">
            Slot Ekle
          </button>
        </form>

        {best && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700">
            Önerilen tarih: <b>{fmt(best.start)}</b> – <b>{fmt(best.end)}</b> (✓{" "}
            {best.yesCount} / ✗ {best.noCount})
          </div>
        )}

        <div className="grid gap-3">
          {slots.map((s) => (
            <div key={s.slotId} className="bg-white p-4 rounded-xl border">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-slate-500">Zaman aralığı</div>
                  <div className="font-medium">
                    {fmt(s.start)} — {fmt(s.end)}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-600 text-sm">✓ {s.yesCount}</span>
                  <span className="text-slate-400">/</span>
                  <span className="text-slate-600 text-sm">✗ {s.noCount}</span>
                </div>
              </div>

              <div className="mt-3 flex gap-2">
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
            <div className="text-center text-slate-400 py-10">
              Henüz slot eklenmemiş.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
