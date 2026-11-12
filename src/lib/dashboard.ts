import "server-only";
import { db } from "@/lib/db";

export async function getDashboardData(userId: string, userGrade: number) {
  const [allContent, completedProgress, subjects, sets, attempts] = await Promise.all([
    db.content.findMany({ include: { subject: true }, orderBy: { createdAt: "asc" } }),
    db.contentProgress.findMany({ where: { userId, completed: true } }),
    db.subject.findMany({ orderBy: { order: "asc" } }),
    db.flashcardSet.findMany({ include: { cards: { include: { progress: { where: { userId } } } }, subject: true } }),
    db.quizAttempt.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 3,
      include: { quiz: { include: { subject: true, questions: true } } },
    }),
  ]);

  const completedIds = new Set(completedProgress.map((p) => p.contentId));

  const recommended = allContent
    .filter((c) => !completedIds.has(c.id))
    .sort((a, b) => Math.abs(a.grade - userGrade) - Math.abs(b.grade - userGrade))
    .slice(0, 4);

  const now = new Date();
  let dueCards = 0;
  const setsDue: { id: string; title: string; subjectIcon: string; due: number }[] = [];
  for (const s of sets) {
    const due = s.cards.filter((c) => c.progress.length === 0 || c.progress[0].dueAt <= now).length;
    dueCards += due;
    if (due > 0) setsDue.push({ id: s.id, title: s.title, subjectIcon: s.subject.icon, due });
  }
  setsDue.sort((a, b) => b.due - a.due);

  const bySubject = subjects.map((subject) => {
    const subjectContent = allContent.filter((c) => c.subjectId === subject.id);
    const done = subjectContent.filter((c) => completedIds.has(c.id)).length;
    return {
      subject,
      total: subjectContent.length,
      done,
      pct: subjectContent.length > 0 ? Math.round((done / subjectContent.length) * 100) : 0,
    };
  });

  return {
    completedCount: completedProgress.length,
    totalContent: allContent.length,
    recommended,
    dueCards,
    setsDue: setsDue.slice(0, 3),
    bySubject,
    recentAttempts: attempts,
  };
}
