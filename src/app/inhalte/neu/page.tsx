import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { ContentForm } from "@/components/ContentForm";

export default async function NewContentPage({
  searchParams,
}: {
  searchParams: { subjectId?: string };
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const subjects = await db.subject.findMany({ orderBy: { order: "asc" } });

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-extrabold text-gray-900">✍️ Lerninhalt erstellen</h1>
      <p className="text-gray-500 mt-1 mb-6">
        Teile dein Wissen – jeder veröffentlichte Lerninhalt hilft auch anderen beim Lernen.
      </p>
      <ContentForm subjects={subjects} defaultSubjectId={searchParams.subjectId} defaultGrade={user.grade} />
    </div>
  );
}
