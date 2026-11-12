"use client";

import { useFormState } from "react-dom";
import Link from "next/link";
import type { AuthFormState } from "@/lib/actions/auth-actions";

export function AuthForm({
  mode,
  action,
}: {
  mode: "login" | "register";
  action: (state: AuthFormState, formData: FormData) => Promise<AuthFormState>;
}) {
  const [state, formAction] = useFormState(action, undefined);

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="text-center mb-8">
        <span className="text-4xl">🎓</span>
        <h1 className="mt-3 text-2xl font-extrabold text-gray-900">
          {mode === "login" ? "Willkommen zurück!" : "Starte kostenlos mit Lernio"}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          {mode === "login"
            ? "Melde dich an und mach da weiter, wo du aufgehört hast."
            : "Lerninhalte, Karteikarten, Quizze & KI-Hilfe – alles an einem Ort."}
        </p>
      </div>

      <form action={formAction} className="space-y-4 bg-white rounded-2xl shadow-card border border-gray-100 p-6">
        {mode === "register" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              name="name"
              required
              minLength={2}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
              placeholder="Dein Name"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">E-Mail</label>
          <input
            name="email"
            type="email"
            required
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
            placeholder="du@beispiel.de"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Passwort</label>
          <input
            name="password"
            type="password"
            required
            minLength={6}
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
            placeholder="Mindestens 6 Zeichen"
          />
        </div>

        {mode === "register" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Klassenstufe</label>
            <select
              name="grade"
              defaultValue="9"
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
            >
              {Array.from({ length: 13 }, (_, i) => i + 1).map((g) => (
                <option key={g} value={g}>
                  Klasse {g}
                </option>
              ))}
            </select>
          </div>
        )}

        {state?.error && (
          <p className="text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-lg px-3 py-2">{state.error}</p>
        )}

        <button
          type="submit"
          className="w-full rounded-xl bg-brand-600 hover:bg-brand-700 transition-colors text-white font-semibold py-2.5 text-sm"
        >
          {mode === "login" ? "Anmelden" : "Konto erstellen"}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-5">
        {mode === "login" ? (
          <>
            Noch kein Konto?{" "}
            <Link href="/registrieren" className="text-brand-600 font-semibold hover:underline">
              Jetzt registrieren
            </Link>
          </>
        ) : (
          <>
            Schon dabei?{" "}
            <Link href="/login" className="text-brand-600 font-semibold hover:underline">
              Anmelden
            </Link>
          </>
        )}
      </p>

      {mode === "login" && (
        <p className="text-center text-xs text-gray-400 mt-3">
          Demo-Zugang: <code>demo@lernio.de</code> / <code>lernen123</code>
        </p>
      )}
    </div>
  );
}
