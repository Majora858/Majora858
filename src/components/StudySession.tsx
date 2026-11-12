"use client";

import { useState } from "react";
import Link from "next/link";
import { reviewCard } from "@/lib/actions/flashcard-actions";
import type { SrsRating } from "@/lib/srs";

type Card = { id: string; front: string; back: string };

export function StudySession({
  setId,
  setTitle,
  cards: initialCards,
  isGuest,
}: {
  setId: string;
  setTitle: string;
  cards: Card[];
  isGuest: boolean;
}) {
  // Snapshot the due cards once: reviewing a card triggers a background
  // router refresh (new due-card list from the server), but the active
  // session must keep its original, stable queue.
  const [cards] = useState(initialCards);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [reviewed, setReviewed] = useState(0);
  const [pending, setPending] = useState(false);

  if (cards.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-4xl">🎉</p>
        <p className="mt-3 font-bold text-gray-900">Alles erledigt!</p>
        <p className="text-gray-500 mt-1 text-sm">Für dieses Set sind aktuell keine Karten fällig.</p>
        <Link href="/karteikarten" className="mt-5 inline-block text-sm font-semibold text-brand-600 hover:underline">
          ← Zurück zu allen Sets
        </Link>
      </div>
    );
  }

  if (index >= cards.length) {
    return (
      <div className="text-center py-16">
        <p className="text-4xl">✅</p>
        <p className="mt-3 font-bold text-gray-900 text-lg">Sitzung abgeschlossen!</p>
        <p className="text-gray-500 mt-1 text-sm">
          Du hast {reviewed} {reviewed === 1 ? "Karte" : "Karten"} aus „{setTitle}" wiederholt.
        </p>
        {isGuest && (
          <p className="mt-2 text-xs text-amber-600 bg-amber-50 inline-block rounded-lg px-3 py-1.5">
            Melde dich an, damit dein Fortschritt gespeichert wird.
          </p>
        )}
        <div className="mt-5 flex items-center justify-center gap-3">
          <button
            onClick={() => {
              setIndex(0);
              setFlipped(false);
              setReviewed(0);
            }}
            className="rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-4 py-2.5"
          >
            Nochmal üben
          </button>
          <Link
            href="/karteikarten"
            className="rounded-xl border border-gray-200 text-gray-700 text-sm font-semibold px-4 py-2.5"
          >
            Zu allen Sets
          </Link>
        </div>
      </div>
    );
  }

  const card = cards[index];

  async function handleRate(rating: SrsRating) {
    setPending(true);
    if (!isGuest) {
      await reviewCard(card.id, rating);
    }
    setPending(false);
    setReviewed((r) => r + 1);
    setFlipped(false);
    setIndex((i) => i + 1);
  }

  return (
    <div>
      <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
        <span>
          Karte {index + 1} / {cards.length}
        </span>
        <div className="h-1.5 w-32 rounded-full bg-gray-100 overflow-hidden">
          <div className="h-full bg-brand-500" style={{ width: `${(index / cards.length) * 100}%` }} />
        </div>
      </div>

      <button
        onClick={() => setFlipped((f) => !f)}
        className="w-full min-h-[280px] rounded-3xl border border-gray-100 bg-white shadow-card hover:shadow-cardHover transition-shadow flex items-center justify-center p-8 text-center"
      >
        <div>
          <p className="text-xs font-semibold text-gray-400 mb-3">{flipped ? "ANTWORT" : "FRAGE"}</p>
          <p className="text-xl font-bold text-gray-900 leading-relaxed">{flipped ? card.back : card.front}</p>
          <p className="mt-5 text-xs text-gray-400">Tippen zum {flipped ? "Zurückdrehen" : "Umdrehen"}</p>
        </div>
      </button>

      {flipped ? (
        <div className="mt-5 grid grid-cols-4 gap-2">
          <button
            disabled={pending}
            onClick={() => handleRate("again")}
            className="rounded-xl bg-rose-50 text-rose-700 border border-rose-100 py-3 text-sm font-semibold hover:bg-rose-100 disabled:opacity-50"
          >
            Nochmal
          </button>
          <button
            disabled={pending}
            onClick={() => handleRate("hard")}
            className="rounded-xl bg-amber-50 text-amber-700 border border-amber-100 py-3 text-sm font-semibold hover:bg-amber-100 disabled:opacity-50"
          >
            Schwer
          </button>
          <button
            disabled={pending}
            onClick={() => handleRate("good")}
            className="rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100 py-3 text-sm font-semibold hover:bg-emerald-100 disabled:opacity-50"
          >
            Gut
          </button>
          <button
            disabled={pending}
            onClick={() => handleRate("easy")}
            className="rounded-xl bg-brand-50 text-brand-700 border border-brand-100 py-3 text-sm font-semibold hover:bg-brand-100 disabled:opacity-50"
          >
            Leicht
          </button>
        </div>
      ) : (
        <p className="mt-5 text-center text-xs text-gray-400">Erst umdrehen, dann bewerten.</p>
      )}
    </div>
  );
}
