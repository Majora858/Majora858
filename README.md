# Lernio 🎓

Eine Lernapp nach dem Vorbild von **Knowunity** und **simpleclub** – mit allem, was man zum guten Lernen braucht, an einem Ort: Lerninhalte, Karteikarten mit Spaced Repetition, Quizze mit Sofort-Feedback, Fortschritt/XP/Streaks, Suche und ein KI-Lernassistent.

## Features

- **📚 Lerninhalte** – kompakte, markdown-formatierte Zusammenfassungen je Fach & Klassenstufe. Nutzer können eigene Inhalte veröffentlichen.
- **📇 Karteikarten** – eigene Sets erstellen, Lernen im Flip-Modus mit einem Leitner-/SM-2-ähnlichen Spaced-Repetition-Algorithmus (`src/lib/srs.ts`), der fällige Karten genau dann wieder anzeigt, wenn man sie sonst vergessen würde.
- **✅ Quizze** – Multiple-Choice mit sofortigem Feedback und Erklärung zu jeder Antwort, eigene Quizze erstellbar.
- **🔥 Gamification** – XP, Levels und tägliche Lern-Streaks (`src/lib/gamification.ts`), Abzeichen im Profil.
- **🔍 Suche** – fachübergreifend über Lerninhalte, Karteikarten-Sets und Quizze.
- **✨ KI-Lernassistent** – durchsucht die Lernbibliothek und gibt eine hilfreiche, kontextbezogene Antwort (`src/lib/assistant.ts`); schlanke, saubere Schnittstelle, um später eine echte LLM-Anbindung (z. B. Claude API) einzuhängen.
- **Eigenes Konto** – E-Mail/Passwort-Login mit sicherer Session (httpOnly-Cookie, JWT via `jose`, Passwort-Hashing via `bcryptjs`).

## Tech-Stack

Next.js 14 (App Router) · TypeScript · Tailwind CSS · Prisma + SQLite · Server Actions · `react-markdown`

## Setup

```bash
npm install
npm run db:push      # legt die SQLite-DB gemäß Schema an
npm run db:seed      # befüllt sie mit 8 Fächern, Lerninhalten, Karteikarten & Quizzen
npm run dev           # http://localhost:3000
```

**Demo-Login:** `demo@lernio.de` / `lernen123`

Zum kompletten Zurücksetzen der Datenbank (z. B. nach dem Ausprobieren):

```bash
npm run db:reset
```

## Projektstruktur

```
prisma/schema.prisma      Datenmodell (User, Subject, Content, FlashcardSet/Flashcard/CardProgress,
                           Quiz/Question/Choice/QuizAttempt, Bookmark, ContentProgress, ChatMessage)
prisma/seed.ts            Seed-Daten: 8 Fächer, 16 Lerninhalte, 8 Karteikarten-Sets, 8 Quizze
src/lib/                  Server-seitige Logik: auth, db, srs, gamification, search, assistant
src/lib/actions/          Next.js Server Actions (Mutations) je Feature
src/components/           UI-Bausteine (Sidebar, StudySession, QuizRunner, AssistantChat, Formulare …)
src/app/                  Seiten (App Router)
```

## Bekannte Einschränkungen / nächste Schritte

- **Next.js-Version:** Es wird die neueste Patch-Version der 14.x-Reihe verwendet (`14.2.35`). `npm audit` meldet dennoch bekannte CVEs, die erst mit Next.js 16 vollständig behoben sind (dort aber React 19 + teils andere App-Router-APIs erfordern). Für eine reine Lern-/Demo-Umgebung ist das Risiko gering (kein `next/image`, keine Middleware, keine Rewrites); für einen produktiven, öffentlich erreichbaren Einsatz empfiehlt sich ein Upgrade.
- **KI-Lernassistent:** Aktuell eine Retrieval-Logik über die eigene Lernbibliothek (keine externe API, funktioniert offline). Die Funktion `generateAssistantReply` in `src/lib/assistant.ts` ist bewusst als einzelne Stelle gebaut, um später eine echte LLM-Anbindung einzuhängen.
- **Videos:** Anders als bei simpleclub gibt es keine Videolektionen (kein Produktions-Setup für Videoinhalte in dieser Umgebung) – Lerninhalte sind stattdessen als geschriebene, strukturierte Zusammenfassungen umgesetzt.
