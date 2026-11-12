import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { SubjectChip } from "@/components/SubjectChip";
import { StudySession } from "@/components/StudySession";

export default async function FlashcardSetPage({ params }: { params: { setId: string } }) {
  const set = await db.flashcardSet.findUnique({
    where: { id: params.setId },
    include: { subject: true, cards: { orderBy: { order: "asc" } } },
  });
  if (!set) notFound();

  const user = await getCurrentUser();

  let cardsToStudy = set.cards;
  if (user) {
    const progress = await db.cardProgress.findMany({
      where: { userId: user.id, cardId: { in: set.cards.map((c) => c.id) } },
    });
    const progressByCard = new Map(progress.map((p) => [p.cardId, p]));
    const now = new Date();
    cardsToStudy = set.cards.filter((c) => {
      const p = progressByCard.get(c.id);
      return !p || p.dueAt <= now;
    });
  }

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-8">
      <Link href={`/faecher/${set.subject.slug}`} className="text-sm text-gray-500 hover:text-gray-700">
        ← {set.subject.name}
      </Link>
      <div className="mt-3 flex items-center justify-between flex-wrap gap-2">
        <SubjectChip name={set.subject.name} icon={set.subject.icon} color={set.subject.color} />
        <span className="text-xs text-gray-400 font-medium">Klasse {set.grade}</span>
      </div>
      <h1 className="mt-3 text-2xl font-extrabold text-gray-900">{set.title}</h1>
      <p className="mt-1 text-gray-500 text-sm">{set.description}</p>

      <div className="mt-6">
        <StudySession setId={set.id} setTitle={set.title} cards={cardsToStudy} isGuest={!user} />
      </div>
    </div>
  );
}
