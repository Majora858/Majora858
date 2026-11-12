"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { submitQuizAttempt } from "@/lib/actions/quiz-actions";

type Choice = { id: string; text: string; correct: boolean };
type Question = { id: string; text: string; explanation: string | null; choices: Choice[] };

export function QuizRunner({
  quizId,
  quizTitle,
  questions,
  isGuest,
}: {
  quizId: string;
  quizTitle: string;
  questions: Question[];
  isGuest: boolean;
}) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const finished = index >= questions.length;

  useEffect(() => {
    if (finished && !submitted) {
      setSubmitted(true);
      if (!isGuest) submitQuizAttempt(quizId, score, questions.length);
    }
  }, [finished, submitted, isGuest, quizId, score, questions.length]);

  if (finished) {
    const pct = Math.round((score / questions.length) * 100);

    return (
      <div className="text-center py-12">
        <p className="text-5xl">{pct >= 80 ? "🏆" : pct >= 50 ? "👍" : "📚"}</p>
        <p className="mt-3 text-2xl font-extrabold text-gray-900">
          {score} / {questions.length} richtig
        </p>
        <p className="text-gray-500 mt-1">
          {pct >= 80
            ? "Stark! Das sitzt."
            : pct >= 50
            ? "Guter Start – schau dir die Erklärungen noch einmal an."
            : "Kein Problem – wiederhole den Lerninhalt und versuch's erneut."}
        </p>
        {isGuest && (
          <p className="mt-3 text-xs text-amber-600 bg-amber-50 inline-block rounded-lg px-3 py-1.5">
            Melde dich an, damit dein Ergebnis &amp; XP gespeichert werden.
          </p>
        )}
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            onClick={() => {
              setIndex(0);
              setScore(0);
              setSelected(null);
              setSubmitted(false);
            }}
            className="rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-4 py-2.5"
          >
            Nochmal versuchen
          </button>
          <Link href="/quiz" className="rounded-xl border border-gray-200 text-gray-700 text-sm font-semibold px-4 py-2.5">
            Zu allen Quizzen
          </Link>
        </div>
      </div>
    );
  }

  const q = questions[index];
  const revealed = selected !== null;
  const selectedChoice = q.choices.find((c) => c.id === selected);

  function handleSelect(choice: Choice) {
    if (revealed) return;
    setSelected(choice.id);
    if (choice.correct) setScore((s) => s + 1);
  }

  function handleNext() {
    setSelected(null);
    setIndex((i) => i + 1);
  }

  return (
    <div>
      <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
        <span>
          Frage {index + 1} / {questions.length}
        </span>
        <div className="h-1.5 w-32 rounded-full bg-gray-100 overflow-hidden">
          <div className="h-full bg-brand-500" style={{ width: `${(index / questions.length) * 100}%` }} />
        </div>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white shadow-card p-6">
        <p className="font-bold text-gray-900 text-lg leading-snug">{q.text}</p>

        <div className="mt-4 space-y-2">
          {q.choices.map((c) => {
            let style = "border-gray-200 hover:bg-gray-50";
            if (revealed) {
              if (c.correct) style = "border-emerald-300 bg-emerald-50 text-emerald-800";
              else if (c.id === selected) style = "border-rose-300 bg-rose-50 text-rose-800";
              else style = "border-gray-100 text-gray-400";
            }
            return (
              <button
                key={c.id}
                onClick={() => handleSelect(c)}
                disabled={revealed}
                className={`w-full text-left rounded-xl border px-4 py-3 text-sm font-medium transition-colors ${style}`}
              >
                {c.text}
                {revealed && c.correct && " ✓"}
                {revealed && c.id === selected && !c.correct && " ✗"}
              </button>
            );
          })}
        </div>

        {revealed && (
          <div
            className={`mt-4 rounded-xl p-4 text-sm ${
              selectedChoice?.correct ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-800"
            }`}
          >
            <p className="font-semibold">{selectedChoice?.correct ? "Richtig! 🎉" : "Leider falsch."}</p>
            {q.explanation && <p className="mt-1 text-gray-700">{q.explanation}</p>}
          </div>
        )}
      </div>

      {revealed && (
        <button
          onClick={handleNext}
          className="mt-4 w-full rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold py-2.5 text-sm"
        >
          {index + 1 === questions.length ? "Ergebnis anzeigen" : "Nächste Frage"}
        </button>
      )}
    </div>
  );
}
