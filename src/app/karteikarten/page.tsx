import Link from "next/link";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { SubjectChip } from "@/components/SubjectChip";

export default async function FlashcardSetsPage() {
  const user = await getCurrentUser();
  const sets = await db.flashcardSet.findMany({
    include: {
      subject: true,
      cards: { include: { progress: user ? { where: { userId: user.id } } : false } },
    },
    orderBy: { createdAt: "desc" },
  });

  const now = new Date();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">📇 Karteikarten</h1>
          <p className="text-gray-500 mt-1">Lerne mit Spaced Repetition – Karten tauchen genau rechtzeitig wieder auf.</p>
        </div>
        <Link
          href="/karteikarten/neu"
          className="hidden sm:inline-block rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-4 py-2.5"
        >
          + Set erstellen
        </Link>
      </div>

      <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sets.map((s) => {
          const due = user
            ? s.cards.filter((c: any) => c.progress.length === 0 || c.progress[0].dueAt <= now).length
            : s.cards.length;
          return (
            <Link
              key={s.id}
              href={`/karteikarten/${s.id}`}
              className="rounded-2xl border border-gray-100 bg-white p-4 shadow-card hover:shadow-cardHover transition-shadow"
            >
              <div className="flex items-center justify-between">
                <SubjectChip name={s.subject.name} icon={s.subject.icon} color={s.subject.color} />
                {due > 0 && (
                  <span className="rounded-full bg-brand-100 text-brand-700 text-xs font-bold px-2 py-0.5">
                    {due} fällig
                  </span>
                )}
              </div>
              <h3 className="mt-3 font-bold text-gray-900">{s.title}</h3>
              <p className="mt-1 text-sm text-gray-500 line-clamp-2">{s.description}</p>
              <p className="mt-2 text-xs text-gray-400 font-medium">{s.cards.length} Karten · Klasse {s.grade}</p>
            </Link>
          );
        })}
      </div>

      <Link
        href="/karteikarten/neu"
        className="sm:hidden mt-6 block text-center rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-4 py-2.5"
      >
        + Set erstellen
      </Link>
    </div>
  );
}
