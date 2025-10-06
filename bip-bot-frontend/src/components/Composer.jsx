// components/Composer.jsx
import { useEffect, useMemo, useRef, useState } from "react";

const COOLDOWN_MS = 2000; // sadece "/" ile başlayan komutlar için 2 sn

export default function Composer({ onSend, commands = [] }) {
  const [text, setText] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [cooldownUntil, setCooldownUntil] = useState(0); // epoch ms
  const [now, setNow] = useState(Date.now());
  const taRef = useRef(null);

  // cooldown göstergesini canlı tut
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, []);
  const remainingMs = Math.max(0, cooldownUntil - now);
  const remainingSec = Math.ceil(remainingMs / 1000);

  // 1) Komut listesini sadece köklere indir ("/komut"), sırayı koru ve teke düşür
  const baseCommands = useMemo(() => {
    const seen = new Set();
    const bases = [];
    (commands || []).forEach((c) => {
      const tok =
        String(c || "")
          .trim()
          .split(/\s+/)[0] || "";
      if (tok.startsWith("/") && !seen.has(tok)) {
        seen.add(tok);
        bases.push(tok);
      }
    });
    return bases;
  }, [commands]);

  // 2) Kullanıcının yazdığı metin '/' ile başlıyorsa query üret
  const query = useMemo(() => {
    const t = text.trimStart();
    return t.startsWith("/") ? t.slice(1) : null;
  }, [text]);

  // 3) Filtreli öneri listesi (sadece komut kökleri)
  const list = useMemo(() => {
    if (query === null) return [];
    const q = query.toLowerCase();
    if (q.length === 0) return baseCommands.slice(0, 8);
    return baseCommands
      .filter((b) => b.toLowerCase().startsWith("/" + q))
      .slice(0, 8);
  }, [query, baseCommands]);

  useEffect(() => {
    setOpen(query !== null && list.length > 0);
    setActive(0);
  }, [query, list.length]);

  const focusEnd = () => {
    requestAnimationFrame(() => {
      const el = taRef.current;
      if (!el) return;
      const end = el.value.length;
      el.focus();
      el.setSelectionRange?.(end, end);
    });
  };

  const applySuggestion = (cmdBase) => {
    // yalnızca kök + boşluk
    const next = cmdBase + " ";
    setText(next);
    setOpen(false);
    focusEnd();
  };

  const trySend = () => {
    const t = text.trim();
    if (!t) return;

    // öneri açıksa ve slash ile başlıyorsa önce seçili öneriyi uygula
    if (open && list.length > 0 && t.startsWith("/")) {
      applySuggestion(list[active]);
      return;
    }

    // Komutsa ve cooldown devam ediyorsa engelle
    if (t.startsWith("/")) {
      if (Date.now() < cooldownUntil) {
        // sadece görsel uyarı; gönderme
        return;
      }
      setCooldownUntil(Date.now() + COOLDOWN_MS);
    }

    onSend?.(t);
    setText("");
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      trySend();
      return;
    }
    if (open) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActive((s) => (s + 1) % list.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActive((s) => (s - 1 + list.length) % list.length);
      } else if (e.key === "Tab") {
        e.preventDefault();
        applySuggestion(list[active]);
      } else if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
      }
    }
  };

  const isCommand = text.trim().startsWith("/");
  const sendDisabled = isCommand && remainingMs > 0;

  return (
    <div className="bg-white border-t border-slate-200 px-4 py-3">
      <div className="relative">
        <textarea
          ref={taRef}
          rows={1}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Mesajınızı yazın (komutlar için '/' yazın)"
          className="w-full resize-none rounded-2xl border border-slate-300 px-4 py-2 outline-none focus:ring-2 focus:ring-sky-400"
        />

        {/* Slash komut paleti (sadece /komut) */}
        {open && (
          <div className="absolute left-0 bottom-12 z-20 w-[420px] max-w-[90vw] rounded-xl border border-slate-200 bg-white shadow-xl">
            <div className="px-3 py-2 text-xs text-slate-500 border-b">
              Komutlar
            </div>
            <ul className="max-h-72 overflow-y-auto py-1">
              {list.map((cmd, i) => (
                <li
                  key={cmd}
                  onMouseEnter={() => setActive(i)}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    applySuggestion(cmd);
                  }}
                  className={`px-3 py-2 cursor-pointer text-sm ${
                    i === active
                      ? "bg-sky-50 text-sky-700"
                      : "hover:bg-slate-50"
                  }`}
                >
                  <span className="font-mono">{cmd}</span>
                </li>
              ))}
            </ul>
            <div className="px-3 py-2 text-[11px] text-slate-400 border-t">
              ↑/↓ gezin • Enter gönder • Tab yerleştir • Esc kapat
            </div>
          </div>
        )}

        {/* Cooldown uyarısı (sadece komutlarda) */}
        {sendDisabled && (
          <div className="mt-2 text-xs text-amber-600">
            Çok hızlısın 🙂 Komutlar için lütfen {remainingSec} sn bekle.
          </div>
        )}

        <div className="mt-2 flex justify-end">
          <button
            onClick={trySend}
            disabled={sendDisabled}
            className={`px-4 py-2 rounded-2xl font-medium text-white ${
              sendDisabled
                ? "bg-slate-400 cursor-not-allowed"
                : "bg-sky-500 hover:bg-sky-600"
            }`}
            title={
              sendDisabled
                ? `Komutlar için ${remainingSec} sn bekleyin`
                : "Gönder"
            }
          >
            Gönder
          </button>
        </div>
      </div>
    </div>
  );
}
