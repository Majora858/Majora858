import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { levelFromXp } from "@/lib/gamification";
import { XpBar } from "@/components/XpBar";
import { logoutAction } from "@/lib/actions/auth-actions";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [completedCount, cardReps, quizAttempts, contentAuthored, setsAuthored, quizzesAuthored, bookmarks] =
    await Promise.all([
      db.contentProgress.count({ where: { userId: user.id, completed: true } }),
      db.cardProgress.aggregate({ where: { userId: user.id }, _sum: { reps: true } }),
      db.quizAttempt.findMany({ where: { userId: user.id } }),
      db.content.count({ where: { authorId: user.id } }),
      db.flashcardSet.count({ where: { authorId: user.id } }),
      db.quiz.count({ where: { authorId: user.id } }),
      db.bookmark.findMany({ where: { userId: user.id }, include: { content: { include: { subject: true } } } }),
    ]);

  const { level } = levelFromXp(user.xp);
  const totalReps = cardReps._sum.reps ?? 0;
  const avgScore =
    quizAttempts.length > 0
      ? Math.round((quizAttempts.reduce((a, b) => a + b.score / b.total, 0) / quizAttempts.length) * 100)
      : null;
  const authoredTotal = contentAuthored + setsAuthored + quizzesAuthored;

  const badges = [
    { emoji: "🔥", label: "Serientäter", earned: user.streak >= 3 },
    { emoji: "📚", label: "Bücherwurm", earned: completedCount >= 5 },
    { emoji: "✅", label: "Quiz-Meister", earned: quizAttempts.length >= 3 },
    { emoji: "📇", label: "Karteikarten-Profi", earned: totalReps >= 20 },
    { emoji: "✍️", label: "Autor", earned: authoredTotal >= 1 },
    { emoji: "⭐", label: "Level 5 erreicht", earned: level >= 5 },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-600 text-white font-bold text-2xl">
          {user.name[0]?.toUpperCase()}
        </div>
        <div>
          <h1 className="text-xl font-extrabold text-gray-900">{user.name}</h1>
          <p className="text-sm text-gray-500">{user.email} · Klasse {user.grade}</p>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-5 shadow-card">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <XpBar xp={user.xp} />
          <div className="flex items-center gap-1.5 rounded-xl bg-orange-50 px-3 py-2 text-orange-600 font-bold text-sm">
            🔥 {user.streak} {user.streak === 1 ? "Tag" : "Tage"} Streak
          </div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Lerninhalte" value={completedCount} />
        <StatCard label="Karten-Reviews" value={totalReps} />
        <StatCard label="Quizze gemacht" value={quizAttempts.length} />
        <StatCard label="⌀ Quiz-Score" value={avgScore !== null ? `${avgScore}%` : "–"} />
      </div>

      <div className="mt-6">
        <h2 className="font-bold text-gray-900 mb-3">🏅 Abzeichen</h2>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {badges.map((b) => (
            <div
              key={b.label}
              className={`flex flex-col items-center gap-1 rounded-xl p-3 text-center border ${
                b.earned ? "bg-amber-50 border-amber-100" : "bg-gray-50 border-gray-100 opacity-40"
              }`}
            >
              <span className="text-2xl">{b.emoji}</span>
              <span className="text-[11px] font-semibold text-gray-700 leading-tight">{b.label}</span>
            </div>
          ))}
        </div>
      </div>

      {bookmarks.length > 0 && (
        <div className="mt-6">
          <h2 className="font-bold text-gray-900 mb-3">⭐ Gemerkte Lerninhalte</h2>
          <div className="space-y-2">
            {bookmarks.map((b) => (
              <a
                key={b.id}
                href={`/inhalte/${b.content.id}`}
                className="block rounded-xl border border-gray-100 bg-white px-4 py-3 text-sm font-medium text-gray-800 shadow-card hover:shadow-cardHover"
              >
                {b.content.subject.icon} {b.content.title}
              </a>
            ))}
          </div>
        </div>
      )}

      <form action={logoutAction} className="mt-8">
        <button
          type="submit"
          className="w-full rounded-xl border border-gray-200 text-gray-600 font-semibold py-2.5 text-sm hover:bg-gray-50"
        >
          Abmelden
        </button>
      </form>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-3.5 text-center shadow-card">
      <p className="text-xl font-extrabold text-gray-900">{value}</p>
      <p className="text-[11px] text-gray-500 mt-0.5">{label}</p>
    </div>
  );
}
