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
- **📱 Installierbar als iOS-App (PWA)** – eigenes App-Icon, Vollbildmodus ohne Browserleiste, Offline-Startseite, Safe-Area-Support für Notch/Dynamic Island. Siehe [„Als App auf dem iPhone installieren“](#als-app-auf-dem-iphone-installieren) unten.

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

## Als App auf dem iPhone installieren

Lernio ist eine **Progressive Web App (PWA)**: kein App-Store-Download nötig, funktioniert aber auf dem iPhone wie eine echte App.

1. Die Lernio-URL in **Safari** öffnen (muss Safari sein – andere Browser auf iOS unterstützen "Zum Home-Bildschirm" nicht zuverlässig).
2. Unten auf das **Teilen-Symbol** (⬆️) tippen.
3. **„Zum Home-Bildschirm"** auswählen.
4. Fertig – Lernio erscheint mit eigenem Icon auf dem Home-Bildschirm und startet im Vollbild ohne Browserleiste, inkl. Safe-Area-Support für Notch/Dynamic Island.

Beim ersten Öffnen zeigt die App selbst (auf iPhones in Safari) einen kurzen Hinweis mit dieser Anleitung an.

> **Wichtig:** Damit das dauerhaft funktioniert, muss die App unter einer festen, öffentlich erreichbaren HTTPS-URL laufen (z. B. nach einem Deploy auf [Vercel](https://vercel.com) – als Next.js-App ohne weitere Anpassungen deploybar). Die Vorschau-URL dieser Cloud-Session ist nur für die aktuelle Sitzung gültig.

### Was technisch dahintersteckt

- `public/manifest.webmanifest` – App-Name, Icons, `display: "standalone"`, Theme-Farbe
- `public/icon-*.png`, `apple-touch-icon.png` – generierte App-Icons
- `public/sw.js` – schlanker Service Worker: cached die App-Shell, zeigt bei fehlender Verbindung `public/offline.html` statt des hässlichen Browser-Fehlers (dynamische/personalisierte Seiten werden bewusst **nicht** aggressiv gecacht, um keine veralteten XP-/Fortschrittsdaten anzuzeigen)
- `src/components/InstallPrompt.tsx` – zeigt einmalig den Installationshinweis auf iOS-Safari (kein natives `beforeinstallprompt`-Event auf iOS verfügbar)
- `src/app/layout.tsx` – `appleWebApp`-Metadaten, Safe-Area-Padding für Notch/Dynamic Island

## Projektstruktur

```
prisma/schema.prisma      Datenmodell (User, Subject, Content, FlashcardSet/Flashcard/CardProgress,
                           Quiz/Question/Choice/QuizAttempt, Bookmark, ContentProgress, ChatMessage)
prisma/seed.ts            Seed-Daten: 8 Fächer, 16 Lerninhalte, 8 Karteikarten-Sets, 8 Quizze
src/lib/                  Server-seitige Logik: auth, db, srs, gamification, search, assistant
src/lib/actions/          Next.js Server Actions (Mutations) je Feature
src/components/           UI-Bausteine (Sidebar, StudySession, QuizRunner, AssistantChat, Formulare …)
src/app/                  Seiten (App Router)
public/                   PWA-Assets: manifest.webmanifest, Icons, sw.js, offline.html
```

## Bekannte Einschränkungen / nächste Schritte

- **PWA statt native App:** Lernio ist als installierbare Progressive Web App umgesetzt, kein eigenständiges `.ipa`/App-Store-Listing. Das funktioniert ohne Apple-Developer-Account und ohne Mac/Xcode, hat aber iOS-typische PWA-Grenzen (z. B. kein Push via APNs, etwas eingeschränkter Hintergrund-Speicher). Für eine "echte" App-Store-App wäre ein Neuaufbau der Oberfläche mit React Native/Expo nötig (Backend müsste dafür als API statt Server Actions bereitgestellt werden).
- **Next.js-Version:** Es wird die neueste Patch-Version der 14.x-Reihe verwendet (`14.2.35`). `npm audit` meldet dennoch bekannte CVEs, die erst mit Next.js 16 vollständig behoben sind (dort aber React 19 + teils andere App-Router-APIs erfordern). Für eine reine Lern-/Demo-Umgebung ist das Risiko gering (kein `next/image`, keine Middleware, keine Rewrites); für einen produktiven, öffentlich erreichbaren Einsatz empfiehlt sich ein Upgrade.
- **KI-Lernassistent:** Aktuell eine Retrieval-Logik über die eigene Lernbibliothek (keine externe API, funktioniert offline). Die Funktion `generateAssistantReply` in `src/lib/assistant.ts` ist bewusst als einzelne Stelle gebaut, um später eine echte LLM-Anbindung einzuhängen.
- **Videos:** Anders als bei simpleclub gibt es keine Videolektionen (kein Produktions-Setup für Videoinhalte in dieser Umgebung) – Lerninhalte sind stattdessen als geschriebene, strukturierte Zusammenfassungen umgesetzt.
