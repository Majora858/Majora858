import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { SubjectChip } from "@/components/SubjectChip";
import { markContentDone, toggleBookmark } from "@/lib/actions/content-actions";

export default async function ContentDetailPage({ params }: { params: { id: string } }) {
  const content = await db.content.findUnique({
    where: { id: params.id },
    include: { subject: true, author: true },
  });
  if (!content) notFound();

  const user = await getCurrentUser();
  let completed = false;
  let bookmarked = false;
  if (user) {
    const [progress, bookmark] = await Promise.all([
      db.contentProgress.findUnique({ where: { userId_contentId: { userId: user.id, contentId: content.id } } }),
      db.bookmark.findUnique({ where: { userId_contentId: { userId: user.id, contentId: content.id } } }),
    ]);
    completed = progress?.completed ?? false;
    bookmarked = !!bookmark;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <Link href={`/faecher/${content.subject.slug}`} className="text-sm text-gray-500 hover:text-gray-700">
        ← {content.subject.name}
      </Link>

      <div className="mt-3 flex items-center justify-between flex-wrap gap-3">
        <SubjectChip name={content.subject.name} icon={content.subject.icon} color={content.subject.color} />
        <div className="flex items-center gap-3 text-xs text-gray-400 font-medium">
          <span>Klasse {content.grade}</span>
          <span>·</span>
          <span>⏱ {content.minutes} Min.</span>
        </div>
      </div>

      <h1 className="mt-3 text-2xl sm:text-3xl font-extrabold text-gray-900">{content.title}</h1>
      <p className="mt-2 text-gray-500">{content.summary}</p>

      {user && (
        <div className="mt-5 flex items-center gap-3">
          <form action={markContentDone.bind(null, content.id)}>
            <button
              type="submit"
              className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
                completed
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-brand-600 text-white hover:bg-brand-700"
              }`}
            >
              {completed ? "✓ Erledigt" : "Als erledigt markieren (+15 XP)"}
            </button>
          </form>
          <form action={toggleBookmark.bind(null, content.id)}>
            <button
              type="submit"
              aria-label="Merken"
              className={`rounded-xl border px-3 py-2.5 text-sm font-semibold ${
                bookmarked ? "border-amber-200 bg-amber-50 text-amber-600" : "border-gray-200 text-gray-500 hover:bg-gray-50"
              }`}
            >
              {bookmarked ? "★ Gemerkt" : "☆ Merken"}
            </button>
          </form>
        </div>
      )}

      <article className="prose-lernio mt-6 rounded-2xl border border-gray-100 bg-white p-5 sm:p-7 shadow-card">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{content.body}</ReactMarkdown>
      </article>

      {!user && (
        <div className="mt-6 rounded-2xl border border-brand-100 bg-brand-50 p-5 text-center">
          <p className="text-brand-800 font-medium">Melde dich an, um deinen Fortschritt zu speichern.</p>
          <Link href="/registrieren" className="mt-2 inline-block text-sm font-bold text-brand-700 hover:underline">
            Jetzt kostenlos registrieren →
          </Link>
        </div>
      )}
    </div>
  );
}
