import "server-only";
import { db } from "@/lib/db";

export function levelFromXp(xp: number) {
  // Each level needs progressively more XP (100, 250, 450, 700, ...)
  let level = 1;
  let remaining = xp;
  let need = 100;
  while (remaining >= need) {
    remaining -= need;
    level += 1;
    need += 50;
  }
  return { level, xpIntoLevel: remaining, xpForNextLevel: need };
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isYesterday(a: Date, b: Date) {
  const yesterday = new Date(b);
  yesterday.setDate(b.getDate() - 1);
  return isSameDay(a, yesterday);
}

/** Award XP and update the daily streak. Call this on any completed learning action. */
export async function awardXp(userId: string, amount: number) {
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) return;

  const now = new Date();
  let streak = user.streak;

  if (!user.lastStudyAt) {
    streak = 1;
  } else if (isSameDay(user.lastStudyAt, now)) {
    streak = Math.max(streak, 1);
  } else if (isYesterday(user.lastStudyAt, now)) {
    streak = streak + 1;
  } else {
    streak = 1;
  }

  await db.user.update({
    where: { id: userId },
    data: {
      xp: user.xp + amount,
      streak,
      lastStudyAt: now,
    },
  });
}
