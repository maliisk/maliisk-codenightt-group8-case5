import { useMemo, useRef, useState } from "react";

export default function ChatHeader({ chat, onClearChat }) {
  const [showInvite, setShowInvite] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const inviteLink = useMemo(() => {
    if (!chat?.groupId) return window.location.origin;
    return `${window.location.origin}/join?group=${encodeURIComponent(
      chat.groupId
    )}`;
  }, [chat?.groupId]);

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
    inviteLink
  )}`;

  return (
    <div className="h-14 bg-white border-b border-slate-200 px-4 flex items-center justify-between">
      <div className="font-medium text-slate-900 truncate">
        {chat?.title || "Sohbet"}
      </div>

      <div className="flex items-center gap-2 relative">
        <button
          onClick={() => setShowInvite((s) => !s)}
          title="Gruba davet et"
          className="p-2 rounded-lg hover:bg-slate-100"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M13.5 10.5l-3 3M8 12a4 4 0 015.657-3.657l1.2.6M16 12a4 4 0 01-5.657 3.657l-1.2-.6"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M7 12a5 5 0 015-5h1"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
            <path
              d="M17 12a5 5 0 01-5 5h-1"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        </button>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((s) => !s)}
            title="Diğer ayarlar"
            className="p-2 rounded-lg hover:bg-slate-100"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="5" r="1.8" />
              <circle cx="12" cy="12" r="1.8" />
              <circle cx="12" cy="19" r="1.8" />
            </svg>
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-44 bg-white border border-slate-200 rounded-lg shadow-lg z-30">
              <button
                onClick={async () => {
                  setMenuOpen(false);
                  if (!chat?.groupId) return;
                  const ok = window.confirm(
                    "Bu sohbetin tüm mesajlarını silmek istiyor musunuz?"
                  );
                  if (!ok) return;
                  await onClearChat?.();
                }}
                className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50"
              >
                Sohbeti temizle
              </button>
            </div>
          )}
        </div>
      </div>

      {showInvite && (
        <div
          className="absolute right-4 top-16 w-[320px] bg-white border border-slate-200 rounded-2xl shadow-xl p-4 z-20"
          onMouseLeave={() => setShowInvite(false)}
        >
          <div className="font-medium text-slate-900 mb-2">Gruba davet et</div>
          <img
            src={qrUrl}
            alt="QR"
            className="w-[220px] h-[220px] rounded border mx-auto"
          />
          <div className="mt-3 text-xs text-slate-500">Davet linki</div>
          <div className="mt-1 p-2 rounded bg-slate-50 border text-[12px] break-all">
            {inviteLink}
          </div>
          <div className="mt-3 flex justify-end">
            <button
              onClick={() => {
                navigator.clipboard?.writeText(inviteLink);
              }}
              className="px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-600 text-white text-sm"
            >
              Kopyala
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
