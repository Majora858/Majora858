"use client";

import { useRef, useState, useTransition } from "react";
import { sendAssistantMessage } from "@/lib/actions/assistant-actions";

type Message = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "Erkläre mir den Satz des Pythagoras",
  "Was ist der Unterschied zwischen Aktiv und Passiv?",
  "Wie funktioniert Photosynthese?",
  "Wann benutze ich Present Perfect?",
];

export function AssistantChat({ initialMessages }: { initialMessages: Message[] }) {
  const [messages, setMessages] = useState<Message[]>(
    initialMessages.length > 0
      ? initialMessages
      : [
          {
            role: "assistant",
            content:
              "Hey! Ich bin dein KI-Lernassistent. Frag mich etwas zu einem Schulthema – ich durchsuche die ganze Lernbibliothek für dich. 📚",
          },
        ]
  );
  const [input, setInput] = useState("");
  const [isPending, startTransition] = useTransition();
  const bottomRef = useRef<HTMLDivElement>(null);

  function send(text: string) {
    const content = text.trim();
    if (!content) return;
    setMessages((m) => [...m, { role: "user", content }]);
    setInput("");
    startTransition(async () => {
      const reply = await sendAssistantMessage(content);
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    });
  }

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)] lg:h-[calc(100vh-2rem)]">
      <div className="flex-1 overflow-y-auto scrollbar-thin space-y-3 px-1">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap leading-relaxed ${
                m.role === "user"
                  ? "bg-brand-600 text-white rounded-br-sm"
                  : "bg-white border border-gray-100 text-gray-800 shadow-card rounded-bl-sm"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        {isPending && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-100 shadow-card rounded-2xl rounded-bl-sm px-4 py-2.5 text-sm text-gray-400">
              Lernio denkt nach …
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {messages.length <= 1 && (
        <div className="flex flex-wrap gap-2 py-3">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              className="text-xs font-medium rounded-full border border-gray-200 bg-white px-3 py-1.5 hover:bg-gray-50"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="mt-2 flex items-center gap-2 pt-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Stell eine Frage zu einem Schulthema …"
          className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
        />
        <button
          type="submit"
          disabled={isPending || !input.trim()}
          className="rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-semibold px-5 py-3 text-sm"
        >
          Senden
        </button>
      </form>
    </div>
  );
}
