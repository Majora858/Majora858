import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { FlashcardSetForm } from "@/components/FlashcardSetForm";

export default async function NewFlashcardSetPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const subjects = await db.subject.findMany({ orderBy: { order: "asc" } });

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-extrabold text-gray-900">📇 Karteikarten-Set erstellen</h1>
      <p className="text-gray-500 mt-1 mb-6">Lege eigene Karten an und übe sie mit Spaced Repetition.</p>
      <FlashcardSetForm subjects={subjects} defaultGrade={user.grade} />
    </div>
  );
}
