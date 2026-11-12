"use client";

import { useState } from "react";
import { useFormState } from "react-dom";
import { createQuizAction, type QuizFormState } from "@/lib/actions/quiz-actions";

export function QuizForm({
  subjects,
  defaultGrade,
}: {
  subjects: { id: string; name: string; icon: string }[];
  defaultGrade: number;
}) {
  const [state, formAction] = useFormState<QuizFormState, FormData>(createQuizAction, undefined);
  const [questionCount, setQuestionCount] = useState(3);

  return (
    <form action={formAction} className="space-y-4 bg-white rounded-2xl shadow-card border border-gray-100 p-6">
      <input type="hidden" name="questionCount" value={questionCount} />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Titel des Quiz</label>
        <input
          name="title"
          required
          minLength={3}
          placeholder="z. B. Grundwissen Zellbiologie"
          className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Fach</label>
          <select
            name="subjectId"
            required
            defaultValue=""
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
          >
            <option value="" disabled>
              Fach wählen
            </option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.icon} {s.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Klassenstufe</label>
          <select
            name="grade"
            defaultValue={defaultGrade}
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
          >
            {Array.from({ length: 13 }, (_, i) => i + 1).map((g) => (
              <option key={g} value={g}>
                Klasse {g}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Beschreibung</label>
        <input
          name="description"
          required
          minLength={5}
          placeholder="Kurz: worum geht's in diesem Quiz?"
          className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
        />
      </div>

      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-gray-700">Fragen</label>
          <button
            type="button"
            onClick={() => setQuestionCount((c) => c + 1)}
            className="text-xs font-semibold text-brand-600 hover:underline"
          >
            + Frage hinzufügen
          </button>
        </div>

        {Array.from({ length: questionCount }, (_, i) => (
          <div key={i} className="rounded-xl border border-gray-100 p-4 space-y-2.5 bg-gray-50/50">
            <p className="text-xs font-bold text-gray-400">FRAGE {i + 1}</p>
            <input
              name={`qtext_${i}`}
              placeholder="Fragetext"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
            <div className="space-y-1.5">
              {[0, 1, 2, 3].map((j) => (
                <div key={j} className="flex items-center gap-2">
                  <input type="radio" name={`ccorrect_${i}`} value={j} required={false} className="accent-brand-600" />
                  <input
                    name={`cchoice_${i}_${j}`}
                    placeholder={`Antwort ${j + 1}`}
                    className="flex-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
                  />
                </div>
              ))}
            </div>
            <p className="text-[11px] text-gray-400">Radiobutton links = richtige Antwort markieren.</p>
            <input
              name={`qexplanation_${i}`}
              placeholder="Erklärung (wird nach der Antwort angezeigt)"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
          </div>
        ))}
        <p className="text-xs text-gray-400">Mindestens 2 vollständige Fragen mit je 4 Antworten nötig.</p>
      </div>

      {state?.error && (
        <p className="text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-lg px-3 py-2">{state.error}</p>
      )}

      <button
        type="submit"
        className="w-full rounded-xl bg-brand-600 hover:bg-brand-700 transition-colors text-white font-semibold py-2.5 text-sm"
      >
        Quiz veröffentlichen (+25 XP)
      </button>
    </form>
  );
}
