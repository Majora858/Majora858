import "server-only";
import { db } from "@/lib/db";

export type SearchResult = {
  type: "content" | "flashcards" | "quiz";
  id: string;
  title: string;
  description: string;
  subjectName: string;
  subjectSlug: string;
  subjectIcon: string;
  subjectColor: string;
  grade: number;
  href: string;
};

function matches(haystack: string, needle: string) {
  return haystack.toLowerCase().includes(needle.toLowerCase());
}

export async function searchAll(query: string): Promise<SearchResult[]> {
  const q = query.trim();
  if (!q) return [];

  const [contents, sets, quizzes] = await Promise.all([
    db.content.findMany({ include: { subject: true } }),
    db.flashcardSet.findMany({ include: { subject: true, cards: true } }),
    db.quiz.findMany({ include: { subject: true, questions: true } }),
  ]);

  const results: SearchResult[] = [];

  for (const c of contents) {
    if (matches(c.title, q) || matches(c.summary, q) || matches(c.body, q)) {
      results.push({
        type: "content",
        id: c.id,
        title: c.title,
        description: c.summary,
        subjectName: c.subject.name,
        subjectSlug: c.subject.slug,
        subjectIcon: c.subject.icon,
        subjectColor: c.subject.color,
        grade: c.grade,
        href: `/inhalte/${c.id}`,
      });
    }
  }

  for (const s of sets) {
    if (matches(s.title, q) || matches(s.description, q)) {
      results.push({
        type: "flashcards",
        id: s.id,
        title: s.title,
        description: `${s.cards.length} Karten · ${s.description}`,
        subjectName: s.subject.name,
        subjectSlug: s.subject.slug,
        subjectIcon: s.subject.icon,
        subjectColor: s.subject.color,
        grade: s.grade,
        href: `/karteikarten/${s.id}`,
      });
    }
  }

  for (const qz of quizzes) {
    if (matches(qz.title, q) || matches(qz.description, q)) {
      results.push({
        type: "quiz",
        id: qz.id,
        title: qz.title,
        description: `${qz.questions.length} Fragen · ${qz.description}`,
        subjectName: qz.subject.name,
        subjectSlug: qz.subject.slug,
        subjectIcon: qz.subject.icon,
        subjectColor: qz.subject.color,
        grade: qz.grade,
        href: `/quiz/${qz.id}`,
      });
    }
  }

  return results;
}
