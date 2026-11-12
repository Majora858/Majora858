import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ContentCard } from "@/components/ContentCard";

export default async function SubjectPage({ params }: { params: { slug: string } }) {
  const subject = await db.subject.findUnique({ where: { slug: params.slug } });
  if (!subject) notFound();

  const [contents, sets, quizzes] = await Promise.all([
    db.content.findMany({ where: { subjectId: subject.id }, include: { subject: true }, orderBy: { grade: "asc" } }),
    db.flashcardSet.findMany({ where: { subjectId: subject.id }, include: { cards: true }, orderBy: { grade: "asc" } }),
    db.quiz.findMany({ where: { subjectId: subject.id }, include: { questions: true }, orderBy: { grade: "asc" } }),
  ]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-10">
      <div className="flex items-center gap-4">
        <div
          className="h-14 w-14 rounded-2xl flex items-center justify-center text-3xl shrink-0"
          style={{ backgroundColor: `${subject.color}1A` }}
        >
          {subject.icon}
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">{subject.name}</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {contents.length} Lerninhalte · {sets.length} Karteikarten-Sets · {quizzes.length} Quizze
          </p>
        </div>
        <Link
          href={`/inhalte/neu?subjectId=${subject.id}`}
          className="ml-auto hidden sm:inline-block rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-4 py-2.5"
        >
          + Lerninhalt erstellen
        </Link>
      </div>

      <section>
        <h2 className="font-bold text-gray-900 mb-3">Lerninhalte</h2>
        {contents.length === 0 ? (
          <p className="text-sm text-gray-500">Noch keine Lerninhalte in diesem Fach.</p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {contents.map((c) => (
              <ContentCard
                key={c.id}
                href={`/inhalte/${c.id}`}
                title={c.title}
                summary={c.summary}
                grade={c.grade}
                minutes={c.minutes}
                subjectName={c.subject.name}
                subjectIcon={c.subject.icon}
                subjectColor={c.subject.color}
              />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="font-bold text-gray-900 mb-3">📇 Karteikarten-Sets</h2>
        {sets.length === 0 ? (
          <p className="text-sm text-gray-500">Noch keine Karteikarten-Sets in diesem Fach.</p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {sets.map((s) => (
              <Link
                key={s.id}
                href={`/karteikarten/${s.id}`}
                className="rounded-2xl border border-gray-100 bg-white p-4 shadow-card hover:shadow-cardHover transition-shadow"
              >
                <h3 className="font-bold text-gray-900">{s.title}</h3>
                <p className="mt-1 text-sm text-gray-500">{s.description}</p>
                <p className="mt-2 text-xs text-gray-400 font-medium">{s.cards.length} Karten · Klasse {s.grade}</p>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="font-bold text-gray-900 mb-3">✅ Quizze</h2>
        {quizzes.length === 0 ? (
          <p className="text-sm text-gray-500">Noch keine Quizze in diesem Fach.</p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {quizzes.map((q) => (
              <Link
                key={q.id}
                href={`/quiz/${q.id}`}
                className="rounded-2xl border border-gray-100 bg-white p-4 shadow-card hover:shadow-cardHover transition-shadow"
              >
                <h3 className="font-bold text-gray-900">{q.title}</h3>
                <p className="mt-1 text-sm text-gray-500">{q.description}</p>
                <p className="mt-2 text-xs text-gray-400 font-medium">{q.questions.length} Fragen · Klasse {q.grade}</p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
