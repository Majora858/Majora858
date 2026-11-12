import Link from "next/link";
import { db } from "@/lib/db";

export default async function SubjectsPage() {
  const subjects = await db.subject.findMany({
    orderBy: { order: "asc" },
    include: {
      _count: { select: { contents: true, flashcardSets: true, quizzes: true } },
    },
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-extrabold text-gray-900">📚 Fächer</h1>
      <p className="text-gray-500 mt-1">Wähle ein Fach und starte mit Lerninhalten, Karteikarten oder einem Quiz.</p>

      <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {subjects.map((s) => (
          <Link
            key={s.id}
            href={`/faecher/${s.slug}`}
            className="rounded-2xl border border-gray-100 bg-white p-5 shadow-card hover:shadow-cardHover transition-shadow"
          >
            <div
              className="h-12 w-12 rounded-xl flex items-center justify-center text-2xl"
              style={{ backgroundColor: `${s.color}1A` }}
            >
              {s.icon}
            </div>
            <h2 className="mt-3 font-bold text-gray-900">{s.name}</h2>
            <p className="mt-1 text-sm text-gray-500">
              {s._count.contents} Lerninhalte · {s._count.flashcardSets} Karteikarten-Sets · {s._count.quizzes} Quizze
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
