import { post } from "../api/lib/api";

export default function EventHeader({
  eventId,
  title,
  isModerator = false,
  onRefresh,
}) {
  const remind = async (hours) => {
    await post(`/events/${eventId}/remind`, { hours });
    onRefresh?.();
  };

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white border-b">
      <div>
        <div className="text-sm text-slate-500">Etkinlik</div>
        <div className="text-lg font-semibold">{title || `#${eventId}`}</div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => remind(24)}
          className="px-3 py-1.5 rounded-lg border text-sm hover:bg-slate-50"
        >
          24s Hatırlat
        </button>
        <button
          onClick={() => remind(1)}
          className="px-3 py-1.5 rounded-lg border text-sm hover:bg-slate-50"
        >
          1s Hatırlat
        </button>

        {isModerator && (
          <a
            className="px-3 py-1.5 rounded-lg border text-sm hover:bg-slate-50"
            target="_blank"
            rel="noreferrer"
            href={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
              location.origin
            )}`}
          >
            Davet QR
          </a>
        )}
      </div>
    </div>
  );
}
