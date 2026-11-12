import "server-only";
import { db } from "@/lib/db";

/**
 * Generates a reply for the KI-Lernassistent.
 *
 * This retrieves relevant material from the app's own library (Lerninhalte,
 * Karteikarten, Quizze) and turns it into a helpful, structured answer.
 * It's a clean seam for swapping in a real LLM call later: if ANTHROPIC_API_KEY
 * is set, route through that instead and keep the same function signature.
 */
export async function generateAssistantReply(question: string): Promise<string> {
  const q = question.trim();
  if (!q) return "Stell mir gerne eine Frage zu einem Schulthema – ich helfe dir weiter!";

  const words = q
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2);

  const [contents, sets, quizzes] = await Promise.all([
    db.content.findMany({ include: { subject: true } }),
    db.flashcardSet.findMany({ include: { subject: true, cards: true } }),
    db.quiz.findMany({ include: { subject: true, questions: true } }),
  ]);

  function score(text: string) {
    const t = text.toLowerCase();
    return words.reduce((acc, w) => acc + (t.includes(w) ? 1 : 0), 0);
  }

  const rankedContent = contents
    .map((c) => ({ c, s: score(`${c.title} ${c.summary} ${c.body}`) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, 2);

  const rankedSets = sets
    .map((s) => ({ s, score: score(`${s.title} ${s.description}`) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 2);

  const rankedQuizzes = quizzes
    .map((qz) => ({ qz, score: score(`${qz.title} ${qz.description}`) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 1);

  const parts: string[] = [];

  if (rankedContent.length > 0) {
    const top = rankedContent[0].c;
    const plain = top.body
      .replace(/[#*_`>-]/g, "")
      .split("\n")
      .filter(Boolean)
      .slice(0, 3)
      .join(" ");
    parts.push(
      `Zu "${q}" habe ich im Fach **${top.subject.name}** den Lerninhalt **"${top.title}"** gefunden:\n\n${plain.slice(
        0,
        420
      )}${plain.length > 420 ? "…" : ""}\n\n👉 Lies den ganzen Inhalt unter „${top.title}“ in ${top.subject.name}.`
    );
  } else {
    parts.push(
      `Dazu habe ich noch keinen passenden Lerninhalt in der Bibliothek gefunden. Erzähl mir gerne etwas genauer, worum es geht (z. B. Fach + Thema), oder lege selbst einen Lerninhalt dazu an – dann hilft er auch anderen!`
    );
  }

  if (rankedSets.length > 0) {
    const names = rankedSets.map((r) => `„${r.s.title}" (${r.s.cards.length} Karten)`).join(", ");
    parts.push(`📇 Zum Üben passen diese Karteikarten-Sets: ${names}.`);
  }

  if (rankedQuizzes.length > 0) {
    const qz = rankedQuizzes[0].qz;
    parts.push(`📝 Teste dein Wissen direkt mit dem Quiz „${qz.title}" (${qz.questions.length} Fragen).`);
  }

  parts.push(
    "Tipp: Erkläre das Thema danach einmal in eigenen Worten (Feynman-Methode) – das zeigt dir sofort, was du schon sicher kannst."
  );

  return parts.join("\n\n");
}
