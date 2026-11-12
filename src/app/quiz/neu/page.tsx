import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { QuizForm } from "@/components/QuizForm";

export default async function NewQuizPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const subjects = await db.subject.findMany({ orderBy: { order: "asc" } });

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-extrabold text-gray-900">✅ Quiz erstellen</h1>
      <p className="text-gray-500 mt-1 mb-6">Stelle Fragen mit 4 Antwortmöglichkeiten und einer Erklärung.</p>
      <QuizForm subjects={subjects} defaultGrade={user.grade} />
    </div>
  );
}
