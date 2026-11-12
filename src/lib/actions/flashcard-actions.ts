"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { awardXp } from "@/lib/gamification";
import { nextSrsState, type SrsRating } from "@/lib/srs";

export async function reviewCard(cardId: string, rating: SrsRating) {
  const user = await getCurrentUser();
  if (!user) return;

  const existing = await db.cardProgress.findUnique({
    where: { userId_cardId: { userId: user.id, cardId } },
  });

  const { box, interval, dueAt } = nextSrsState(existing?.box ?? 1, rating);

  await db.cardProgress.upsert({
    where: { userId_cardId: { userId: user.id, cardId } },
    update: { box, interval, dueAt, reps: (existing?.reps ?? 0) + 1, lastResult: rating, updatedAt: new Date() },
    create: { userId: user.id, cardId, box, interval, dueAt, reps: 1, lastResult: rating },
  });

  await awardXp(user.id, rating === "again" ? 2 : 5);
  revalidatePath("/");
}

const setSchema = z.object({
  title: z.string().min(3, "Titel muss mindestens 3 Zeichen haben"),
  subjectId: z.string().min(1, "Bitte ein Fach wählen"),
  grade: z.coerce.number().int().min(1).max(13),
  description: z.string().min(5, "Beschreibung muss mindestens 5 Zeichen haben"),
});

export type SetFormState = { error?: string } | undefined;

export async function createFlashcardSetAction(
  _prev: SetFormState,
  formData: FormData
): Promise<SetFormState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const parsed = setSchema.safeParse({
    title: formData.get("title"),
    subjectId: formData.get("subjectId"),
    grade: formData.get("grade"),
    description: formData.get("description"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ungültige Eingabe" };
  }

  const fronts = formData.getAll("front").map((v) => v.toString().trim());
  const backs = formData.getAll("back").map((v) => v.toString().trim());

  const cards = fronts
    .map((front, i) => ({ front, back: backs[i] ?? "" }))
    .filter((c) => c.front.length > 0 && c.back.length > 0);

  if (cards.length < 2) {
    return { error: "Bitte lege mindestens 2 vollständige Karten an." };
  }

  const set = await db.flashcardSet.create({
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      grade: parsed.data.grade,
      subjectId: parsed.data.subjectId,
      authorId: user.id,
      cards: {
        create: cards.map((c, i) => ({ front: c.front, back: c.back, order: i })),
      },
    },
  });

  await awardXp(user.id, 20);

  revalidatePath("/karteikarten");
  redirect(`/karteikarten/${set.id}`);
}
