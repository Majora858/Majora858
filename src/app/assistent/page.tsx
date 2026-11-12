import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { AssistantChat } from "@/components/AssistantChat";

export default async function AssistantPage() {
  const user = await getCurrentUser();

  let initialMessages: { role: "user" | "assistant"; content: string }[] = [];
  if (user) {
    const history = await db.chatMessage.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "asc" },
      take: 20,
    });
    initialMessages = history.map((h) => ({ role: h.role as "user" | "assistant", content: h.content }));
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
      <h1 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
        <span>✨</span> KI-Lernassistent
      </h1>
      <p className="text-sm text-gray-500 mt-1 mb-4">
        Durchsucht deine ganze Lernbibliothek und hilft dir weiter.
      </p>
      <AssistantChat initialMessages={initialMessages} />
    </div>
  );
}
