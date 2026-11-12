"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { awardXp } from "@/lib/gamification";

export async function toggleBookmark(contentId: string) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const existing = await db.bookmark.findUnique({
    where: { userId_contentId: { userId: user.id, contentId } },
  });

  if (existing) {
    await db.bookmark.delete({ where: { id: existing.id } });
  } else {
    await db.bookmark.create({ data: { userId: user.id, contentId } });
  }

  revalidatePath(`/inhalte/${contentId}`);
}

export async function markContentDone(contentId: string) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const existing = await db.contentProgress.findUnique({
    where: { userId_contentId: { userId: user.id, contentId } },
  });

  const wasCompleted = existing?.completed ?? false;

  await db.contentProgress.upsert({
    where: { userId_contentId: { userId: user.id, contentId } },
    update: { completed: !wasCompleted },
    create: { userId: user.id, contentId, completed: true },
  });

  if (!wasCompleted) {
    await awardXp(user.id, 15);
  }

  revalidatePath(`/inhalte/${contentId}`);
  revalidatePath("/");
}

const contentSchema = z.object({
  title: z.string().min(4, "Titel muss mindestens 4 Zeichen haben"),
  subjectId: z.string().min(1, "Bitte ein Fach wählen"),
  grade: z.coerce.number().int().min(1).max(13),
  minutes: z.coerce.number().int().min(1).max(60),
  summary: z.string().min(10, "Zusammenfassung muss mindestens 10 Zeichen haben"),
  body: z.string().min(30, "Inhalt muss mindestens 30 Zeichen haben"),
});

export type ContentFormState = { error?: string } | undefined;

function slugify(s: string) {
  return (
    s
      .toLowerCase()
      .replace(/ä/g, "ae")
      .replace(/ö/g, "oe")
      .replace(/ü/g, "ue")
      .replace(/ß/g, "ss")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") +
    "-" +
    Math.random().toString(36).slice(2, 7)
  );
}

export async function createContentAction(
  _prev: ContentFormState,
  formData: FormData
): Promise<ContentFormState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const parsed = contentSchema.safeParse({
    title: formData.get("title"),
    subjectId: formData.get("subjectId"),
    grade: formData.get("grade"),
    minutes: formData.get("minutes"),
    summary: formData.get("summary"),
    body: formData.get("body"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ungültige Eingabe" };
  }

  const created = await db.content.create({
    data: {
      title: parsed.data.title,
      slug: slugify(parsed.data.title),
      summary: parsed.data.summary,
      body: parsed.data.body,
      grade: parsed.data.grade,
      minutes: parsed.data.minutes,
      subjectId: parsed.data.subjectId,
      authorId: user.id,
    },
  });

  await awardXp(user.id, 25);

  revalidatePath("/faecher");
  redirect(`/inhalte/${created.id}`);
}
