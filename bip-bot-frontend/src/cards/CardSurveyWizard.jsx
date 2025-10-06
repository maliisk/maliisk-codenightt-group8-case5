import { useMemo, useState } from "react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

function Progress({ label, value, total }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="mb-2">
      <div className="flex justify-between text-xs text-slate-600 mb-1">
        <span>{label}</span>
        <span>{pct}%</span>
      </div>
      <div className="h-2 rounded bg-slate-200 overflow-hidden">
        <div className="h-full bg-sky-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function CardSurveyWizard({ survey, onSubmit, submitting }) {
  const [step, setStep] = useState(1);
  const [slotId, setSlotId] = useState(survey.my?.slotId ?? null);
  const [choiceId, setChoiceId] = useState(survey.my?.choiceId ?? null);
  const [participate, setParticipate] = useState(!!survey.my?.participate);
  const [amount, setAmount] = useState(survey.my?.amount ?? 0);

  const totalYes = useMemo(
    () => (survey.slots || []).reduce((a, s) => a + (s.yes || 0), 0),
    [survey.slots]
  );
  const totalVotes = useMemo(
    () => (survey.places || []).reduce((a, c) => a + (c.votes || 0), 0),
    [survey.places]
  );

  const fmt = (iso) => format(new Date(iso), "d MMM HH:mm", { locale: tr });

  if (!survey?.eventId) return null;

  return (
    <div className="max-w-[700px] bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
      <div className="font-semibold text-slate-900">
        {survey.title || "Etkinlik"}
      </div>

      {/* SONUÇ görünümü (submitten sonra veya submitted=true geldiyse) */}
      {survey.submitted ? (
        <div className="mt-3">
          <div className="text-sm text-slate-600 mb-2">Cevabınız alındı ✅</div>
          <div className="text-sm font-medium text-slate-800 mb-2">
            Tarih adayları
          </div>
          {survey.slots?.map((s) => (
            <Progress
              key={s.slotId}
              label={`${fmt(s.start)}–${fmt(s.end)}`}
              value={s.yes || 0}
              total={Math.max(totalYes, 1)}
            />
          ))}

          <div className="text-sm font-medium text-slate-800 mt-4 mb-2">
            Mekân adayları
          </div>
          {survey.places?.map((p) => (
            <Progress
              key={p.choiceId}
              label={p.text}
              value={p.votes || 0}
              total={Math.max(totalVotes, 1)}
            />
          ))}
        </div>
      ) : (
        <>
          {/* STEP 1: Tarih slotu */}
          {step === 1 && (
            <div className="mt-3">
              <div className="text-sm font-medium text-slate-800 mb-2">
                Tarih aralığını seç
              </div>
              <div className="space-y-2">
                {survey.slots?.map((s) => (
                  <label
                    key={s.slotId}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 cursor-pointer border border-slate-200"
                  >
                    <input
                      type="radio"
                      name="slot"
                      checked={slotId === s.slotId}
                      onChange={() => setSlotId(s.slotId)}
                    />
                    <span className="text-sm">
                      {fmt(s.start)} – {fmt(s.end)}
                    </span>
                  </label>
                ))}
              </div>

              <div className="mt-3 flex justify-end">
                <button
                  disabled={!slotId}
                  onClick={() => setStep(2)}
                  className="px-4 py-2 rounded-lg text-white bg-sky-500 disabled:opacity-50"
                >
                  Devam
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Mekân */}
          {step === 2 && (
            <div className="mt-3">
              <div className="text-sm font-medium text-slate-800 mb-2">
                Mekan seç
              </div>
              <div className="space-y-2">
                {survey.places?.map((p) => (
                  <label
                    key={p.choiceId}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 cursor-pointer border border-slate-200"
                  >
                    <input
                      type="radio"
                      name="place"
                      checked={choiceId === p.choiceId}
                      onChange={() => setChoiceId(p.choiceId)}
                    />
                    <span className="text-sm">{p.text}</span>
                  </label>
                ))}
              </div>

              <div className="mt-3 flex justify-between">
                <button
                  onClick={() => setStep(1)}
                  className="px-4 py-2 rounded-lg border"
                >
                  Geri
                </button>
                <button
                  disabled={!choiceId}
                  onClick={() => setStep(3)}
                  className="px-4 py-2 rounded-lg text-white bg-sky-500 disabled:opacity-50"
                >
                  Devam
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Masraf */}
          {step === 3 && (
            <div className="mt-3">
              <div className="text-sm font-medium text-slate-800 mb-2">
                Masraf paylaşımı
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 cursor-pointer border border-slate-200">
                  <input
                    type="radio"
                    name="exp"
                    checked={participate === true}
                    onChange={() => setParticipate(true)}
                  />
                  <span className="text-sm">Masrafa ortağım</span>
                </label>

                <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 cursor-pointer border border-slate-200">
                  <input
                    type="radio"
                    name="exp"
                    checked={participate === false}
                    onChange={() => setParticipate(false)}
                  />
                  <span className="text-sm">Masrafa ortak değilim</span>
                </label>
              </div>

              <div className="mt-3">
                <label className="text-xs text-slate-500 block mb-1">
                  (Opsiyonel) Katkı tutarı
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  disabled={!participate}
                  value={amount}
                  onChange={(e) => setAmount(parseFloat(e.target.value || "0"))}
                  className="w-full border rounded-lg px-3 py-2 disabled:bg-slate-100"
                  placeholder="0.00"
                />
              </div>

              <div className="mt-3 flex justify-between">
                <button
                  onClick={() => setStep(2)}
                  className="px-4 py-2 rounded-lg border"
                >
                  Geri
                </button>
                <button
                  onClick={() =>
                    onSubmit?.({
                      slotId,
                      choiceId,
                      participate,
                      amount: participate ? Number(amount || 0) : 0,
                    })
                  }
                  disabled={submitting}
                  className="px-4 py-2 rounded-lg text-white bg-emerald-600 disabled:opacity-50"
                >
                  Gönder
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
