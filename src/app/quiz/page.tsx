import Link from "next/link";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { SubjectChip } from "@/components/SubjectChip";

export default async function QuizListPage() {
  const user = await getCurrentUser();
  const quizzes = await db.quiz.findMany({
    include: {
      subject: true,
      questions: true,
      attempts: user ? { where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 1 } : false,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">✅ Quizze</h1>
          <p className="text-gray-500 mt-1">Teste dein Wissen und bekomme sofort eine Erklärung zu jeder Antwort.</p>
        </div>
        <Link
          href="/quiz/neu"
          className="hidden sm:inline-block rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-4 py-2.5"
        >
          + Quiz erstellen
        </Link>
      </div>

      <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {quizzes.map((q) => {
          const lastAttempt = (q as any).attempts?.[0];
          return (
            <Link
              key={q.id}
              href={`/quiz/${q.id}`}
              className="rounded-2xl border border-gray-100 bg-white p-4 shadow-card hover:shadow-cardHover transition-shadow"
            >
              <div className="flex items-center justify-between">
                <SubjectChip name={q.subject.name} icon={q.subject.icon} color={q.subject.color} />
                {lastAttempt && (
                  <span className="text-xs font-bold text-emerald-600">
                    {lastAttempt.score}/{lastAttempt.total}
                  </span>
                )}
              </div>
              <h3 className="mt-3 font-bold text-gray-900">{q.title}</h3>
              <p className="mt-1 text-sm text-gray-500 line-clamp-2">{q.description}</p>
              <p className="mt-2 text-xs text-gray-400 font-medium">{q.questions.length} Fragen · Klasse {q.grade}</p>
            </Link>
          );
        })}
      </div>

      <Link
        href="/quiz/neu"
        className="sm:hidden mt-6 block text-center rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-4 py-2.5"
      >
        + Quiz erstellen
      </Link>
    </div>
  );
}
