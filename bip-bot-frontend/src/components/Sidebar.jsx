import { Search, Bell, EllipsisVertical } from "./icons";

export default function Sidebar({ chats, activeId, onSelect }) {
  return (
    <aside className="h-full bg-slate-50 border-r border-slate-200">
      <div className="px-4 h-16 flex items-center gap-2">
        <div className="w-10 h-10 rounded-full bg-sky-500 text-white grid place-items-center font-semibold">
          MA
        </div>
        <div className="flex-1 font-medium">Muhammed Ali Işık</div>
        <button className="p-2 hover:bg-slate-200 rounded-lg">
          <Bell />
        </button>
        <button className="p-2 hover:bg-slate-200 rounded-lg">
          <EllipsisVertical />
        </button>
      </div>

      <div className="px-4">
        <div className="relative">
          <input
            placeholder="Ara"
            className="w-full rounded-2xl bg-white pl-10 pr-4 py-2 border border-slate-200 outline-none focus:ring-2 focus:ring-sky-400"
          />
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
            <Search />
          </div>
        </div>
      </div>

      <div className="mt-3 border-t border-slate-200" />

      <ul className="overflow-y-auto h-[calc(100%-140px)]">
        {chats.map((c) => (
          <li
            key={c.id}
            onClick={() => onSelect(c.id)}
            className={`px-4 py-3 flex items-center gap-3 cursor-pointer ${
              c.id === activeId ? "bg-sky-50" : "hover:bg-slate-100"
            }`}
          >
            <div className="w-10 h-10 rounded-full bg-slate-200 grid place-items-center">
              {c.isGroup ? "👥" : "🧑"}
            </div>
            <div className="min-w-0">
              <div className="font-medium truncate">{c.title}</div>
              <div className="text-sm text-slate-500 truncate">
                {c.subtitle}
              </div>
            </div>
            <div className="ml-auto text-xs text-slate-400">{c.time}</div>
          </li>
        ))}
      </ul>
    </aside>
  );
}
