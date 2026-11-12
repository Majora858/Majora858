"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { awardXp } from "@/lib/gamification";

export async function submitQuizAttempt(quizId: string, score: number, total: number) {
  const user = await getCurrentUser();
  if (!user) return;

  await db.quizAttempt.create({ data: { userId: user.id, quizId, score, total } });

  const pct = total > 0 ? score / total : 0;
  const xp = Math.round(10 + pct * 20);
  await awardXp(user.id, xp);

  revalidatePath("/");
}

const quizMetaSchema = z.object({
  title: z.string().min(3, "Titel muss mindestens 3 Zeichen haben"),
  subjectId: z.string().min(1, "Bitte ein Fach wählen"),
  grade: z.coerce.number().int().min(1).max(13),
  description: z.string().min(5, "Beschreibung muss mindestens 5 Zeichen haben"),
});

export type QuizFormState = { error?: string } | undefined;

export async function createQuizAction(_prev: QuizFormState, formData: FormData): Promise<QuizFormState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const parsedMeta = quizMetaSchema.safeParse({
    title: formData.get("title"),
    subjectId: formData.get("subjectId"),
    grade: formData.get("grade"),
    description: formData.get("description"),
  });

  if (!parsedMeta.success) {
    return { error: parsedMeta.error.issues[0]?.message ?? "Ungültige Eingabe" };
  }

  const questionCount = Number(formData.get("questionCount") ?? 0);
  const questions: {
    text: string;
    explanation: string;
    choices: { text: string; correct: boolean }[];
  }[] = [];

  for (let i = 0; i < questionCount; i++) {
    const text = (formData.get(`qtext_${i}`)?.toString() ?? "").trim();
    if (!text) continue;

    const explanation = (formData.get(`qexplanation_${i}`)?.toString() ?? "").trim();
    const choiceTexts = [0, 1, 2, 3].map((j) => (formData.get(`cchoice_${i}_${j}`)?.toString() ?? "").trim());
    const correctIndex = Number(formData.get(`ccorrect_${i}`) ?? -1);

    if (choiceTexts.some((c) => !c)) {
      return { error: `Frage ${i + 1}: Bitte alle 4 Antwortmöglichkeiten ausfüllen.` };
    }
    if (correctIndex < 0 || correctIndex > 3) {
      return { error: `Frage ${i + 1}: Bitte die richtige Antwort markieren.` };
    }

    questions.push({
      text,
      explanation,
      choices: choiceTexts.map((t, j) => ({ text: t, correct: j === correctIndex })),
    });
  }

  if (questions.length < 2) {
    return { error: "Bitte lege mindestens 2 vollständige Fragen an." };
  }

  const quiz = await db.quiz.create({
    data: {
      title: parsedMeta.data.title,
      description: parsedMeta.data.description,
      grade: parsedMeta.data.grade,
      subjectId: parsedMeta.data.subjectId,
      authorId: user.id,
      questions: {
        create: questions.map((q, i) => ({
          text: q.text,
          explanation: q.explanation || null,
          order: i,
          choices: { create: q.choices.map((c, j) => ({ text: c.text, correct: c.correct, order: j })) },
        })),
      },
    },
  });

  await awardXp(user.id, 25);

  revalidatePath("/quiz");
  redirect(`/quiz/${quiz.id}`);
}
