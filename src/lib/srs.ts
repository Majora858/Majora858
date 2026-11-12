export type SrsRating = "again" | "hard" | "good" | "easy";

// Days a card waits before it's due again, indexed by "box" (Leitner-style).
const BOX_INTERVALS_DAYS = [0, 0, 1, 3, 7, 14, 30, 60];
const MAX_BOX = BOX_INTERVALS_DAYS.length - 1;

export function nextSrsState(currentBox: number, rating: SrsRating) {
  let box = currentBox;

  if (rating === "again") box = 1;
  else if (rating === "hard") box = Math.max(1, box);
  else if (rating === "good") box = box + 1;
  else if (rating === "easy") box = box + 2;

  box = Math.min(Math.max(box, 1), MAX_BOX);
  const interval = BOX_INTERVALS_DAYS[box];

  const dueAt = new Date();
  dueAt.setDate(dueAt.getDate() + interval);
  if (interval === 0) {
    // keep it in today's queue but behind cards already reviewed
    dueAt.setMinutes(dueAt.getMinutes() + 1);
  }

  return { box, interval, dueAt };
}
