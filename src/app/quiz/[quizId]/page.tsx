import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { SubjectChip } from "@/components/SubjectChip";
import { QuizRunner } from "@/components/QuizRunner";

export default async function QuizDetailPage({ params }: { params: { quizId: string } }) {
  const quiz = await db.quiz.findUnique({
    where: { id: params.quizId },
    include: {
      subject: true,
      questions: { orderBy: { order: "asc" }, include: { choices: { orderBy: { order: "asc" } } } },
    },
  });
  if (!quiz) notFound();

  const user = await getCurrentUser();

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-8">
      <Link href={`/faecher/${quiz.subject.slug}`} className="text-sm text-gray-500 hover:text-gray-700">
        ← {quiz.subject.name}
      </Link>
      <div className="mt-3 flex items-center justify-between flex-wrap gap-2">
        <SubjectChip name={quiz.subject.name} icon={quiz.subject.icon} color={quiz.subject.color} />
        <span className="text-xs text-gray-400 font-medium">Klasse {quiz.grade}</span>
      </div>
      <h1 className="mt-3 text-2xl font-extrabold text-gray-900">{quiz.title}</h1>
      <p className="mt-1 text-gray-500 text-sm">{quiz.description}</p>

      <div className="mt-6">
        <QuizRunner quizId={quiz.id} quizTitle={quiz.title} questions={quiz.questions} isGuest={!user} />
      </div>
    </div>
  );
}
