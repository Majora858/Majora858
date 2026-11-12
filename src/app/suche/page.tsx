import Link from "next/link";
import { searchAll } from "@/lib/search";
import { SubjectChip } from "@/components/SubjectChip";

const TYPE_LABEL: Record<string, string> = {
  content: "Lerninhalt",
  flashcards: "Karteikarten",
  quiz: "Quiz",
};
const TYPE_ICON: Record<string, string> = {
  content: "📄",
  flashcards: "📇",
  quiz: "✅",
};

export default async function SearchPage({ searchParams }: { searchParams: { q?: string } }) {
  const q = searchParams.q ?? "";
  const results = q ? await searchAll(q) : [];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-extrabold text-gray-900">🔍 Suche</h1>
      <p className="text-gray-500 mt-1 mb-5">
        Finde Lerninhalte, Karteikarten-Sets und Quizze – fachübergreifend.
      </p>

      <form action="/suche" method="get">
        <input
          type="text"
          name="q"
          defaultValue={q}
          autoFocus
          placeholder="z. B. Photosynthese, Pythagoras, Passiv …"
          className="w-full rounded-2xl border border-gray-200 px-4 py-3.5 text-sm shadow-card focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
        />
      </form>

      <div className="mt-6 space-y-3">
        {q && results.length === 0 && (
          <p className="text-sm text-gray-500">Keine Ergebnisse für „{q}". Versuch es mit einem anderen Begriff.</p>
        )}

        {results.map((r) => (
          <Link
            key={`${r.type}-${r.id}`}
            href={r.href}
            className="block rounded-2xl border border-gray-100 bg-white p-4 shadow-card hover:shadow-cardHover transition-shadow"
          >
            <div className="flex items-center justify-between flex-wrap gap-2">
              <SubjectChip name={r.subjectName} icon={r.subjectIcon} color={r.subjectColor} />
              <span className="text-xs font-semibold text-gray-400">
                {TYPE_ICON[r.type]} {TYPE_LABEL[r.type]} · Klasse {r.grade}
              </span>
            </div>
            <h3 className="mt-2 font-bold text-gray-900">{r.title}</h3>
            <p className="mt-1 text-sm text-gray-500 line-clamp-2">{r.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
