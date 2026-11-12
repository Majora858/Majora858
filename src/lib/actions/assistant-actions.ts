"use server";

import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { generateAssistantReply } from "@/lib/assistant";

export async function sendAssistantMessage(message: string): Promise<string> {
  const trimmed = message.trim().slice(0, 1000);
  if (!trimmed) return "";

  const user = await getCurrentUser();
  const reply = await generateAssistantReply(trimmed);

  if (user) {
    await db.chatMessage.createMany({
      data: [
        { userId: user.id, role: "user", content: trimmed },
        { userId: user.id, role: "assistant", content: reply },
      ],
    });
  }

  return reply;
}
