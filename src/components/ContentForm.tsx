"use client";

import { useFormState } from "react-dom";
import { createContentAction, type ContentFormState } from "@/lib/actions/content-actions";

export function ContentForm({
  subjects,
  defaultSubjectId,
  defaultGrade,
}: {
  subjects: { id: string; name: string; icon: string }[];
  defaultSubjectId?: string;
  defaultGrade: number;
}) {
  const [state, formAction] = useFormState<ContentFormState, FormData>(createContentAction, undefined);

  return (
    <form action={formAction} className="space-y-4 bg-white rounded-2xl shadow-card border border-gray-100 p-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Titel</label>
        <input
          name="title"
          required
          minLength={4}
          placeholder="z. B. Die Mitose einfach erklärt"
          className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Fach</label>
          <select
            name="subjectId"
            defaultValue={defaultSubjectId}
            required
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
        <label className="block text-sm font-medium text-gray-700 mb-1">Lesedauer (Minuten)</label>
        <input
          name="minutes"
          type="number"
          min={1}
          max={60}
          defaultValue={6}
          className="w-32 rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Kurze Zusammenfassung</label>
        <textarea
          name="summary"
          required
          minLength={10}
          rows={2}
          placeholder="Ein Satz, der zeigt, worum es geht."
          className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Inhalt <span className="text-gray-400 font-normal">(Markdown wird unterstützt: ## Überschrift, **fett**, Listen …)</span>
        </label>
        <textarea
          name="body"
          required
          minLength={30}
          rows={12}
          placeholder={"## Einleitung\n\nErkläre hier das Thema Schritt für Schritt …"}
          className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-mono focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
        />
      </div>

      {state?.error && (
        <p className="text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-lg px-3 py-2">{state.error}</p>
      )}

      <button
        type="submit"
        className="w-full rounded-xl bg-brand-600 hover:bg-brand-700 transition-colors text-white font-semibold py-2.5 text-sm"
      >
        Lerninhalt veröffentlichen (+25 XP)
      </button>
    </form>
  );
}
