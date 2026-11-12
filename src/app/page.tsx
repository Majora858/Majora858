import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getDashboardData } from "@/lib/dashboard";
import { db } from "@/lib/db";
import { XpBar } from "@/components/XpBar";
import { ContentCard } from "@/components/ContentCard";
import { SubjectChip } from "@/components/SubjectChip";

export default async function HomePage() {
  const user = await getCurrentUser();

  if (!user) {
    return <LandingPage />;
  }

  const data = await getDashboardData(user.id, user.grade);
  const firstName = user.name.split(" ")[0];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Hey {firstName} 👋</h1>
          <p className="text-gray-500 mt-1">Schön, dass du da bist. Lass uns weiterlernen!</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 rounded-xl bg-orange-50 px-3 py-2 text-orange-600 font-bold text-sm">
            🔥 {user.streak} {user.streak === 1 ? "Tag" : "Tage"}
          </div>
          <XpBar xp={user.xp} />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Link
          href="/karteikarten"
          className="rounded-2xl p-5 bg-gradient-to-br from-brand-600 to-brand-700 text-white shadow-card flex items-center justify-between"
        >
          <div>
            <p className="text-sm text-brand-100">Heute fällig</p>
            <p className="text-2xl font-extrabold mt-0.5">{data.dueCards} Karteikarten</p>
            <p className="text-sm text-brand-100 mt-1">Jetzt wiederholen &amp; nicht vergessen</p>
          </div>
          <span className="text-4xl">📇</span>
        </Link>
        <Link
          href="/quiz"
          className="rounded-2xl p-5 bg-white border border-gray-100 shadow-card flex items-center justify-between"
        >
          <div>
            <p className="text-sm text-gray-500">Dein Fortschritt</p>
            <p className="text-2xl font-extrabold mt-0.5 text-gray-900">
              {data.completedCount}/{data.totalContent} Lerninhalte
            </p>
            <p className="text-sm text-gray-500 mt-1">Teste dein Wissen mit einem Quiz</p>
          </div>
          <span className="text-4xl">✅</span>
        </Link>
      </div>

      {data.setsDue.length > 0 && (
        <section>
          <h2 className="font-bold text-gray-900 mb-3">📇 Jetzt wiederholen</h2>
          <div className="flex flex-wrap gap-3">
            {data.setsDue.map((s) => (
              <Link
                key={s.id}
                href={`/karteikarten/${s.id}`}
                className="flex items-center gap-2 rounded-xl border border-gray-100 bg-white px-4 py-2.5 shadow-card hover:shadow-cardHover transition-shadow text-sm"
              >
                <span>{s.subjectIcon}</span>
                <span className="font-semibold text-gray-800">{s.title}</span>
                <span className="rounded-full bg-brand-100 text-brand-700 text-xs font-bold px-2 py-0.5">
                  {s.due}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-gray-900">📚 Empfohlen für dich</h2>
          <Link href="/faecher" className="text-sm font-semibold text-brand-600 hover:underline">
            Alle Fächer
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {data.recommended.map((c) => (
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
      </section>

      <section>
        <h2 className="font-bold text-gray-900 mb-3">📊 Fortschritt nach Fach</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {data.bySubject
            .filter((b) => b.total > 0)
            .map((b) => (
              <div key={b.subject.id} className="rounded-xl border border-gray-100 bg-white p-4 shadow-card">
                <div className="flex items-center justify-between mb-2">
                  <SubjectChip name={b.subject.name} icon={b.subject.icon} color={b.subject.color} />
                  <span className="text-xs font-semibold text-gray-500">
                    {b.done}/{b.total}
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${b.pct}%`, backgroundColor: b.subject.color }}
                  />
                </div>
              </div>
            ))}
        </div>
      </section>
    </div>
  );
}

async function LandingPage() {
  const subjects = await db.subject.findMany({ orderBy: { order: "asc" } });

  const features = [
    {
      icon: "📚",
      title: "Lerninhalte wie Zusammenfassungen",
      text: "Klare, kompakte Erklärungen zu jedem Thema – geschrieben, damit du es wirklich verstehst.",
    },
    {
      icon: "📇",
      title: "Karteikarten mit Spaced Repetition",
      text: "Unser Lernalgorithmus zeigt dir Karten genau dann, wenn du sie sonst vergessen würdest.",
    },
    {
      icon: "✅",
      title: "Quizze mit sofortigem Feedback",
      text: "Teste dein Wissen und bekomme zu jeder Antwort eine verständliche Erklärung.",
    },
    {
      icon: "✨",
      title: "KI-Lernassistent",
      text: "Stell eine Frage – der Assistent durchsucht die ganze Lernbibliothek für dich.",
    },
    {
      icon: "🔥",
      title: "Streaks & XP",
      text: "Bleib motiviert mit täglichen Streaks, XP-Punkten und Levels.",
    },
    {
      icon: "🔍",
      title: "Alles an einem Ort",
      text: "Suche fachübergreifend nach Inhalten, Karten und Quizzen in Sekunden.",
    },
  ];

  return (
    <div>
      <section className="px-4 sm:px-6 pt-14 pb-16 sm:pt-20 sm:pb-24 text-center bg-gradient-to-b from-brand-50 to-transparent">
        <span className="inline-flex items-center gap-1 rounded-full bg-white border border-gray-100 shadow-card px-3 py-1 text-xs font-semibold text-brand-700">
          🎓 Lernen, das wirklich sitzt
        </span>
        <h1 className="mt-5 text-3xl sm:text-5xl font-extrabold text-gray-900 max-w-3xl mx-auto leading-tight">
          Alles, was du zum <span className="text-brand-600">guten Lernen</span> brauchst –
          an einem Ort.
        </h1>
        <p className="mt-4 text-gray-600 max-w-xl mx-auto sm:text-lg">
          Lerninhalte, Karteikarten, Quizze, Fortschritt &amp; ein KI-Lernassistent.
          Kostenlos, werbefrei und für jedes Fach.
        </p>
        <div className="mt-7 flex items-center justify-center gap-3">
          <Link
            href="/registrieren"
            className="rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold px-6 py-3 shadow-card"
          >
            Kostenlos starten
          </Link>
          <Link
            href="/faecher"
            className="rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-gray-800 font-semibold px-6 py-3"
          >
            Fächer entdecken
          </Link>
        </div>
      </section>

      <section className="px-4 sm:px-6 max-w-5xl mx-auto -mt-4 pb-14">
        <div className="flex flex-wrap justify-center gap-2.5">
          {subjects.map((s) => (
            <Link key={s.id} href={`/faecher/${s.slug}`}>
              <SubjectChip name={s.name} icon={s.icon} color={s.color} size="md" />
            </Link>
          ))}
        </div>
      </section>

      <section className="px-4 sm:px-6 max-w-5xl mx-auto pb-20">
        <h2 className="text-2xl font-extrabold text-center text-gray-900 mb-10">
          Eine App. Jede Lernmethode, die funktioniert.
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => (
            <div key={f.title} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-card">
              <span className="text-3xl">{f.icon}</span>
              <h3 className="mt-3 font-bold text-gray-900">{f.title}</h3>
              <p className="mt-1.5 text-sm text-gray-500 leading-relaxed">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-4 sm:px-6 pb-20">
        <div className="max-w-3xl mx-auto rounded-3xl bg-gradient-to-br from-brand-600 to-brand-700 text-white text-center p-10 sm:p-14 shadow-card">
          <h2 className="text-2xl sm:text-3xl font-extrabold">Bereit, besser zu lernen?</h2>
          <p className="mt-2 text-brand-100">Erstelle dein kostenloses Konto in unter einer Minute.</p>
          <Link
            href="/registrieren"
            className="inline-block mt-6 rounded-xl bg-white text-brand-700 font-bold px-7 py-3 hover:bg-brand-50"
          >
            Jetzt kostenlos registrieren
          </Link>
        </div>
      </section>
    </div>
  );
}
