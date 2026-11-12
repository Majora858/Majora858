"use client";

import { useState } from "react";
import { useFormState } from "react-dom";
import { createFlashcardSetAction, type SetFormState } from "@/lib/actions/flashcard-actions";

export function FlashcardSetForm({
  subjects,
  defaultGrade,
}: {
  subjects: { id: string; name: string; icon: string }[];
  defaultGrade: number;
}) {
  const [state, formAction] = useFormState<SetFormState, FormData>(createFlashcardSetAction, undefined);
  const [rows, setRows] = useState(4);

  return (
    <form action={formAction} className="space-y-4 bg-white rounded-2xl shadow-card border border-gray-100 p-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Titel des Sets</label>
        <input
          name="title"
          required
          minLength={3}
          placeholder="z. B. Vokabeln Unit 3"
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
          placeholder="Kurz: worum geht's in diesem Set?"
          className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">Karten</label>
          <button
            type="button"
            onClick={() => setRows((r) => r + 1)}
            className="text-xs font-semibold text-brand-600 hover:underline"
          >
            + Karte hinzufügen
          </button>
        </div>
        <div className="space-y-2">
          {Array.from({ length: rows }, (_, i) => (
            <div key={i} className="grid grid-cols-2 gap-2">
              <input
                name="front"
                placeholder={`Frage ${i + 1}`}
                className="rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
              />
              <input
                name="back"
                placeholder={`Antwort ${i + 1}`}
                className="rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
              />
            </div>
          ))}
        </div>
        <p className="mt-1.5 text-xs text-gray-400">Mindestens 2 vollständige Karten nötig. Leere Zeilen werden ignoriert.</p>
      </div>

      {state?.error && (
        <p className="text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-lg px-3 py-2">{state.error}</p>
      )}

      <button
        type="submit"
        className="w-full rounded-xl bg-brand-600 hover:bg-brand-700 transition-colors text-white font-semibold py-2.5 text-sm"
      >
        Set erstellen (+20 XP)
      </button>
    </form>
  );
}
