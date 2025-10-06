import { format, isToday } from "date-fns";
import { tr } from "date-fns/locale";
import clsx from "clsx";
import CardSurveyWizard from "../cards/CardSurveyWizard";

function DayPill({ date }) {
  return (
    <div className="flex justify-center my-6">
      <div className="px-4 py-1 rounded-full bg-slate-200/70 text-slate-700 text-sm">
        {isToday(date) ? "Bugün" : format(date, "d MMM yyyy", { locale: tr })}
      </div>
    </div>
  );
}

function Bubble({ m }) {
  const time = format(new Date(m.createdAt), "HH:mm", { locale: tr });
  return (
    <div
      className={clsx("max-w-[70%] relative px-3 py-2 rounded-2xl mb-2", {
        "ml-auto bg-sky-100 bubble-tail bubble-right": m.fromMe,
        "mr-auto bg-slate-100 bubble-tail bubble-left": !m.fromMe,
      })}
    >
      <div className="whitespace-pre-wrap break-words">{m.text}</div>
      <div
        className={clsx("text-[10px] mt-1", {
          "text-right text-sky-700": m.fromMe,
          "text-left text-slate-500": !m.fromMe,
        })}
      >
        {time}
      </div>
    </div>
  );
}

export default function MessageList({
  messages,
  survey,
  onSurveySubmit,
  surveySubmitting,
  isModerator,
}) {
  const items = [];
  let lastDay = "";
  for (const m of messages) {
    const dayKey = format(new Date(m.createdAt), "yyyy-MM-dd");
    if (dayKey !== lastDay) {
      items.push({
        type: "day",
        date: new Date(m.createdAt),
        id: `d_${dayKey}`,
      });
      lastDay = dayKey;
    }
    items.push({ type: "msg", ...m });
  }

  const toDate = (val) => (val ? new Date(val) : null);

  return (
    <div className="h-full overflow-y-auto px-6 py-6 relative">
      <div className="relative z-10">
        {items.map((it) =>
          it.type === "day" ? (
            <DayPill key={it.id} date={it.date} />
          ) : (
            <Bubble key={it.id} m={it} />
          )
        )}

        {isModerator && survey?.eventId && (
          <div className="mt-6 mr-auto" style={{ maxWidth: 720 }}>
            {console.debug("survey", survey)}
            <div className="border rounded-xl p-4 bg-white shadow-sm">
              <div className="font-semibold mb-3">
                📊 Anket Sonuçları — {survey.title}
              </div>

              {Array.isArray(survey.slots) && survey.slots.length > 0 && (
                <div className="mb-3">
                  <div className="text-sm text-slate-600 mb-1">
                    Zaman Uygunluğu
                  </div>
                  <ul className="space-y-1">
                    {survey.slots.map((s) => {
                      const startIso = s.startTime ?? s.start;
                      const endIso = s.endTime ?? s.end;
                      const start = toDate(startIso);
                      const end = toDate(endIso);
                      return (
                        <li
                          key={s.slotId}
                          className="text-sm flex items-center justify-between border rounded-md px-2 py-1"
                        >
                          <span>
                            {start
                              ? `${format(start, "d MMM HH:mm", {
                                  locale: tr,
                                })} — ${
                                  end
                                    ? format(end, "HH:mm", { locale: tr })
                                    : "?"
                                }`
                              : "Tarih bilgisi yok"}
                          </span>
                          <span className="font-medium">
                            ✅ {typeof s.yesCount === "number" ? s.yesCount : 0}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              {Array.isArray(survey.choices) && survey.choices.length > 0 && (
                <div className="mb-1">
                  <div className="text-sm text-slate-600 mb-1">
                    Mekân Oylaması
                  </div>
                  <ul className="space-y-1">
                    {survey.choices.map((c) => (
                      <li
                        key={c.choiceId}
                        className="text-sm flex items-center justify-between border rounded-md px-2 py-1"
                      >
                        <span>{c.text}</span>
                        <span className="font-medium">
                          🗳️ {typeof c.voteCount === "number" ? c.voteCount : 0}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {!isModerator && survey?.eventId && !survey.submitted && (
          <div className="mt-4 mr-auto" style={{ maxWidth: 720 }}>
            <CardSurveyWizard
              survey={survey}
              onSubmit={onSurveySubmit}
              submitting={surveySubmitting}
            />
          </div>
        )}
      </div>
    </div>
  );
}
