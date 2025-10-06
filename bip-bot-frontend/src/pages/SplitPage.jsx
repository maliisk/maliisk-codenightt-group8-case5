import { useEffect, useMemo, useState } from "react";
import { get, post } from "../api/lib/api";
import EventHeader from "../components/EventHeader";

export default function SplitPage({ eventId, userId }) {
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState(null);
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [weight, setWeight] = useState("1");

  const refresh = async () => {
    const s = await get(`/events/${eventId}/summary`);
    setTitle(s.title);
    setSummary(s);
  };
  useEffect(() => {
    refresh();
  }, [eventId]);

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

  const rows = useMemo(() => {
    if (!summary?.balances) return [];
    return Object.entries(summary.balances)
      .map(([uid, amt]) => ({
        userId: uid,
        amount: Number(amt || 0),
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [summary]);

  return (
    <div className="h-full flex flex-col">
      <EventHeader eventId={eventId} title={title} onRefresh={refresh} />

      <div className="p-4 grid md:grid-cols-[420px_1fr] gap-4">
        <div className="bg-white p-4 rounded-xl border">
          <div className="text-sm text-slate-500 mb-2">Gider ekle</div>
          <form onSubmit={addExpense} className="grid gap-2">
            <input
              type="number"
              step="0.01"
              className="border rounded-lg px-3 py-2"
              placeholder="Tutar (ör. 180)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
            <input
              className="border rounded-lg px-3 py-2"
              placeholder='Açıklama (örn. "Pizza")'
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            <input
              type="number"
              step="0.1"
              className="border rounded-lg px-3 py-2"
              placeholder="Ağırlık (varsayılan 1)"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
            />
            <button className="mt-1 rounded-lg bg-sky-500 text-white px-3 py-2 hover:bg-sky-600">
              Ekle
            </button>
          </form>

          <div className="mt-4 text-sm text-slate-500">
            Bölüşüm: pay = (toplam * weight_i) / sum(weights) &nbsp;•&nbsp;
            “pizza yemeyen” için 0 yaz :)
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm text-slate-500">Toplam</div>
            <div className="text-xl font-semibold">
              {(summary?.total ?? 0).toFixed(2)} ₺
            </div>
          </div>

          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500">
                  <th className="py-2">Kişi</th>
                  <th className="py-2 text-right">Bakiye</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.userId} className="border-t">
                    <td className="py-2">{r.userId}</td>
                    <td
                      className={`py-2 text-right font-medium ${
                        r.amount >= 0 ? "text-emerald-600" : "text-rose-600"
                      }`}
                    >
                      {r.amount.toFixed(2)} ₺{" "}
                      {r.amount >= 0 ? "alacak" : "borç"}
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

          {rows.length >= 2 && (
            <div className="mt-4 text-sm text-slate-600">
              <div className="font-medium mb-1">Öneri:</div>
              <p>
                Pozitifler “alacak”, negatifler “borç”. Borçlular, alacaklılara
                toplamı kadar ödeme yaparsa sistem kapanır.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
