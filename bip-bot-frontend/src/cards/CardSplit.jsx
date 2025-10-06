import { useEffect, useMemo, useState } from "react";
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

export default function CardSplit({ eventId, userId }) {
  const [summary, setSummary] = useState(null);
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [weight, setWeight] = useState("1");

  const refresh = async () => {
    const s = await get(`/events/${eventId}/summary`);
    setSummary(s);
  };
  useEffect(() => {
    if (eventId) refresh();
  }, [eventId]);

  const rows = useMemo(() => {
    if (!summary?.balances) return [];
    return Object.entries(summary.balances)
      .map(([uid, amt]) => ({ userId: uid, amount: Number(amt || 0) }))
      .sort((a, b) => b.amount - a.amount);
  }, [summary]);

  const addExpense = async (e) => {
    e.preventDefault();
    if (!amount) return;
    await post(`/events/${eventId}/expense`, {
      userId,
      amount: Number(amount),
      notes: notes || "",
      weight: Number(weight || "1"),
    });
    setAmount("");
    setNotes("");
    setWeight("1");
    refresh();
  };

  if (!eventId)
    return (
      <div className="text-slate-500">Önce /yeni ile etkinlik oluştur.</div>
    );

  return (
    <div className="rounded-2xl border bg-white overflow-hidden">
      <div className="px-4 py-3 border-b">
        <div className="text-xs text-slate-500">Masraf Paylaşımı</div>
        <div className="font-semibold">
          Toplam: {(summary?.total ?? 0).toFixed(2)} ₺
        </div>
      </div>

      <div className="p-3 max-h-[360px] overflow-auto grid gap-3">
        <form onSubmit={addExpense} className="grid grid-cols-3 gap-2">
          <input
            type="number"
            step="0.01"
            className="border rounded-lg px-2 py-1"
            placeholder="Tutar"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
          <input
            className="border rounded-lg px-2 py-1"
            placeholder='Açıklama (örn. "Pizza")'
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          <input
            type="number"
            step="0.1"
            className="border rounded-lg px-2 py-1"
            placeholder="Ağırlık"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
          />
          <div className="col-span-3">
            <button className="w-full rounded-lg border px-3 py-1.5 hover:bg-slate-50">
              Ekle
            </button>
          </div>
        </form>

        <div className="border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500">
                <th className="py-2 px-3">Kişi</th>
                <th className="py-2 px-3 text-right">Bakiye</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.userId} className="border-t">
                  <td className="py-2 px-3">{r.userId}</td>
                  <td
                    className={`py-2 px-3 text-right font-medium ${
                      r.amount >= 0 ? "text-emerald-600" : "text-rose-600"
                    }`}
                  >
                    {r.amount.toFixed(2)} ₺ {r.amount >= 0 ? "alacak" : "borç"}
                  </td>
                </tr>
              ))}
              {!rows.length && (
                <tr>
                  <td colSpan={2} className="py-8 text-center text-slate-400">
                    Henüz masraf yok.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
