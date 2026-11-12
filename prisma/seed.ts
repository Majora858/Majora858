import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function main() {
  console.log("Seeding database...");

  // --- Users ---------------------------------------------------------
  const demoPasswordHash = await bcrypt.hash("lernen123", 10);
  const demo = await db.user.upsert({
    where: { email: "demo@lernio.de" },
    update: {},
    create: {
      name: "Mia Musterfrau",
      email: "demo@lernio.de",
      passwordHash: demoPasswordHash,
      grade: 9,
      xp: 340,
      streak: 4,
      lastStudyAt: new Date(),
    },
  });

  // --- Subjects --------------------------------------------------------
  const subjectDefs = [
    { name: "Mathematik", icon: "📐", color: "#6366f1" },
    { name: "Deutsch", icon: "📖", color: "#e11d48" },
    { name: "Englisch", icon: "🇬🇧", color: "#2563eb" },
    { name: "Biologie", icon: "🧬", color: "#16a34a" },
    { name: "Chemie", icon: "⚗️", color: "#d97706" },
    { name: "Physik", icon: "⚛️", color: "#0891b2" },
    { name: "Geschichte", icon: "🏛️", color: "#78716c" },
    { name: "Geographie", icon: "🌍", color: "#0d9488" },
  ];

  const subjects: Record<string, Awaited<ReturnType<typeof db.subject.upsert>>> = {};
  for (let i = 0; i < subjectDefs.length; i++) {
    const d = subjectDefs[i];
    subjects[d.name] = await db.subject.upsert({
      where: { name: d.name },
      update: { icon: d.icon, color: d.color, order: i },
      create: { name: d.name, slug: slugify(d.name), icon: d.icon, color: d.color, order: i },
    });
  }

  // --- Content (Lerninhalte) -------------------------------------------
  type ContentSeed = {
    title: string;
    subject: string;
    grade: number;
    minutes: number;
    summary: string;
    body: string;
  };

  const contents: ContentSeed[] = [
    {
      title: "Lineare Gleichungen lösen",
      subject: "Mathematik",
      grade: 8,
      minutes: 7,
      summary: "So löst du Gleichungen der Form ax + b = c Schritt für Schritt.",
      body: `## Was ist eine lineare Gleichung?

Eine lineare Gleichung enthält eine Variable (meist **x**), die nur in der ersten Potenz vorkommt, z. B.:

\`3x + 5 = 20\`

## Die Grundregel

Du darfst auf beiden Seiten der Gleichung **dieselbe Rechnung** durchführen, ohne dass sich der Wahrheitswert ändert:

1. **Addieren/Subtrahieren** auf beiden Seiten
2. **Multiplizieren/Dividieren** auf beiden Seiten (außer durch 0)

## Beispiel

\`3x + 5 = 20\`

1. Subtrahiere 5 auf beiden Seiten: \`3x = 15\`
2. Teile beide Seiten durch 3: \`x = 5\`

**Probe:** 3 · 5 + 5 = 20 ✓

## Typische Fehler

- Vorzeichen beim Umstellen vergessen
- Nur eine Seite der Gleichung verändern
- Klammern nicht vollständig ausmultiplizieren

## Übungsaufgabe

Löse: \`4x - 7 = 2x + 9\`

*Tipp:* Bringe zuerst alle x-Terme auf eine Seite, dann alle Zahlen auf die andere.

**Lösung:** 2x = 16 → x = 8`,
    },
    {
      title: "Der Satz des Pythagoras",
      subject: "Mathematik",
      grade: 9,
      minutes: 6,
      summary: "Die wichtigste Formel für rechtwinklige Dreiecke – verständlich erklärt.",
      body: `## Die Formel

In jedem **rechtwinkligen Dreieck** gilt für die Seitenlängen:

\`a² + b² = c²\`

Dabei ist **c** immer die **Hypotenuse** – die längste Seite, die dem rechten Winkel gegenüberliegt. **a** und **b** heißen **Katheten**.

## Wann darf ich ihn benutzen?

Nur bei einem Dreieck mit einem **90°-Winkel**!

## Beispielrechnung

Ein Dreieck hat die Katheten a = 3 cm und b = 4 cm. Wie lang ist die Hypotenuse?

1. \`a² + b² = c²\`
2. \`3² + 4² = c²\`
3. \`9 + 16 = c²\`
4. \`c² = 25\`
5. \`c = 5 cm\`

## Hypotenuse gegeben, Kathete gesucht

Wenn c bekannt ist, stellt man um:

\`a² = c² - b²\`

## Anwendungen im Alltag

- Leiter an einer Wand (Höhe berechnen)
- Entfernungen auf einer Karte (Luftlinie)
- Bildschirmdiagonalen (16:9-Format)

## Übungsaufgabe

Ein Fernseher hat eine Breite von 80 cm und eine Höhe von 45 cm. Wie groß ist die Bildschirmdiagonale (gerundet)?

**Lösung:** c = √(80² + 45²) = √(6400+2025) = √8425 ≈ 91,8 cm`,
    },
    {
      title: "Aktiv und Passiv",
      subject: "Deutsch",
      grade: 7,
      minutes: 5,
      summary: "Der Unterschied zwischen Tätigkeits- und Leideform – mit Beispielen.",
      body: `## Aktiv (Tätigkeitsform)

Im Aktivsatz steht die **handelnde Person** im Vordergrund:

> **Der Lehrer** korrigiert die Klassenarbeit.

## Passiv (Leideform)

Im Passivsatz steht die **Handlung bzw. das Objekt** im Vordergrund, der Handelnde tritt in den Hintergrund oder fehlt ganz:

> Die Klassenarbeit **wird** von dem Lehrer **korrigiert**.

## Bildung des Passivs

\`werden + Partizip II\`

| Zeitform | Beispiel |
|---|---|
| Präsens | Das Haus wird gebaut. |
| Präteritum | Das Haus wurde gebaut. |
| Perfekt | Das Haus ist gebaut worden. |

## Wann benutzt man das Passiv?

- Wenn der Handelnde unbekannt oder unwichtig ist: *Das Fenster wurde eingeschlagen.*
- In Anleitungen und Berichten: *Zuerst wird das Mehl gesiebt.*
- In der Wissenschaftssprache: *Die Probe wurde untersucht.*

## Umwandeln: Aktiv → Passiv

1. Das Akkusativobjekt des Aktivsatzes wird zum Subjekt des Passivsatzes.
2. Das Subjekt des Aktivsatzes wird zur "von"-Angabe (oder entfällt).
3. Das Verb wird zu "werden + Partizip II".

**Beispiel:** *Die Katze jagt die Maus.* → *Die Maus wird von der Katze gejagt.*

## Übungsaufgabe

Wandle um: "Der Bäcker backt das Brot." → Passiv

**Lösung:** Das Brot wird von dem Bäcker gebacken.`,
    },
    {
      title: "Eine Gedichtanalyse schreiben",
      subject: "Deutsch",
      grade: 9,
      minutes: 8,
      summary: "Aufbau, Fachbegriffe und Formulierungshilfen für die Gedichtinterpretation.",
      body: `## Der Aufbau einer Gedichtanalyse

1. **Einleitung**: Autor, Titel, Erscheinungsjahr, Thema, Epoche, erste Deutungshypothese
2. **Hauptteil**: Inhaltsangabe + formale Analyse (Form, Sprache) + Deutung
3. **Schluss**: Zusammenfassung, Bezug zur Deutungshypothese, eigene Stellungnahme

## Formale Merkmale, die du untersuchen solltest

- **Strophen & Verse**: Wie viele? Regelmäßig?
- **Reimschema**: z. B. Paarreim (aabb), Kreuzreim (abab), umschließender Reim (abba)
- **Metrum**: Jambus (betont-unbetont), Trochäus (unbetont-betont)
- **Sprachliche Mittel**: Metapher, Vergleich, Anapher, Alliteration, Enjambement

## Nützliche Formulierungen

- "Das lyrische Ich beschreibt…"
- "Durch die Metapher … wird deutlich, dass…"
- "Der Kreuzreim erzeugt eine fließende Lesart, die …"
- "Dieses sprachliche Mittel unterstreicht …"

## Wichtig: Immer Belege zitieren!

Jede Deutung muss durch ein **Zitat mit Verszeile** belegt werden, z. B.:

> "Die Nacht war kühl und still" (V. 3) erzeugt eine ruhige Grundstimmung.

## Häufiger Fehler

Nur Formales aufzählen, ohne es zu **deuten** – die Wirkung auf den Leser und der Zusammenhang zur Aussage des Gedichts müssen immer erklärt werden.`,
    },
    {
      title: "Simple Past vs. Present Perfect",
      subject: "Englisch",
      grade: 7,
      minutes: 6,
      summary: "Wann benutzt man welche Zeitform? Mit Signalwörtern und Beispielen.",
      body: `## Simple Past

Benutzt für abgeschlossene Handlungen zu einem **bestimmten Zeitpunkt** in der Vergangenheit.

> I **visited** London last year.

**Signalwörter:** yesterday, last week, in 2019, ago, when I was young

## Present Perfect

Benutzt, wenn der **genaue Zeitpunkt unwichtig** ist oder die Handlung Auswirkungen auf die Gegenwart hat.

> I **have visited** London. (irgendwann, Zeitpunkt egal)

**Signalwörter:** just, already, yet, ever, never, since, for, so far

## Bildung

| Zeitform | Bildung | Beispiel |
|---|---|---|
| Simple Past | Verb + ed / 2. Form | played / went |
| Present Perfect | have/has + Partizip II | have played / have gone |

## Direkter Vergleich

> ❌ I have visited London last year.
> ✅ I visited London last year. (genauer Zeitpunkt → Simple Past)

> ❌ I visited London already.
> ✅ I have visited London already. (Signalwort "already" → Present Perfect)

## Übungsaufgabe

Setze die richtige Zeitform ein: "She ___ (not finish) her homework yet."

**Lösung:** has not finished (Signalwort "yet" → Present Perfect)`,
    },
    {
      title: "Conditional Sentences (If-Clauses)",
      subject: "Englisch",
      grade: 9,
      minutes: 7,
      summary: "Die drei wichtigsten If-Satz-Typen mit Bildung und Beispielen.",
      body: `## Typ 1 – Reale Möglichkeit (Zukunft)

\`If + Simple Present, will + Infinitiv\`

> If it **rains**, I **will stay** home.

## Typ 2 – Unreale/unwahrscheinliche Gegenwart

\`If + Simple Past, would + Infinitiv\`

> If I **won** the lottery, I **would travel** the world.

## Typ 3 – Unreale Vergangenheit (nicht mehr änderbar)

\`If + Past Perfect, would have + Partizip II\`

> If I **had studied**, I **would have passed** the exam.

## Merkhilfe

- Typ 1: kann noch passieren
- Typ 2: könnte passieren, ist aber unwahrscheinlich
- Typ 3: ist vorbei, kann nicht mehr geändert werden

## Achtung bei "were"

Bei Typ 2 benutzt man nach "if" bei "to be" immer **were**, auch bei I/he/she/it:

> If I **were** you, I would apologize.

## Übungsaufgabe

Bilde Typ 3: "I didn't see you, so I didn't say hello." → If-Satz

**Lösung:** If I had seen you, I would have said hello.`,
    },
    {
      title: "Die Zelle – Aufbau und Funktion",
      subject: "Biologie",
      grade: 7,
      minutes: 6,
      summary: "Zellorganellen und ihre Aufgaben – Grundwissen für die Biologie.",
      body: `## Tierische vs. pflanzliche Zelle

Beide Zelltypen besitzen: **Zellmembran, Zellkern, Zytoplasma, Mitochondrien**.

Nur die **pflanzliche** Zelle besitzt zusätzlich: **Zellwand, Chloroplasten, große Vakuole**.

## Die wichtigsten Zellorganellen

- **Zellkern**: enthält die Erbinformation (DNA), steuert die Zelle
- **Mitochondrien**: "Kraftwerke der Zelle", Ort der Zellatmung → Energiegewinnung (ATP)
- **Zellmembran**: umschließt die Zelle, reguliert den Stoffaustausch
- **Chloroplasten** (nur Pflanzen): Ort der Photosynthese, enthalten Chlorophyll
- **Zellwand** (nur Pflanzen): gibt Stabilität und Form
- **Vakuole**: Speicher für Wasser und Stoffe, reguliert den Zelldruck
- **Ribosomen**: Ort der Proteinbiosynthese

## Warum ist die Zelle die "Grundeinheit des Lebens"?

Jeder lebende Organismus besteht aus mindestens einer Zelle. Zellen können sich selbst teilen, Stoffe aufnehmen/abgeben und Energie gewinnen – das sind zentrale Lebensmerkmale.

## Merksatz

"Alle Lebewesen bestehen aus Zellen, und Zellen entstehen nur aus Zellen." (Zelltheorie)

## Übungsaufgabe

Nenne zwei Organellen, die **nur** in Pflanzenzellen vorkommen.

**Lösung:** Chloroplasten und Zellwand (auch: große zentrale Vakuole)`,
    },
    {
      title: "Photosynthese einfach erklärt",
      subject: "Biologie",
      grade: 8,
      minutes: 6,
      summary: "Wie Pflanzen aus Licht, Wasser und CO₂ Energie herstellen.",
      body: `## Die Wortgleichung

**Kohlenstoffdioxid + Wasser + Lichtenergie → Traubenzucker + Sauerstoff**

## Die chemische Gleichung

\`6 CO₂ + 6 H₂O + Lichtenergie → C₆H₁₂O₆ + 6 O₂\`

## Wo findet Photosynthese statt?

In den **Chloroplasten** der Pflanzenzellen, genauer am Blattgrün (**Chlorophyll**), das Lichtenergie absorbiert.

## Die zwei Teilschritte

1. **Lichtreaktion**: Lichtenergie wird genutzt, um Wasser zu spalten → Sauerstoff entsteht als "Abfallprodukt"
2. **Dunkelreaktion (Calvin-Zyklus)**: CO₂ wird mithilfe der Energie aus der Lichtreaktion zu Traubenzucker umgewandelt

## Warum ist Photosynthese so wichtig?

- Sie ist die **Grundlage fast aller Nahrungsketten** (Pflanzen als Produzenten)
- Sie produziert den **Sauerstoff**, den wir atmen
- Sie baut CO₂ aus der Atmosphäre ab (wichtig fürs Klima)

## Zusammenhang mit der Zellatmung

Zellatmung ist quasi die **Umkehrung** der Photosynthese: Dort wird Traubenzucker + Sauerstoff zu CO₂ + Wasser + Energie umgesetzt – das passiert in den Mitochondrien aller Lebewesen.

## Übungsaufgabe

Welche zwei "Rohstoffe" braucht eine Pflanze zwingend für die Photosynthese (neben Licht)?

**Lösung:** Kohlenstoffdioxid (CO₂) und Wasser (H₂O)`,
    },
    {
      title: "Das Periodensystem der Elemente",
      subject: "Chemie",
      grade: 8,
      minutes: 7,
      summary: "Aufbau, Gruppen, Perioden und was man daraus ablesen kann.",
      body: `## Aufbau des Periodensystems (PSE)

- **Perioden** (waagerechte Zeilen) = Anzahl der Elektronenschalen
- **Gruppen** (senkrechte Spalten) = Anzahl der Außenelektronen (bei Hauptgruppen)

## Wichtige Gruppen

- **Gruppe 1 – Alkalimetalle** (Li, Na, K…): sehr reaktionsfreudig, 1 Außenelektron
- **Gruppe 7 – Halogene** (F, Cl, Br…): sehr reaktionsfreudig, 7 Außenelektronen
- **Gruppe 8 – Edelgase** (He, Ne, Ar…): reaktionsträge, volle Außenschale

## Was die Ordnungszahl verrät

Die **Ordnungszahl** entspricht der Anzahl der **Protonen** im Atomkern – und bei einem neutralen Atom auch der Anzahl der Elektronen.

## Atommasse

Die (relative) **Atommasse** gibt ungefähr an, wie viele Protonen + Neutronen im Kern sind.

## Trend: Metalle vs. Nichtmetalle

Links und unten im PSE stehen die **Metalle** (glänzend, leitfähig), rechts oben die **Nichtmetalle**. Die "Treppe" dazwischen markiert die Halbmetalle.

## Merkregel für die Reaktionsfreude

Elemente wollen eine **volle Außenschale** erreichen (Edelgaskonfiguration) – das erklärt, warum Alkalimetalle Elektronen abgeben und Halogene Elektronen aufnehmen wollen.

## Übungsaufgabe

Element X hat die Ordnungszahl 11 und steht in Gruppe 1. Wie viele Außenelektronen hat es, und wie reaktionsfreudig ist es?

**Lösung:** 1 Außenelektron, sehr reaktionsfreudig (Alkalimetall, hier: Natrium)`,
    },
    {
      title: "Chemische Reaktionen & Massenerhaltung",
      subject: "Chemie",
      grade: 9,
      minutes: 6,
      summary: "Warum bei Reaktionen nichts verschwindet – nur umgewandelt wird.",
      body: `## Das Gesetz der Erhaltung der Masse

Bei einer chemischen Reaktion ist die **Gesamtmasse der Edukte** (Ausgangsstoffe) immer gleich der **Gesamtmasse der Produkte**. Masse wird nicht erzeugt oder zerstört, nur umgewandelt.

## Was passiert bei einer chemischen Reaktion?

Atome werden **neu verknüpft** – chemische Bindungen werden gelöst und neu gebildet. Die Atome selbst bleiben erhalten, nur ihre Kombination ändert sich.

## Reaktionsgleichungen richtig aufstellen

1. Edukte und Produkte in Formeln aufschreiben
2. Prüfen, ob auf beiden Seiten gleich viele Atome jeder Sorte stehen
3. Falls nicht: Koeffizienten (Zahlen vor den Formeln) anpassen – **niemals** die tiefgestellten Indizes verändern!

**Beispiel:** Wasserstoff + Sauerstoff → Wasser

Unausgeglichen: \`H₂ + O₂ → H₂O\`
Ausgeglichen: \`2 H₂ + O₂ → 2 H₂O\`

## Exotherme vs. endotherme Reaktionen

- **Exotherm**: Energie wird frei (z. B. Verbrennung)
- **Endotherm**: Energie wird benötigt/aufgenommen (z. B. Photosynthese)

## Übungsaufgabe

Gleiche aus: \`N₂ + H₂ → NH₃\`

**Lösung:** N₂ + 3 H₂ → 2 NH₃`,
    },
    {
      title: "Die Newtonschen Gesetze",
      subject: "Physik",
      grade: 9,
      minutes: 7,
      summary: "Die drei Grundgesetze der Mechanik – verständlich mit Alltagsbeispielen.",
      body: `## 1. Newtonsches Gesetz – Trägheitsprinzip

Ein Körper bleibt in Ruhe oder gleichförmiger Bewegung, solange keine resultierende Kraft auf ihn wirkt.

> Beispiel: Du wirst beim Bremsen im Auto nach vorne gedrückt – dein Körper "will" seine Bewegung beibehalten.

## 2. Newtonsches Gesetz – Aktionsprinzip

\`F = m · a\`

Die Kraft ist gleich Masse mal Beschleunigung. Je größer die Masse, desto mehr Kraft braucht man für dieselbe Beschleunigung.

> Beispiel: Ein leeres Fahrrad lässt sich leichter beschleunigen als eines mit schwerem Gepäck.

## 3. Newtonsches Gesetz – Wechselwirkungsprinzip (actio = reactio)

Zu jeder Kraft gibt es eine gleich große, entgegengesetzte Gegenkraft.

> Beispiel: Beim Abspringen vom Boot drückst du das Boot nach hinten weg (und das Boot drückt dich nach vorne).

## Rechenbeispiel zu F = m·a

Ein Einkaufswagen (m = 15 kg) soll mit a = 2 m/s² beschleunigt werden. Welche Kraft ist nötig?

\`F = 15 kg · 2 m/s² = 30 N\`

## Übungsaufgabe

Welches Gesetz erklärt, warum man beim Anschnallen im Auto nicht nach vorne fliegt, wenn das Auto bremst?

**Lösung:** Das 1. Newtonsche Gesetz (Trägheitsprinzip) – der Gurt liefert die Kraft, die den Körper abbremst.`,
    },
    {
      title: "Stromkreise: Reihen- und Parallelschaltung",
      subject: "Physik",
      grade: 8,
      minutes: 6,
      summary: "Unterschiede bei Strom, Spannung und Widerstand in beiden Schaltungsarten.",
      body: `## Reihenschaltung

Die Bauteile sind **hintereinander** geschaltet – es gibt nur einen Strompfad.

- **Stromstärke I** ist überall gleich: \`I = I₁ = I₂\`
- **Spannung U** teilt sich auf: \`U = U₁ + U₂\`
- **Gesamtwiderstand**: \`R = R₁ + R₂\`

Fällt ein Bauteil aus, ist der ganze Kreis unterbrochen (z. B. alte Lichterketten).

## Parallelschaltung

Die Bauteile liegen **nebeneinander** – es gibt mehrere Strompfade.

- **Spannung U** ist überall gleich: \`U = U₁ = U₂\`
- **Stromstärke I** teilt sich auf: \`I = I₁ + I₂\`
- **Gesamtwiderstand**: \`1/R = 1/R₁ + 1/R₂\` (Gesamtwiderstand ist kleiner als jeder Einzelwiderstand!)

Fällt ein Bauteil aus, funktionieren die anderen weiter (z. B. Steckdosen in der Wohnung).

## Merkhilfe

"Reihe teilt die Spannung, Parallel teilt den Strom."

## Übungsaufgabe

Zwei Widerstände (R₁ = 4 Ω, R₂ = 4 Ω) werden parallel geschaltet. Wie groß ist der Gesamtwiderstand?

**Lösung:** 1/R = 1/4 + 1/4 = 1/2 → R = 2 Ω`,
    },
    {
      title: "Die Französische Revolution",
      subject: "Geschichte",
      grade: 9,
      minutes: 8,
      summary: "Ursachen, Verlauf und Folgen von 1789 – kompakt zusammengefasst.",
      body: `## Ursachen

- **Soziale Ungleichheit**: Ständegesellschaft (Adel & Klerus privilegiert, 3. Stand trägt die Steuerlast)
- **Finanzkrise**: Der Staat ist durch Kriege und den Luxus des Hofes hoch verschuldet
- **Ideen der Aufklärung**: Freiheit, Gleichheit, Volkssouveränität (Rousseau, Montesquieu)
- **Missernten** 1788/89 führen zu Hunger und steigenden Brotpreisen

## Wichtige Stationen

1. **14. Juli 1789**: Sturm auf die Bastille – Symbol für den Beginn der Revolution
2. **26. August 1789**: Erklärung der Menschen- und Bürgerrechte
3. **1792**: Ausrufung der Republik
4. **1793**: Hinrichtung von Ludwig XVI., Beginn der "Terrorherrschaft" unter Robespierre
5. **1799**: Napoleon übernimmt die Macht (Ende der Revolution im engeren Sinn)

## Die drei Stände

- **1. Stand**: Klerus (Geistlichkeit)
- **2. Stand**: Adel
- **3. Stand**: Bürger, Bauern, Arbeiter (über 95 % der Bevölkerung, zahlten fast alle Steuern)

## Leitspruch der Revolution

**"Liberté, Égalité, Fraternité"** – Freiheit, Gleichheit, Brüderlichkeit

## Bedeutung bis heute

Die Menschenrechtserklärung von 1789 beeinflusst bis heute Verfassungen weltweit und gilt als Grundstein moderner Demokratien.

## Übungsaufgabe

Nenne zwei zentrale Ursachen der Französischen Revolution.

**Lösung:** z. B. soziale Ungleichheit der Ständegesellschaft und die Finanzkrise des Staates`,
    },
    {
      title: "Der Kalte Krieg – Ursachen und Verlauf",
      subject: "Geschichte",
      grade: 10,
      minutes: 8,
      summary: "Die Blockkonfrontation zwischen USA und UdSSR von 1947 bis 1991.",
      body: `## Was bedeutet "Kalter Krieg"?

Eine Phase der Konfrontation zwischen den **USA** (Westblock, Kapitalismus/Demokratie) und der **UdSSR** (Ostblock, Kommunismus) nach 1945 – ohne direkten "heißen" Krieg zwischen beiden Supermächten, aber mit Wettrüsten, Stellvertreterkriegen und Propaganda.

## Wichtige Ereignisse

- **1947**: Truman-Doktrin – USA wollen die Ausbreitung des Kommunismus eindämmen
- **1949**: Gründung von BRD und DDR, NATO wird gegründet
- **1955**: Warschauer Pakt (Gegenbündnis zur NATO)
- **1961**: Bau der Berliner Mauer
- **1962**: Kubakrise – die Welt steht kurz vor einem Atomkrieg
- **1989**: Fall der Berliner Mauer
- **1991**: Auflösung der Sowjetunion – Ende des Kalten Krieges

## Das Prinzip der Abschreckung

Beide Seiten rüsteten atomar massiv auf (**Wettrüsten**). Das Konzept **MAD** (Mutually Assured Destruction) sollte einen Angriff unattraktiv machen, da er die gegenseitige Zerstörung garantiert hätte.

## Stellvertreterkriege

Da ein direkter Krieg zu riskant war, unterstützten beide Blöcke gegnerische Seiten in anderen Konflikten, z. B. im **Koreakrieg** (1950–53) und im **Vietnamkrieg** (1955–75).

## Übungsaufgabe

Warum spricht man von einem "kalten" und nicht "heißen" Krieg?

**Lösung:** Weil es zu keiner direkten militärischen Auseinandersetzung zwischen den USA und der UdSSR kam – der Konflikt wurde über Rüstung, Politik, Propaganda und Stellvertreterkriege ausgetragen.`,
    },
    {
      title: "Der Wasserkreislauf",
      subject: "Geographie",
      grade: 6,
      minutes: 5,
      summary: "Wie Wasser zwischen Meer, Atmosphäre und Land zirkuliert.",
      body: `## Die wichtigsten Stationen

1. **Verdunstung (Evaporation)**: Die Sonne erwärmt Wasser in Meeren, Seen und Flüssen – es verdunstet und steigt als Wasserdampf auf
2. **Kondensation**: In der Höhe kühlt die Luft ab, der Wasserdampf wird wieder zu winzigen Tröpfchen → Wolken entstehen
3. **Niederschlag**: Werden die Tröpfchen zu groß und schwer, fallen sie als Regen, Schnee oder Hagel zu Boden
4. **Abfluss & Versickerung**: Das Wasser fließt in Flüsse, sammelt sich in Seen oder versickert ins Grundwasser
5. Das Wasser erreicht wieder das Meer – der Kreislauf beginnt erneut

## Transpiration

Auch Pflanzen geben über ihre Blätter Wasserdampf an die Luft ab – das nennt man **Transpiration**. Zusammen mit der Verdunstung von Wasserflächen spricht man von **Evapotranspiration**.

## Warum ist der Wasserkreislauf so wichtig?

Er sorgt dafür, dass Süßwasser immer wieder "neu" zur Verfügung steht – ohne ihn gäbe es kein Trinkwasser, keine Flüsse und kein Leben auf dem Land.

## Übungsaufgabe

In welcher Reihenfolge laufen die Prozesse ab: Niederschlag, Kondensation, Verdunstung?

**Lösung:** Verdunstung → Kondensation → Niederschlag`,
    },
    {
      title: "Plattentektonik und Erdbeben",
      subject: "Geographie",
      grade: 8,
      minutes: 7,
      summary: "Wie sich Kontinente bewegen und warum es dabei zu Erdbeben kommt.",
      body: `## Die Lithosphärenplatten

Die Erdkruste ist in mehrere große und kleine **Platten** zerbrochen, die auf dem zähflüssigen Erdmantel "schwimmen" und sich sehr langsam bewegen (wenige cm pro Jahr).

## Die drei Plattenrandtypen

1. **Divergierende Plattenränder** (Platten bewegen sich voneinander weg): Es entsteht neuer Ozeanboden, z. B. am Mittelatlantischen Rücken
2. **Konvergierende Plattenränder** (Platten bewegen sich aufeinander zu): Eine Platte wird unter die andere gedrückt (**Subduktion**) → Gebirge und Vulkane entstehen, z. B. die Anden
3. **Transformstörungen** (Platten gleiten aneinander vorbei): Starke Spannungen bauen sich auf, z. B. die San-Andreas-Verwerfung in Kalifornien

## Warum entstehen Erdbeben?

An den Plattenrändern baut sich durch die Bewegung **Spannung** im Gestein auf. Wird die Spannung zu groß, entlädt sie sich ruckartig – die Erde "bebt". Das Epizentrum ist der Punkt an der Oberfläche direkt über dem Ursprung des Bebens.

## Der Pazifische Feuerring

Rund um den Pazifischen Ozean treffen viele Platten aufeinander – hier liegen die meisten aktiven Vulkane und es kommt am häufigsten zu Erdbeben weltweit.

## Übungsaufgabe

An welchem Plattenrandtyp entstehen am ehesten hohe Gebirgsketten wie die Anden?

**Lösung:** An konvergierenden Plattenrändern (Subduktion)`,
    },
  ];

  const contentIdBySlugTitle: Record<string, string> = {};
  for (const c of contents) {
    const slug = slugify(c.title);
    const created = await db.content.upsert({
      where: { slug },
      update: {},
      create: {
        title: c.title,
        slug,
        summary: c.summary,
        body: c.body,
        grade: c.grade,
        minutes: c.minutes,
        subjectId: subjects[c.subject].id,
        authorId: demo.id,
      },
    });
    contentIdBySlugTitle[c.title] = created.id;
  }

  // --- Flashcard sets ----------------------------------------------------
  type SetSeed = {
    title: string;
    subject: string;
    grade: number;
    description: string;
    cards: [string, string][];
  };

  const sets: SetSeed[] = [
    {
      title: "Algebra-Grundbegriffe",
      subject: "Mathematik",
      grade: 8,
      description: "Die wichtigsten Begriffe rund ums Gleichungslösen.",
      cards: [
        ["Was ist eine Variable?", "Ein Platzhalter für eine unbekannte Zahl, meist mit x bezeichnet."],
        ["Was bedeutet 'äquivalent umformen'?", "Beide Seiten einer Gleichung mit derselben Operation verändern, ohne die Lösung zu verändern."],
        ["Wie löst man 2x = 10?", "Beide Seiten durch 2 teilen: x = 5."],
        ["Was ist die 'Probe'?", "Das Einsetzen der Lösung in die Ausgangsgleichung zur Kontrolle."],
        ["Was besagt der Satz des Pythagoras?", "a² + b² = c² für rechtwinklige Dreiecke, c = Hypotenuse."],
        ["Was ist die Hypotenuse?", "Die längste Seite im rechtwinkligen Dreieck, gegenüber dem rechten Winkel."],
        ["Was sind Katheten?", "Die beiden kürzeren Seiten im rechtwinkligen Dreieck, die den rechten Winkel einschließen."],
        ["Wie rechnet man 5² ?", "5 · 5 = 25"],
      ],
    },
    {
      title: "Literarische Epochen",
      subject: "Deutsch",
      grade: 9,
      description: "Überblick über die wichtigsten Epochen der deutschen Literatur.",
      cards: [
        ["Wann war die Epoche der Aufklärung?", "Ca. 1720–1800, Leitidee: Vernunft statt Aberglaube ('Kant: Ausgang aus der Selbstverschuldeten Unmündigkeit')."],
        ["Wann war die Klassik (Weimarer Klassik)?", "Ca. 1786–1805, geprägt von Goethe & Schiller, Ideal: Humanität und Harmonie."],
        ["Was zeichnet die Romantik aus?", "Betonung von Gefühl, Natur, Fantasie und Sehnsucht (ca. 1795–1848)."],
        ["Was ist typisch für den Naturalismus?", "Möglichst genaue, 'wissenschaftliche' Abbildung der Wirklichkeit, auch sozialer Missstände."],
        ["Wann war der Expressionismus?", "Ca. 1910–1925, intensiver Ausdruck innerer Gefühle, oft Großstadt- und Kriegsthemen."],
        ["Was ist eine Metapher?", "Ein bildhafter Ausdruck ohne Vergleichswort, z. B. 'Zeit ist Geld'."],
        ["Was ist ein Enjambement?", "Ein Satz läuft über das Versende hinaus in die nächste Zeile weiter."],
        ["Was ist eine Anapher?", "Die Wiederholung eines Wortes am Anfang aufeinanderfolgender Verse oder Sätze."],
      ],
    },
    {
      title: "Englische Zeiten & Signalwörter",
      subject: "Englisch",
      grade: 8,
      description: "Alle wichtigen Tenses mit ihren Signalwörtern im Überblick.",
      cards: [
        ["Signalwörter Simple Present?", "always, usually, often, sometimes, never, every day"],
        ["Signalwörter Present Progressive?", "now, at the moment, right now, Look!, Listen!"],
        ["Signalwörter Simple Past?", "yesterday, last week, ago, in 1999, when I was a child"],
        ["Signalwörter Present Perfect?", "just, already, yet, ever, never, since, for, so far"],
        ["Bildung Present Perfect?", "have/has + Partizip II (past participle)"],
        ["Signalwörter Past Progressive?", "while, as, when (bei gleichzeitigen Handlungen in der Vergangenheit)"],
        ["Bildung des Simple Past bei regelmäßigen Verben?", "Infinitiv + ed, z. B. play → played"],
        ["Was ist ein Conditional Typ 1?", "If + Simple Present, will + Infinitiv – reale Möglichkeit in der Zukunft."],
      ],
    },
    {
      title: "Zellbiologie Vokabeln",
      subject: "Biologie",
      grade: 7,
      description: "Begriffe zu Zellaufbau und Photosynthese.",
      cards: [
        ["Was macht der Zellkern?", "Er enthält die DNA und steuert alle Vorgänge der Zelle."],
        ["Was sind Mitochondrien?", "'Kraftwerke der Zelle', Ort der Zellatmung zur Energiegewinnung."],
        ["Was ist Chlorophyll?", "Der grüne Farbstoff in Chloroplasten, der Lichtenergie für die Photosynthese aufnimmt."],
        ["Was ist die Funktion der Zellwand?", "Gibt Pflanzenzellen Stabilität und Form."],
        ["Was entsteht bei der Photosynthese?", "Traubenzucker (Glukose) und Sauerstoff."],
        ["Welche 'Rohstoffe' braucht die Photosynthese?", "Kohlenstoffdioxid, Wasser und Lichtenergie."],
        ["Was ist die Zellmembran?", "Die äußere Hülle der Zelle, reguliert den Stoffaustausch."],
        ["Was ist eine Vakuole?", "Ein Speicherorganell für Wasser und Stoffe, reguliert den Zelldruck."],
      ],
    },
    {
      title: "Chemie Grundbegriffe",
      subject: "Chemie",
      grade: 8,
      description: "PSE, Reaktionen und Massenerhaltung auf einen Blick.",
      cards: [
        ["Was gibt die Ordnungszahl an?", "Die Anzahl der Protonen im Atomkern."],
        ["Was sind Edelgase?", "Elemente der 8. Hauptgruppe, sehr reaktionsträge wegen voller Außenschale."],
        ["Was besagt das Gesetz der Massenerhaltung?", "Die Masse der Edukte entspricht der Masse der Produkte bei einer Reaktion."],
        ["Was sind Edukte?", "Die Ausgangsstoffe einer chemischen Reaktion."],
        ["Was sind Produkte?", "Die entstehenden Stoffe einer chemischen Reaktion."],
        ["Was bedeutet 'exotherm'?", "Bei der Reaktion wird Energie (meist Wärme) frei."],
        ["Was bedeutet 'endotherm'?", "Die Reaktion benötigt/nimmt Energie auf."],
        ["Was sind Halogene?", "Elemente der 7. Hauptgruppe, sehr reaktionsfreudig, z. B. Fluor, Chlor."],
      ],
    },
    {
      title: "Physik Formeln & Begriffe",
      subject: "Physik",
      grade: 9,
      description: "Mechanik und Elektrizität kompakt zusammengefasst.",
      cards: [
        ["Formel: Kraft", "F = m · a"],
        ["Was besagt das 1. Newtonsche Gesetz?", "Ein Körper bleibt in Ruhe oder gleichförmiger Bewegung, solange keine Kraft wirkt (Trägheitsprinzip)."],
        ["Was besagt 'actio = reactio'?", "Zu jeder Kraft gibt es eine gleich große Gegenkraft (3. Newtonsches Gesetz)."],
        ["Wie verhält sich der Strom in der Reihenschaltung?", "Überall gleich groß."],
        ["Wie verhält sich die Spannung in der Parallelschaltung?", "Überall gleich groß."],
        ["Formel Gesamtwiderstand Reihenschaltung?", "R = R₁ + R₂ + …"],
        ["Formel Gesamtwiderstand Parallelschaltung?", "1/R = 1/R₁ + 1/R₂ + …"],
        ["Einheit der Kraft?", "Newton (N)"],
      ],
    },
    {
      title: "Wichtige Daten der Geschichte",
      subject: "Geschichte",
      grade: 9,
      description: "Zentrale Jahreszahlen zur Französischen Revolution und dem Kalten Krieg.",
      cards: [
        ["Sturm auf die Bastille?", "14. Juli 1789"],
        ["Erklärung der Menschen- und Bürgerrechte?", "26. August 1789"],
        ["Hinrichtung Ludwigs XVI.?", "1793"],
        ["Leitspruch der Französischen Revolution?", "Liberté, Égalité, Fraternité"],
        ["Bau der Berliner Mauer?", "1961"],
        ["Fall der Berliner Mauer?", "1989"],
        ["Kubakrise?", "1962"],
        ["Auflösung der Sowjetunion?", "1991"],
      ],
    },
    {
      title: "Geographie Grundbegriffe",
      subject: "Geographie",
      grade: 7,
      description: "Wasserkreislauf und Plattentektonik im Überblick.",
      cards: [
        ["Was ist Evaporation?", "Die Verdunstung von Wasser, z. B. aus Meeren und Seen."],
        ["Was ist Kondensation?", "Wasserdampf wird in der Höhe wieder zu Tröpfchen – Wolken entstehen."],
        ["Was ist Transpiration?", "Die Wasserabgabe von Pflanzen über ihre Blätter."],
        ["Was passiert an divergierenden Plattenrändern?", "Platten bewegen sich voneinander weg, neuer Ozeanboden entsteht."],
        ["Was ist Subduktion?", "Eine Platte wird an einem konvergierenden Rand unter eine andere gedrückt."],
        ["Was ist das Epizentrum?", "Der Punkt an der Erdoberfläche direkt über dem Ursprung eines Erdbebens."],
        ["Was ist der Pazifische Feuerring?", "Die Zone um den Pazifik mit den meisten Vulkanen und Erdbeben weltweit."],
        ["Wie bewegen sich Platten bei Transformstörungen?", "Sie gleiten aneinander vorbei."],
      ],
    },
  ];

  const createdSets: Record<string, string> = {};
  for (const s of sets) {
    const existing = await db.flashcardSet.findFirst({ where: { title: s.title } });
    const set =
      existing ??
      (await db.flashcardSet.create({
        data: {
          title: s.title,
          description: s.description,
          grade: s.grade,
          subjectId: subjects[s.subject].id,
          authorId: demo.id,
        },
      }));
    createdSets[s.title] = set.id;

    const cardCount = await db.flashcard.count({ where: { setId: set.id } });
    if (cardCount === 0) {
      await db.flashcard.createMany({
        data: s.cards.map(([front, back], i) => ({ setId: set.id, front, back, order: i })),
      });
    }
  }

  // --- Quizzes -------------------------------------------------------------
  type QuizSeed = {
    title: string;
    subject: string;
    grade: number;
    description: string;
    questions: { text: string; explanation: string; choices: [string, boolean][] }[];
  };

  const quizzes: QuizSeed[] = [
    {
      title: "Lineare Gleichungen & Pythagoras-Quiz",
      subject: "Mathematik",
      grade: 8,
      description: "Teste dein Wissen über Gleichungen und rechtwinklige Dreiecke.",
      questions: [
        {
          text: "Löse: 2x + 4 = 14",
          explanation: "2x = 10 → x = 5",
          choices: [["x = 5", true], ["x = 9", false], ["x = 4", false], ["x = 7", false]],
        },
        {
          text: "Wie heißt die längste Seite in einem rechtwinkligen Dreieck?",
          explanation: "Die Hypotenuse liegt dem rechten Winkel gegenüber und ist immer die längste Seite.",
          choices: [["Kathete", false], ["Hypotenuse", true], ["Normale", false], ["Diagonale", false]],
        },
        {
          text: "a = 6 cm, b = 8 cm. Wie lang ist die Hypotenuse c?",
          explanation: "c² = 6² + 8² = 36 + 64 = 100 → c = 10 cm",
          choices: [["10 cm", true], ["14 cm", false], ["100 cm", false], ["7 cm", false]],
        },
        {
          text: "Was darf man mit einer Gleichung NICHT tun?",
          explanation: "Durch 0 zu teilen ist mathematisch nicht definiert.",
          choices: [["Beide Seiten durch dieselbe Zahl ≠ 0 teilen", false], ["Beide Seiten durch 0 teilen", true], ["Auf beiden Seiten denselben Wert addieren", false], ["Beide Seiten mit -1 multiplizieren", false]],
        },
        {
          text: "Löse: 5x - 3 = 2x + 9",
          explanation: "3x = 12 → x = 4",
          choices: [["x = 4", true], ["x = 2", false], ["x = 6", false], ["x = 3", false]],
        },
      ],
    },
    {
      title: "Grammatik-Check: Aktiv, Passiv & mehr",
      subject: "Deutsch",
      grade: 7,
      description: "Prüfe dein Verständnis von Aktiv- und Passivsätzen.",
      questions: [
        {
          text: "Welcher Satz ist im Passiv?",
          explanation: "'wird...gebaut' ist die klassische Passivkonstruktion (werden + Partizip II).",
          choices: [["Der Maurer baut das Haus.", false], ["Das Haus wird vom Maurer gebaut.", true], ["Der Maurer hat das Haus gebaut.", false], ["Das Haus steht auf dem Grundstück.", false]],
        },
        {
          text: "Wie wird das Passiv gebildet?",
          explanation: "Die Passivform wird immer mit 'werden' + Partizip II gebildet.",
          choices: [["sein + Partizip II", false], ["werden + Partizip II", true], ["haben + Infinitiv", false], ["werden + Infinitiv", false]],
        },
        {
          text: "Wandle 'Die Katze jagt die Maus' ins Passiv um.",
          explanation: "Das Akkusativobjekt 'die Maus' wird zum Subjekt.",
          choices: [["Die Maus wird von der Katze gejagt.", true], ["Die Katze wird von der Maus gejagt.", false], ["Die Maus jagt die Katze.", false], ["Die Katze jagt wird Maus.", false]],
        },
        {
          text: "Was ist typisch für die Verwendung des Passivs?",
          explanation: "Im Passiv tritt der Handelnde in den Hintergrund oder wird ganz weggelassen.",
          choices: [["Der Handelnde steht im Vordergrund.", false], ["Der Handelnde tritt in den Hintergrund oder fehlt.", true], ["Es gibt kein Subjekt im Satz.", false], ["Es wird kein Verb benötigt.", false]],
        },
      ],
    },
    {
      title: "English Tenses Quiz",
      subject: "Englisch",
      grade: 8,
      description: "Simple Past, Present Perfect und Conditionals im Test.",
      questions: [
        {
          text: "Complete: 'I ___ London last year.'",
          explanation: "'last year' is a Simple Past signal word.",
          choices: [["visited", true], ["have visited", false], ["visit", false], ["was visiting", false]],
        },
        {
          text: "Complete: 'She ___ already finished her homework.'",
          explanation: "'already' is a Present Perfect signal word.",
          choices: [["has", true], ["have", false], ["did", false], ["is", false]],
        },
        {
          text: "Which conditional type describes a real future possibility?",
          explanation: "Type 1 uses Simple Present + will and describes something that could really happen.",
          choices: [["Type 1", true], ["Type 2", false], ["Type 3", false], ["Zero conditional", false]],
        },
        {
          text: "Complete Type 2: 'If I ___ you, I would apologize.'",
          explanation: "In Type 2 conditionals, 'to be' is always 'were', even with I/he/she/it.",
          choices: [["were", true], ["was", false], ["am", false], ["be", false]],
        },
        {
          text: "What signals a Present Perfect sentence?",
          explanation: "'yet', 'just', 'already', 'ever', 'never' are typical Present Perfect signal words.",
          choices: [["yesterday", false], ["yet", true], ["ago", false], ["when I was young", false]],
        },
      ],
    },
    {
      title: "Zelle & Photosynthese Quiz",
      subject: "Biologie",
      grade: 7,
      description: "Grundwissen zu Zellaufbau und Photosynthese testen.",
      questions: [
        {
          text: "Welches Organell gilt als 'Kraftwerk der Zelle'?",
          explanation: "Mitochondrien gewinnen durch Zellatmung Energie (ATP) für die Zelle.",
          choices: [["Zellkern", false], ["Mitochondrien", true], ["Vakuole", false], ["Ribosom", false]],
        },
        {
          text: "Was entsteht NICHT bei der Photosynthese?",
          explanation: "Kohlenstoffdioxid ist ein Ausgangsstoff (Edukt), kein Produkt der Photosynthese.",
          choices: [["Traubenzucker", false], ["Sauerstoff", false], ["Kohlenstoffdioxid", true], ["Energie in Form von Zucker", false]],
        },
        {
          text: "Welches Organell kommt NUR in Pflanzenzellen vor?",
          explanation: "Chloroplasten sind der Ort der Photosynthese und nur in Pflanzenzellen vorhanden.",
          choices: [["Zellmembran", false], ["Chloroplasten", true], ["Zellkern", false], ["Mitochondrien", false]],
        },
        {
          text: "Was enthält den grünen Farbstoff für die Photosynthese?",
          explanation: "Chlorophyll absorbiert Lichtenergie und befindet sich in den Chloroplasten.",
          choices: [["Chlorophyll", true], ["Zellwand", false], ["Zytoplasma", false], ["Zellmembran", false]],
        },
      ],
    },
    {
      title: "Chemie Basics Quiz",
      subject: "Chemie",
      grade: 8,
      description: "Periodensystem, Reaktionen und Massenerhaltung im Test.",
      questions: [
        {
          text: "Was gibt die Ordnungszahl eines Elements an?",
          explanation: "Die Ordnungszahl entspricht der Protonenzahl im Atomkern.",
          choices: [["Anzahl der Neutronen", false], ["Anzahl der Protonen", true], ["Anzahl der Elektronenschalen", false], ["Die Masse in Gramm", false]],
        },
        {
          text: "Welche Elementgruppe ist am reaktionsträgsten?",
          explanation: "Edelgase haben eine volle Außenschale und reagieren daher kaum.",
          choices: [["Alkalimetalle", false], ["Halogene", false], ["Edelgase", true], ["Erdalkalimetalle", false]],
        },
        {
          text: "Was besagt das Gesetz der Erhaltung der Masse?",
          explanation: "Die Gesamtmasse bleibt bei chemischen Reaktionen konstant – Edukte und Produkte wiegen gleich viel.",
          choices: [["Masse kann bei Reaktionen verschwinden", false], ["Masse der Edukte = Masse der Produkte", true], ["Nur die Energie bleibt erhalten", false], ["Masse entsteht bei Reaktionen neu", false]],
        },
        {
          text: "Gleiche aus: N₂ + H₂ → NH₃. Welche Koeffizienten sind richtig?",
          explanation: "N₂ + 3 H₂ → 2 NH₃ ergibt auf beiden Seiten 2 Stickstoff- und 6 Wasserstoffatome.",
          choices: [["N₂ + 3 H₂ → 2 NH₃", true], ["N₂ + H₂ → NH₃", false], ["2 N₂ + H₂ → NH₃", false], ["N₂ + 2 H₂ → NH₃", false]],
        },
      ],
    },
    {
      title: "Mechanik & Elektrizität Quiz",
      subject: "Physik",
      grade: 9,
      description: "Newtonsche Gesetze und Stromkreise im Überblick.",
      questions: [
        {
          text: "F = m · a — welches Gesetz beschreibt diese Formel?",
          explanation: "Das 2. Newtonsche Gesetz (Aktionsprinzip) beschreibt den Zusammenhang von Kraft, Masse und Beschleunigung.",
          choices: [["1. Newtonsches Gesetz", false], ["2. Newtonsches Gesetz", true], ["3. Newtonsches Gesetz", false], ["Gesetz der Energieerhaltung", false]],
        },
        {
          text: "Wie verhält sich die Stromstärke in einer Reihenschaltung?",
          explanation: "In der Reihenschaltung gibt es nur einen Strompfad, die Stromstärke ist überall gleich.",
          choices: [["Sie ist überall gleich.", true], ["Sie teilt sich auf.", false], ["Sie wird größer.", false], ["Sie ist null.", false]],
        },
        {
          text: "Was besagt 'actio = reactio'?",
          explanation: "Das 3. Newtonsche Gesetz: zu jeder Kraft gibt es eine gleich große Gegenkraft.",
          choices: [["Kraft = Masse · Beschleunigung", false], ["Jede Kraft hat eine gleich große Gegenkraft.", true], ["Körper ohne Kraft bleiben in Ruhe.", false], ["Energie kann nicht verschwinden.", false]],
        },
        {
          text: "Zwei Widerstände (je 6 Ω) in Reihe – wie groß ist der Gesamtwiderstand?",
          explanation: "In Reihenschaltung werden die Widerstände addiert: 6 + 6 = 12 Ω.",
          choices: [["3 Ω", false], ["6 Ω", false], ["12 Ω", true], ["36 Ω", false]],
        },
      ],
    },
    {
      title: "Geschichte Quiz: Revolution & Kalter Krieg",
      subject: "Geschichte",
      grade: 9,
      description: "Teste dein Wissen über die Französische Revolution und den Kalten Krieg.",
      questions: [
        {
          text: "Wann war der Sturm auf die Bastille?",
          explanation: "Der 14. Juli 1789 gilt als symbolischer Beginn der Französischen Revolution.",
          choices: [["14. Juli 1789", true], ["4. Juli 1776", false], ["26. August 1789", false], ["1. Januar 1792", false]],
        },
        {
          text: "Welcher Stand trug in Frankreich vor 1789 die Hauptsteuerlast?",
          explanation: "Der 3. Stand (Bürger, Bauern, Arbeiter) zahlte fast alle Steuern, während Adel und Klerus privilegiert waren.",
          choices: [["1. Stand (Klerus)", false], ["2. Stand (Adel)", false], ["3. Stand", true], ["Der König selbst", false]],
        },
        {
          text: "Was bedeutet 'Kalter Krieg'?",
          explanation: "Konfrontation zwischen USA und UdSSR ohne direkten militärischen Krieg zwischen den beiden Supermächten.",
          choices: [["Ein Krieg bei extremer Kälte", false], ["Konfrontation ohne direkten Krieg zwischen USA und UdSSR", true], ["Der 2. Weltkrieg", false], ["Ein Krieg in der Arktis", false]],
        },
        {
          text: "Wann fiel die Berliner Mauer?",
          explanation: "Am 9. November 1989 fiel die Berliner Mauer, 1990 folgte die Wiedervereinigung.",
          choices: [["1961", false], ["1989", true], ["1991", false], ["1949", false]],
        },
      ],
    },
    {
      title: "Erde & Klima Quiz",
      subject: "Geographie",
      grade: 7,
      description: "Wasserkreislauf und Plattentektonik im Test.",
      questions: [
        {
          text: "In welcher Reihenfolge laufen die Prozesse im Wasserkreislauf ab?",
          explanation: "Wasser verdunstet zuerst, kondensiert dann zu Wolken und fällt schließlich als Niederschlag.",
          choices: [["Verdunstung → Kondensation → Niederschlag", true], ["Niederschlag → Verdunstung → Kondensation", false], ["Kondensation → Niederschlag → Verdunstung", false], ["Niederschlag → Kondensation → Verdunstung", false]],
        },
        {
          text: "Was passiert an konvergierenden Plattenrändern?",
          explanation: "Bei der Subduktion wird eine Platte unter eine andere gedrückt – oft entstehen dabei Gebirge.",
          choices: [["Platten entfernen sich voneinander.", false], ["Eine Platte wird unter die andere gedrückt.", true], ["Platten gleiten nur aneinander vorbei.", false], ["Es passiert gar nichts.", false]],
        },
        {
          text: "Wo liegt der Pazifische Feuerring?",
          explanation: "Er umrahmt den Pazifischen Ozean und ist die Zone mit den meisten Vulkanen und Erdbeben weltweit.",
          choices: [["Rund um die Antarktis", false], ["Rund um den Pazifischen Ozean", true], ["Rund um das Mittelmeer", false], ["Rund um den Atlantik", false]],
        },
        {
          text: "Wie nennt man die Wasserabgabe von Pflanzen über die Blätter?",
          explanation: "Transpiration beschreibt die Wasserabgabe von Pflanzen an die Atmosphäre.",
          choices: [["Kondensation", false], ["Transpiration", true], ["Subduktion", false], ["Infiltration", false]],
        },
      ],
    },
  ];

  for (const qz of quizzes) {
    const existing = await db.quiz.findFirst({ where: { title: qz.title } });
    const quiz =
      existing ??
      (await db.quiz.create({
        data: {
          title: qz.title,
          description: qz.description,
          grade: qz.grade,
          subjectId: subjects[qz.subject].id,
          authorId: demo.id,
        },
      }));

    const qCount = await db.question.count({ where: { quizId: quiz.id } });
    if (qCount === 0) {
      for (let i = 0; i < qz.questions.length; i++) {
        const q = qz.questions[i];
        const question = await db.question.create({
          data: {
            quizId: quiz.id,
            text: q.text,
            explanation: q.explanation,
            order: i,
          },
        });
        await db.choice.createMany({
          data: q.choices.map(([text, correct], j) => ({
            questionId: question.id,
            text,
            correct,
            order: j,
          })),
        });
      }
    }
  }

  // --- Demo progress for the demo user -----------------------------------
  const firstFewContents = await db.content.findMany({ take: 5 });
  for (const c of firstFewContents.slice(0, 3)) {
    await db.contentProgress.upsert({
      where: { userId_contentId: { userId: demo.id, contentId: c.id } },
      update: { completed: true },
      create: { userId: demo.id, contentId: c.id, completed: true },
    });
  }
  await db.bookmark.upsert({
    where: { userId_contentId: { userId: demo.id, contentId: firstFewContents[0].id } },
    update: {},
    create: { userId: demo.id, contentId: firstFewContents[0].id },
  });

  const mathSet = await db.flashcardSet.findFirst({ where: { title: "Algebra-Grundbegriffe" }, include: { cards: true } });
  if (mathSet) {
    for (const card of mathSet.cards.slice(0, 4)) {
      await db.cardProgress.upsert({
        where: { userId_cardId: { userId: demo.id, cardId: card.id } },
        update: {},
        create: { userId: demo.id, cardId: card.id, box: 2, interval: 1, reps: 1, dueAt: new Date() },
      });
    }
  }

  const mathQuiz = await db.quiz.findFirst({ where: { title: "Lineare Gleichungen & Pythagoras-Quiz" } });
  if (mathQuiz) {
    const attemptExists = await db.quizAttempt.findFirst({ where: { userId: demo.id, quizId: mathQuiz.id } });
    if (!attemptExists) {
      await db.quizAttempt.create({
        data: { userId: demo.id, quizId: mathQuiz.id, score: 4, total: 5 },
      });
    }
  }

  console.log("Seed complete. Demo-Login: demo@lernio.de / lernen123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
