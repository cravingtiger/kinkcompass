---
title: KinkCompass — Spezifikation
stand: 2026-09-27
status: abgestimmt, noch nicht umgesetzt
---

# KinkCompass — Spezifikation

Zweisprachiger, vollständig lokal laufender Fragebogen für Neigungen und Grenzen,
mit maschinell auswertbarem Export, Re-Import und Vergleich zweier Profile.

## 1. Ausgangsmaterial

| Quelle | Inhalt |
|---|---|
| `Umfassende BDSM- und Kink-Checkliste für einwilligende Erwachsene.md` | 1333 Items, 44 Sektionen, keine Erklärungen, 10 Sicherheitshinweise, 18 Quellen |
| `Neigungs- und Grenzenliste (2).html` | Vorgängertool, 315 Items, 13 Sektionen, **Erklärung pro Item**, 114 aktiv/passiv-Flags, 8er-Skala, Export/Import, Druckansicht |

Nur 32 Labels stimmen wörtlich überein; thematische Überlappung ist groß, aber
unterschiedlich formuliert.

### Item-Bestand

Markdown-Liste als Gerüst, dazu die Sektionen, die ihr fehlen:

- Sexuelle Orientierung (26), Romantische Orientierung (16), Geschlechterbezogene Präferenzen (11)
- 12 Freitextfelder „Grenzen, Gesundheit und Notizen"
- Toys- und Ausrüstungsliste (freie Einträge)
- **Fünf neue Sektionen des Rahmen- und Sicherheitsteils** (§ 3), 68 Items

Wo ein Eintrag des Vorgängertools ein Item der Markdown-Liste trifft, werden
**Erklärung und aktiv/passiv-Flag übernommen**. Ergebnis: **1529 Items in 57 Sektionen**,
1175 davon rollengetrennt.

### Befundete Lücken der Quelle

Geprüft, nicht vermutet:

1. **SSC/RACK/PRICK erscheint ausschließlich als Prosa-Fußnote**, nicht als Frage.
   Unterschiedliche Risikomodelle bleiben dadurch unvergleichbar, obwohl sie
   bestimmen, wie Hochrisiko-Praktiken überhaupt verhandelt werden.
2. **Die Wort-Whitelist wird zweimal referenziert, existiert aber nicht.** Die Items
   „Degradierende Anrede nach Wort-Whitelist" und „Beschimpfung nach Wort-Whitelist"
   verweisen auf ein Dokument, für das es kein Feld gibt.
3. **Reale Abhängigkeit ist kein Item.** „Ausnutzung von Abhängigkeit" kommt genau
   einmal vor — als Disclaimer unter FinDom. Gleichzeitig enthält die Liste
   24/7-Dynamik, Total Power Exchange, Slave, Property, Owner und FinDom. Die
   Fähigkeit, nein zu sagen, hängt an der materiellen Möglichkeit zu gehen; ohne
   diese Angaben misst der Bogen Konsens ohne seine Voraussetzung.
4. **Herabsetzung ist inhaltlich, nicht qualitativ erfasst.** „Beschimpfung" und
   „Feminisierung" stehen als Items drin, ohne Stelle für die entscheidende
   Unterscheidung: Aufwertung oder Herabsetzung, welche Kategorien überhaupt,
   welche Worte nie.

### Entfernte Punkte

Drei Punkte aus § 3.2 sind nach Rückmeldung entfernt worden, weil sie unbestimmt
waren: *Nachweisbare Fachkunde bei Hochrisiko-Praktiken verlangt* (ließ offen, von
wem), *Eigene Recherche vor jeder neuen Praktik* (geht in „Bereitschaft, bei
Unsicherheit abzubrechen" auf) und *Praktiken mit konkreter Todesgefahr
ausgeschlossen* (als persönliche Vereinbarung zu vage; die Rechtslage steht in den
Sektionshinweisen zu Hochrisiko). Dazu die neun relationalen Punkte aus § 3.3.
Alle zwölf stehen in `data/entfernte-items.md`, siehe § 6b.

### Bewusste Auslassungen

Items der Quelle werden nie stillschweigend weggelassen. Eine Auslassung braucht im
Kuratierungsformat eine `DROP`-Zeile mit Begründung und erscheint im Datensatz sowie
im Durchsichtsbericht. Bislang zwei Fälle: „Vollständige Nüchternheit als feste
Bedingung" und „Keine Szene bei eingeschränkter Einwilligungsfähigkeit" aus *Schlaf,
Bewusstsein und Subspace* sind wörtlich identisch mit zwei Items aus § 3.2 und wären
doppelt abgefragt worden.

## 2. Bewertungsmodell

Fünf **unabhängige** Achsen pro Item. Die Trennung ist der Kern des Modells:
das Vorgängertool hatte Strafe, Fantasie und Erfahrung in die Skala hineingemischt,
wodurch reale Kombinationen nicht ausdrückbar waren.

### 2.1 Wunsch-Skala (eine Stufe)

| Code | Label | Bedeutung |
|---|---|---|
| `must` | Must-have | Brauche ich, damit es für mich stimmt |
| `neigung` | Neigung / Belohnung | Mag ich, wirkt belohnend, gern regelmäßig |
| `sehnsucht` | Sehnsucht | Starkes Verlangen |
| `interessant` | Interessant | Neugier vorhanden |
| `neutral` | Neutral / egal | Weder Wunsch noch Ablehnung |
| `soft` | Soft Limit | Nur unter Bedingungen, mit Vorsicht oder in Andeutung |
| `hard` | Hard Limit | Absolute Grenze, kommt nicht in Frage |
| `na` | Keine Angabe | Möchte ich nicht beantworten |

### 2.2 Strafe-Achse (eine Stufe, rollengetrennt)

**Die Achse bedeutet je nach Rolle Verschiedenes**, und das muss dastehen. Die
Beschreibungen waren zunächst ausschließlich aus Sicht der empfangenden Seite
geschrieben („unangenehm, aber erregend"), sodass auf der ausführenden Seite unklar
blieb, was gefragt ist. Die Zeilen heißen jetzt **Strafe verhängen** und **Strafe
erhalten**, und beide Stufen tragen eine eigene Beschreibung je Seite.

| Code | Label | Bedeutung |
|---|---|---|
| `-` | nicht als Strafe | nicht als Konsequenz vorgesehen |
| `reizvoll` | als Strafe reizvoll | unangenehm, aber erregend; wirkt **nicht** abschreckend |
| `echt` | echte Strafe | wirklich unangenehm, keine Erregung, ausdrücklich erlaubt |

`echt` ist keine Vorliebe, sondern eine **Erlaubnis**. Der typische und vorher nicht
ausdrückbare Fall ist `soft` + `echt`: „will ich nicht, und genau deshalb wirkt es."

**Hard Limit sperrt `echt`.** Die Kombination lässt das Tool nicht zu.

### 2.3 Erfahrung (eine Stufe, rollengetrennt wo das Item rollengetrennt ist)

`keine` · `einmal` · `gelegentlich` · `viel`

Vollständig unabhängig vom Wunsch. „Hard Limit, aber erlebt" und „Must-have, nie
probiert" sind beide gültige und aussagekräftige Angaben.

### 2.4 Fantasie-Schalter

Ein Ja/Nein pro Item: *nur Fantasie, keine Umsetzung gewünscht.* Entspricht dem
Code `F` der Markdown-Quelle.

### 2.5 Priorität und Rangfolge

**Kein Zahlenwert, kein Slider.** Absolute Intensitätsurteile pro Item sind nicht
zuverlässig leistbar; die Skala trägt die Stärke bereits ordinal. Die Gewichtung
entsteht stattdessen **relativ, durch Vergleich** — Menschen können „lieber A als B"
zuverlässig beantworten, „A ist eine 4" nicht.

Zweistufig:

1. **Stern beim Bewerten** — ein Tastendruck, markiert was heraussticht. Der Stern
   ist zugleich der **Kandidatenpool** für die Rangfolge.
2. **Prioritätenansicht mit Drag & Drop** — alle gesternten Einträge werden dort in
   eine Reihenfolge gezogen.

Der Stern als Pool ist keine Bequemlichkeit, sondern Notwendigkeit: bei 1529 Items
landen 200–400 in den positiven Buckets, und das sortiert niemand von Hand. Gesternt
werden typisch 20–40 Einträge, und die sind ziehbar.

**Sortiert werden Item-Rollen-Paare, nicht Items.** „Fesseln empfangen" kann Rang 1
sein und „Fesseln geben" Rang 17 — genau das ist der Sinn der Rollentrennung.

**Zwei Reichweiten:**

- **Globale Rangliste** über alle Sektionen hinweg — die eigentliche Aussage
  „was ist mir am wichtigsten". Sie steht im Export **vor allen Sektionen**: wer das
  Profil liest, beginnt mit den wichtigsten fünf, nicht mit Sektion 1 von 44.
- **Feinsortierung je Sektion** innerhalb eines Buckets, optional, Standard
  unsortiert — für Sektionen, in denen die Reihenfolge eine eigene Aussage hat.

**Drag & Drop ist nie der einzige Weg.** Jede Zeile hat zusätzlich Tasten für
hoch, runter, an den Anfang und an das Ende. Ziehen ist auf Touchgeräten und per
Tastatur unzuverlässig; eine Rangfolge darf nicht am Eingabegerät hängen.

Ein Rang ist immer freiwillig. Ungeordnete gesternte Einträge erscheinen als
*gesternt, ohne Rang* und gelten nicht als unwichtiger.

## 3. Rahmen- und Sicherheitsteil

Sicherheitsvereinbarungen sind **keine Vorlieben**. „Safeword: Neigung" ist
bedeutungslos, „Keine Sanktion für Safeword: Interessant" ebenso. Sie gehören
deshalb nicht auf die Wunsch-Skala.

### 3.1 Vereinbarungs-Skala

| Code | Label | Bedeutung |
|---|---|---|
| `verbindlich` | verbindlich | Bedingung, ohne die nichts stattfindet |
| `gewuenscht` | gewünscht | Möchte ich, aber nicht als Bedingung |
| `verhandelbar` | verhandelbar | Offen, je nach Gegenüber und Situation |
| `ablehnend` | lehne ich ab | Will ich nicht |

**Ausgenommen von Vererbung und von „nicht relevant".** Der Rahmen- und
Sicherheitsteil kann nicht durch eine Bewertung auf höherer Ebene mitbestimmt und
nicht als Zweig übersprungen werden. Ohne diese Ausnahme ließe sich der gesamte
Sicherheitsteil mit einem Klick wegräumen — die Vererbung aus § 5 macht das sonst
zum leichtesten Weg durch den Fragebogen.

Die bestehende Sektion „Sicherheit, Verhandlung und Grenzen" (36 Items: Safeword,
Ampelsystem, nonverbales Abbruchsignal, Check-ins, Notfallkontakt, Lösewerkzeug,
Safe Call, Nüchternheit, Widerruf ohne Rechtfertigungszwang, keine Sanktion für
Abbruch, Zustimmung am Folgetag prüfen) wechselt auf diese Skala.

### 3.2 Risikomodell und Haltung

Behebt Lücke 1. Das Leitmodell ist eine Einzelauswahl, nicht eine Skala.

**Jede Option wird erklärt**, in beiden Sprachen — ein Name ohne Inhalt hilft
niemandem bei der Wahl, und der Vergleich meldet sonst einen Unterschied, den man
nicht deuten kann:

| Modell | Kern |
|---|---|
| **SSC** | Die älteste Formel: sicher, bei klarem Verstand, einvernehmlich. Kritik: „sicher" und „vernünftig" sind Urteile von außen. |
| **RACK** | Die Antwort darauf: nicht sicher, sondern das Risiko **bekannt, benannt und bewusst getragen**. |
| **PRICK** | Wie RACK, plus Eigenverantwortung jeder Person — auch der folgenden Seite. |
| **CCC** | Stellt die Beziehung über die Szene: Verbindlichkeit und Fürsorge gelten danach weiter. |

Beschreibungen gibt es für alle sieben Antwortsätze. Sie erscheinen unter dem Item
und gesammelt in der **Skalen-Legende** (Knopf „Skala"), die auch Wunsch-Skala,
Strafe-Achse, Erfahrung und Vereinbarungs-Skala erklärt. Die Standard-Skalen werden
nur dort erklärt, nicht unter jeder Zeile.

- **Leitmodell:** SSC · RACK · PRICK · CCC · eigenes Modell (Freitext)
- Vollständige Nüchternheit als Bedingung
- Keine Szene bei eingeschränkter Einwilligungsfähigkeit
- Erste-Hilfe-Kenntnisse vorhanden
- Bereitschaft, bei Unsicherheit sofort abzubrechen
- Fehler in der Szene: sofortiger Abbruch und Debrief
- Sichtbare Spuren: nie · nur vereinbart · unproblematisch
- Bleibende Spuren: nie · nur ausdrücklich vereinbart

### 3.3 Absicherung bei starker Machtabgabe

Behebt Lücke 3 — in korrigierter Form.

**Korrektur vom 2026-09-27.** Die Sektion enthielt ursprünglich neun *Angaben zur
Situation* („Wirtschaftliche Abhängigkeit **voneinander**", „Gemeinsame Wohnung",
„Arbeitsverhältnis **zueinander**"). Das war ein Konstruktionsfehler: der Bogen gilt
für **eine Person** und wird an verschiedene Menschen gegeben; eine Eigenschaft eines
Paares hat darin keinen definierten Bezug. Die neun Punkte sind entfernt.

Geblieben ist, was als **persönliche Bedingung** lesbar ist: *Was brauchst du,
bevor du dich auf eine weitreichende Machtabgabe einlässt?* Diese Frage gilt
unabhängig davon, mit wem.

**Vereinbarungen** (Vereinbarungs-Skala):

- Ansprechperson außerhalb der Dynamik
- Schriftlicher Ausstiegsplan, bevor eine dauerhafte Dynamik beginnt
- Befristung der Dynamik oder fester Überprüfungstermin
- Eigene finanzielle Unabhängigkeit bleibt gewahrt
- Eigene Wohnmöglichkeit unabhängig von der Dynamik
- Verhandlung nur in nüchternem, unbelastetem Zustand
- Kein Machtgefälle während der Verhandlung selbst

### 3.4 Sprache und Wort-Whitelist

Behebt Lücke 2 und 4. Die Listen sind Freitext und werden im Vergleich geschnitten.

**Listen:**

- **Belohnende Ansprache** — Worte, die anerkennen und guttun
- **Herabsetzende Ansprache** — Worte, die treffen sollen und dafür freigegeben sind
- **Absolut ausgeschlossene Worte** — kommen nie vor, in keinem Zusammenhang

Ursprünglich war das *eine* Liste „erlaubte Worte". Das warf zwei Gegenteile
zusammen: „Prinzessin" und „Schlampe" können beide freigegeben sein und meinen
Verschiedenes. Die Teilung ist die Voraussetzung für § 9.4.

Die Listen sind **nicht rollengetrennt**. *Welche* Worte steht hier, *in welche
Richtung* steht rollengetrennt bei „Beschimpfung nach Wort-Whitelist" in
*Verbale Dominanz und Demütigung*.

**Kategorien** (nie · nur nach Whitelist · offen):

- Sexistische Herabsetzung
- Rassistische oder ethnisch bezogene Herabsetzung
- Herabsetzung mit Bezug auf Herkunft oder Sprache
- Körper- und gewichtsbezogene Herabsetzung
- Behinderungs- oder krankheitsbezogene Herabsetzung
- Herabsetzung mit Bezug auf Gender oder Orientierung
- Herabsetzung mit Bezug auf Religion
- Intelligenz- und leistungsbezogene Herabsetzung
- Sexuelle Herabsetzung

**Geltung** (Vereinbarungs-Skala):

- Gilt ausschließlich innerhalb der Szene, nie außerhalb
- Worte nur nach vorheriger ausdrücklicher Freigabe ergänzen
- Abbruch bei nicht freigegebenem Wort, ohne Diskussion

### 3.5 Gesundheit, Daten und Selbstbestimmung

Gegenstück zum Themenbereich *Lifecoaching, Überwachung und Gesundheit* (§ 3.7).
Gesundheitsbezogene Kontrolle ist die riskanteste Ergänzung der Liste — nicht weil
sie intensiv wäre, sondern weil der Schaden langsam entsteht und von außen schwer
zu erkennen ist. Zwei konkrete Wege: Ernährungs- und Gewichtskontrolle in einer
D/s-Dynamik kann eine Essstörung verstärken oder verdecken, und die Dynamik liefert
die Rechtfertigung mit; gemeldete Werte wie Blutdruck oder Blutzucker ersetzen keine
ärztliche Behandlung und können sie verzögern.

Deshalb 13 Vereinbarungen, die weder vererbt noch übersprungen werden. Sie
erscheinen zusammen mit dem, wogegen sie schützen (§ 6.1): sobald ein Item aus
Lifecoaching, Überwachung oder Körperdaten im Bogen steht, stehen auch sie darin.
Im Einstieg kommt keines dieser Themen vor — dort wären sie dreizehn Fragen über
etwas, das gar nicht stattfindet.

- **Medizinische Zuständigkeit:** Behandlung bleibt ärztlich und ist nicht Teil der
  Dynamik · keine Kontrolle über Medikamente oder Therapie · Gesundheitsziele
  ärztlich rückgekoppelt
- **Grenzwerte und Vorgeschichte:** Untergrenzen für Gewicht und Kalorien ärztlich
  festgelegt · Essstörung in der Vorgeschichte schließt Ernährungs- und
  Gewichtskontrolle aus · Ziele dürfen sinken
- **Umgang mit Messwerten:** Werte werden gemeldet, nicht bewertet oder bestraft ·
  Konsequenzen nur für vereinbartes Verhalten, nie für Zahlen
- **Grenzen der Überwachung:** jederzeit abschaltbar, ohne Begründung und ohne
  Sanktion · Löschfrist für Nachweise · keine Gesundheitsdaten in fremder Cloud ·
  kein Zugriff auf Gesundheits- oder Versicherungskonten
- **Auszeit:** von der Begleitung bei Krankheit oder Belastung

### 3.6 Gender und Alltagsverhältnis

Behebt Lücke 4 auf der Rollenebene.

- **Genderrollen im Spiel:** verstärken · spielerisch umkehren · irrelevant
- **Feminisierung:** als Aufwertung · als Herabsetzung · nicht Teil des Spiels
- **Maskulinisierung:** als Aufwertung · als Herabsetzung · nicht Teil des Spiels
- Diskrepanz zwischen Spieldynamik und Alltag ausdrücklich gewünscht
- Alltag gleichberechtigt, unabhängig von der Szenendynamik
- **Verteilung der Arbeit** (ich · Gegenüber · geteilt · offen), je für:
  Planung und Organisation · Aftercare und emotionale Nacharbeit ·
  Verhandlung und Initiative · Bildung und Recherche
- Rollenbilder, die ich ausdrücklich nicht reproduzieren will (Freitext)

### 3.7 Themenbereich „Lifecoaching, Überwachung und Gesundheit"

Kein Teil von § 3, sondern ein eigener Themenbereich auf der Wunsch-Skala — hier
aufgeführt, weil er ohne § 3.5 nicht ausgeliefert werden sollte. Er schließt eine
Lücke, die die Quelle vollständig offen ließ: *Gooning* kam in 1448 Items kein
einziges Mal vor, Blutdruck und Waage existierten ausschließlich als Requisiten im
Arztrollenspiel, Blutzucker und Schlafdaten gar nicht.

| Sektion | Items | Inhalt |
|---|---|---|
| Lifecoaching und Accountability | 18 | Zielvereinbarung, tägliche Meldung, Wochenrückblick, Streak, Rückfall ohne Beschämung, Nachsicht bei Krankheit |
| Überwachung und Nachweis | 19 | Videoüberwachung in Zeitfenstern, Livebild, Bildschirmfreigabe, Mahlzeiten- und Trainingsfoto, überwachungsfreie Zeiten und Räume |
| Ernährung, Sport und Körperdaten | 20 | Ernährungsprotokoll, Kalorienvorgabe, Trainingsplan, Schrittziel, Gewicht, Blutdruck, Blutzucker, Laborwerte |

Dazu in bestehenden Sektionen: *Pensum und Dauerzustände* in der Lustkontrolle
(8 Items, darunter Gooning, verordnetes Pensum, Mindest- und Höchstfrequenz) und
drei begleitende Rollen (Lifecoach, Coachee, Accountability-Partner).

Laufende Überwachung unterscheidet sich grundlegend von einer Szene: **sie endet
nicht von selbst.** Deshalb stehen die Abschaltbarkeit und die Löschfrist nicht in
dieser Sektion, sondern in § 3.5.

### Manipulation als Spielmittel

Eine eigene Sektion in *Psyche, Sprache und Bewusstsein*, 39 Punkte. Zuvor gab es
dafür nur ein Sammel-Item („Mindfuck"). Die Begriffe folgen der etablierten
Systematik: Zwangskontroll- und Missbrauchsliteratur für Gaslighting, Triangulation,
intermittierende Verstärkung, Hoovering und DARVO; Liftons acht Kriterien der
Gedankenreform für den Gruppenteil (*milieu control*, *loading the language*,
*cult of confession*, *doctrine over person*).

**Warum sie einen eigenen Sicherheitshinweis braucht.** Diese Techniken
unterscheiden sich von jeder anderen Praktik der Liste in einem Punkt:

> Sie richten sich gegen die Fähigkeit, die eigene Lage zu beurteilen. Wer nicht
> bemerkt, dass etwas geschieht, kann kein Safeword sagen.

Ein Safeword reicht hier also nicht. Die Schlussgruppe **Grenzen** ist deshalb
vollständig auf `e` gesetzt und im Einstieg immer sichtbar: Techniken vorher
benennen · Einsatz endet mit der Szene · Debrief nach jeder Szene · Nachwirkung
nach Tagen besprechen · außenstehende Person kennt den Rahmen · Aussetzen bei
Belastung. Der Debrief ist hier der eigentliche Schutz, nicht das Safeword.

Sechs Punkte tragen *Risiko hoch* — Gaslighting, intermittierende Verstärkung,
kontrollierte Informationsumgebung, Beichte mit späterer Verwendung, „die Regel
schlägt das eigene Empfinden" und Abschirmung von außen. Das sind die, die am
stärksten auf die Urteilsfähigkeit selbst zielen.

Die Aufnahme hat einen zweiten Zweck neben der Verhandelbarkeit, und er steht so
im Sektionshinweis: **diese Techniken beim Namen zu kennen, falls sie einem
außerhalb einer Szene begegnen.**

## 4. Rollentrennung

Rollenrelevante Items bekommen **zwei Bewertungen**, nicht-rollenrelevante eine.
Das Flag wird pro Item in der Datendatei gepflegt (`ap`).

- **Top** = du führst die Handlung aus
- **Bottom** = die Handlung richtet sich an dich

Das ist **nicht** dasselbe wie Dom und Sub. Top/Bottom sagt, wer handelt; Dom/Sub
sagt, wer führt. Dass beide unabhängig sind, zeigt der **Service Top**: er führt
aus und dient zugleich. Deshalb enthält die Rollenachse kein Machtwort — Macht
steht in den Machtsektionen. Eine Prüfung hält das fest.

**Korrektur vom 2026-09-28.** Die Rollen hießen *aktiv* und *passiv*, definiert als
„ausführend, gebend, **führend**" gegen „empfangend, erlebend, **geführt**". Diese
Definition widerspricht sich bei jedem Dienst-Item: ein Butler **führt aus** und wird
zugleich **geführt**, die Herrschaft **empfängt** und **führt**. „Butler-Rollenspiel —
aktiv" war dadurch nicht entscheidbar, ebenso „Sexueller Service".

Die Rolle sagt jetzt **nur noch, wer die Handlung ausführt**. Über Macht sagt sie
nichts — dafür gibt es die Machtsektionen. Bei Dienst-Items nennt die Erklärung
zusätzlich ausdrücklich, welche Seite welche ist.

**Korrektur vom 2026-09-29: ein Wortpaar reicht nicht für alle Items.** Die
Vorgabe ist präzise, solange ein Punkt eine Handlung von A an B ist. Bei **Knien**
führt die kniende Person aus — also steht die folgende Seite unter *ausführend*.
Das liest sich verkehrt herum. Die Items zerfallen in vier Klassen, und nur bei
einer trifft die Vorgabe:

| Klasse | Beispiel | Vorgabe trifft? |
|---|---|---|
| transitiv | Handspanking, Fesseln | **ja** |
| Haltung / Zustand | Knien, Pose halten | nein — es gibt nur eine Seite |
| wechselseitig | Küssen, Kuscheln | nein — beide tun dasselbe |
| Gegenstand / Qualität | Leder, Seile, Decke | nein — es gibt keine Handlung |

**Top/Bottom oder Top/Sub lösen das nicht.** Top/Bottom meint in der Szene
dasselbe wie ausführend/empfangend — deshalb existiert der Begriff *Service Top*,
jemand der ausführt und dabei dient. „Top/**Sub**" würde zwei Achsen mischen (wer
handelt, wer führt) und damit genau die Ambiguität zurückholen, die die Korrektur
vom 2026-09-28 beseitigt hat. Außerdem zwänge es eine D/s-Deutung auf Punkte, die
keine haben: für Leder, Wasser oder gedimmtes Licht gibt es kein Top und kein Sub,
und für die 28 rollengetrennten Punkte in § 3 wäre es schlicht falsch.

**Korrektur vom 2026-09-30: Top und Bottom.** Die Vorgabe hieß bis dahin
*ausführend* / *empfangend*. Sie war logisch korrekt und wurde trotzdem zweimal
als unklar gemeldet — zu Recht, denn sie kippt bei Haltungen: **wer kniet, führt
die Bewegung aus** und stand damit unter *ausführend*, obwohl es die folgende
Seite ist. Als *Bottom* liest sich dieselbe Zeile richtig herum.

Der frühere Einwand gegen „Top/**Sub**" bleibt gültig — der mischt zwei Achsen.
Auf „Top/**Bottom**" trifft er nicht zu: das ist eine Achse, es ist die in der
Szene übliche Bezeichnung dafür, und der Bogen benutzt sie ohnehin schon als
Items (*Top*, *Bottom* unter Rollen und Identitäten).

Erkauft wird das mit Fachsprache: einer Anfängerin sagen *Top* und *Bottom*
zunächst nichts. Das Hinweisband erklärt beide in einem Satz und grenzt sie gegen
Dom/Sub ab; die Skalenlegende wiederholt es.

Die Änderung berührt **keine gespeicherten Daten**: die Schlüssel sind `#a` und
`#p`, die Bezeichnung ist reine Anzeige. Ältere Exporte bleiben lesbar.

Statt umzubenennen darf ein Item **seine beiden Seiten selbst benennen**:
`data/rollen.txt`, wahlweise für eine ganze Sektion oder ein einzelnes Item.
Ohne Eintrag gilt die Vorgabe; 219 Items haben heute ein eigenes Paar.

```
Knien                    kniet selbst    │ lässt knien
Hausarbeit als Service   leistet es      │ empfängt es
Leder                    trägt es selbst │ beim Gegenüber
Handspanking             Top             │ Bottom          (Vorgabe)
```

**Die Wortwahl ist festgelegt: dritte Person, ohne Subjekt.** Dieselbe Bezeichnung
erscheint als Beschriftung im Bogen *und* in der Vergleichsansicht, die über zwei
Menschen spricht („Anna *kniet selbst* / Ben *lässt knien*"). Eine Ich-Form ergäbe
dort „Anna ich kniee". Eine Prüfung in `tools/test/rollen.js` lehnt Ich-Formen ab.

Auf Knoten- und Bereichsebene gibt es kein einzelnes Item — dort bleibt es bei der
Vorgabe.

**Die Richtung gehört in die Rolle, nicht ins Label.** 21 Items trugen sie doppelt
(„Geführt werden", „Betteln lassen", „Gefüttert werden"). Wo ein Gegenstück existiert
(*Füttern* / *Gefüttert werden*), sind beide jetzt einfach; sonst ist das Label
neutral (*Führung*, *Betteln*, *Kleidungswahl*) und die Rolle trägt die Richtung.
Der Audit prüft das.

Rollengetrennt werden Wunsch-Skala, Strafe-Achse und Erfahrung — nicht Stern und Notiz.

## 5. Verschachtelung und Vererbung

Vierstufige Hierarchie, jede Ebene selbst bewertbar:

```
▸ Themenbereich      (12–15, neu kuratiert)
   ▸ Sektion         (44 aus der Quelle + Extras)
      ▸ Gruppe       (neu kuratiert, innerhalb der Sektion)
         · Item
```

### Vererbungsregeln

- Eine Bewertung auf einer oberen Ebene gilt als **Vorgabe für alles darunter**,
  bis ein Knoten ausdrücklich anders bewertet wird.
- **Vererbt werden:** Wunsch-Skala, Strafe-Achse, Fantasie-Schalter.
- **Nicht vererbt werden:** Erfahrung (sachliche Einzelangabe), Stern, Notizen.
- **Vollständig ausgenommen:** der gesamte Rahmen- und Sicherheitsteil (§ 3).
- Ohne Rollenangabe gesetzt gilt die Bewertung für beide Rollen bzw. den
  Einzelwert; per Rolle gesetzt nur für diese Rolle.
- Jeder Knoten außerhalb § 3 kann **„nicht relevant / überspringen"** sein:
  zugeklappt, gilt als geklärt.
- Aufgeklappt wird nur, was relevant ist; Standard ist zugeklappt.


### Rollentrennung im Sicherheitsteil

Die Punkte des Sicherheitsteils zerfallen in drei Arten, und nur bei zweien
entscheidet die Rolle über die Bedeutung:

| Art | Beispiele | rollengetrennt |
|---|---|---|
| beidseitig | Safeword vereinbaren · Vorbesprechung führen · Hard Limits benennen | nein |
| schützt die folgende Seite | Orts- und Zeitgrenzen · Ansprechperson außerhalb · Überwachung abschaltbar | **ja** |
| Pflicht der führenden Seite | Erste Hilfe beherrschen · Lösewerkzeug in Reichweite | **ja** |

Ohne Trennung ist *„Orts- und Zeitgrenzen — brauche ich nicht"* zweideutig: es kann
heißen *für mich brauche ich keine* oder *ich gebe dir keine*. Das sind
gegensätzliche Aussagen. 29 der 64 Punkte sind deshalb rollengetrennt; der
Vergleich wertet sie über Kreuz wie den Rest des Werkzeugs.

Eine Antwort aus einer Fassung ohne Rollentrennung gilt weiterhin für beide Rollen —
es braucht keine Migration.

### Safe Call: bewusst nicht enthalten

Die Quellliste führte *„Safe Call bei neuen Kontakten"*. Der Punkt ist entfernt,
und der Grund gehört festgehalten, damit ihn niemand gutmeinend wieder einträgt:

> Ein Safe Call schützt nur, solange die andere Person Zeitpunkt und Ablauf nicht
> kennt. Als Zeile in einem Dokument, das man ihr gibt, hebt er seine eigene
> Wirkung auf.

Andere Vorsichtsmaßnahmen der Sektion sind davon nicht betroffen — *Identitätsprüfung
vor dem Treffen*, *Referenzen einholen* oder *Erstes Treffen in der Öffentlichkeit*
wirken gerade dadurch, dass sie bekannt sind. Der Safe Call ist der Sonderfall.

Ein kurzzeitig eingebautes Kennzeichen `privat`, das einzelne Punkte von Export und
Vergleich ausgenommen hätte, wurde mit dem Punkt wieder entfernt: es hatte danach
keinen einzigen Nutzer, und ungenutzte Mechanik ist Ballast, kein Vorrat.

### Wo Vererbung nicht gilt

Die Vererbung setzt voraus, dass die Punkte einer Gruppe **gleichartig** sind.
In *Grundorientierung* und *Rollen und Identitäten* sind sie **Alternativen**:
„Kernrollen: Neigung" für zehn Rollen auf einmal ergibt keine Aussage — man ist eine
Rolle oder nicht. Dort entfällt die Bewertungszeile; das Überspringen bleibt.
Die Flagge `NOINHERIT` verlangt eine Begründung, sonst bricht der Bau ab.

### Kennzeichnung

Geerbte Werte werden blass/kursiv dargestellt, ausdrückliche normal. Im Export und
im Vergleich ist jeder Wert als `gesetzt` oder `geerbt` markiert. **Eine geerbte
Zustimmung darf nie wie eine bewusste Einzelentscheidung erscheinen.**

### Fortschritt

Zwei Zahlen: *ausdrücklich bewertet* und *geklärt* (ausdrücklich, geerbt oder
übersprungen) von Gesamt. Der Rahmen- und Sicherheitsteil wird **getrennt
ausgewiesen** und nicht mit der Kink-Liste verrechnet.

## 6. Modi und Einstieg

Bei 1557 Items entscheidet die Zugänglichkeit darüber, ob der Bogen überhaupt
ausgefüllt wird. Drei Stufen, jederzeit wechselbar.

### 6.1 Grundregeln

- **Modi sind Filter über einem Itembestand**, nie eigene Fragebögen. Jedes Item
  behält seine ID, im Einstieg wird es nur nicht gezeigt. Andernfalls wären Profile
  unterschiedlicher Modi nicht vergleichbar.
- **Nicht gefragt ist nicht abgelehnt.** Ausgeblendete Items bleiben *nicht
  bewertet* — nie `hard`, nie zustimmend. Das ist der gefährlichste denkbare Fehler
  an dieser Stelle.
- **Ein Moduswechsel löscht nie.** Runterschalten versteckt, Hochschalten deckt auf.
- **Sicherheit folgt dem Risiko.** Früher galt: § 3 wird in keinem Modus gekürzt.
  Das war gut gemeint und in der Wirkung falsch. 99 Vereinbarungen am Anfang werden
  nicht gelesen, sondern durchgeklickt; und wer sich zum ersten Mal mit dem Thema
  befasst, liest dort „Schriftlicher Ausstiegsplan", „Eigene Wohnmöglichkeit
  sichern", „Ärztlich festgelegte Untergrenzen" — Schutzmaßnahmen gegen Ausbeutung
  in einer 24/7-Dynamik, die als Einstiegsfragen gelesen nur eine Botschaft
  ergeben: *hier musst du dich auf Flucht vorbereiten.* Das ist keine Aufklärung,
  das ist Abschreckung.

  Es gilt jetzt zweierlei. Ein **Kern** steht in jedem Modus: Nüchternheit,
  Einwilligungsfähigkeit, Vorbesprechung, Hard und Soft Limits, Safeword,
  nonverbales Abbruchsignal, Nachfragen in der Szene, Aftercare, Nachbesprechung,
  Widerruf ohne Rechtfertigung, Sanktionsfreiheit, absolute No-Gos. Alles Weitere
  erscheint **gekoppelt an das Risiko, gegen das es schützt**. Die Kopplungen stehen
  einzeln begründet in `data/einstieg-kopplung.txt` und werden von `tools/audit.py`
  geprüft: steht ein auslösendes Item im Einstieg, muss die zugehörige
  Schutzvereinbarung dort ebenfalls stehen, sonst schlägt der Bau fehl.

  Die Regel hat beim ersten Lauf sofort eine echte Lücke gefunden: der Einstieg
  enthielt Fesselungen, aber kein *Lösewerkzeug in Reichweite*.
- **§ 3 bleibt von der Vererbung ausgenommen.** Dort zählt nur, was ausdrücklich
  gesetzt wurde — ein geerbtes Ja ist keine Zustimmung.

### 6.2 Die drei Stufen

| Modus | Umfang | Besonderheiten |
|---|---|---|
| **Einstieg** | 54 Items + 11 Bereichsfragen | siehe § 6.2.1 |
| **Standard** | 891 Items | alle Achsen, Hochrisiko sichtbar, freie Liste |
| **Vollständig** | 1557 Items | gesamter Bestand inklusive Spezialinteressen |

#### 6.2.1 Was der Einstieg ist

Der Einstieg richtet sich an Menschen, die sich zum **ersten Mal** mit dem Thema
befassen — oft vor einem ersten Treffen mit jemandem, den sie noch nicht kennen.
Er soll eine grobe Karte geben und genau das enthalten, was das Gegenüber vorher
wissen muss, nicht einen Vertrag vorbereiten. Ein
verkleinerter Vollbogen leistet das nicht — deshalb ist er ein eigener Zuschnitt,
festgelegt in **`data/einstieg.txt`**: ein Item steht genau dann im Einstieg, wenn
seine ID dort steht. Eine Datei, die man ganz lesen kann; vorher war die
Entscheidung über 264 `GRP`-Zeilen verstreut und damit von niemandem beurteilbar.

Vier Regeln, zwei davon maschinell geprüft:

1. **Kein Item mit Risikoflagge.** Wer anfängt, soll nicht zuerst lesen, wogegen
   man sich absichern muss. (`tools/audit.py`)
2. **Nur Bekanntes.** Was hier steht, ist das, was Menschen ohne Vorwissen unter
   BDSM verstehen: Fesseln, Augenbinde, Spanking, Halsband, Befehle, Anrede,
   strenger Ton, Lob. Spezialisierungen beginnen im Standardmodus.
3. **Sicherheit konkret statt abstrakt.** Alkohol und Drogen, Safeword, Grenzen,
   Nachbesprechung — keine Ausstiegspläne, keine Löschfristen. (§ 6.1)
4. **Nur Beantwortbares.** Gefragt wird, was man ohne Erfahrung ehrlich sagen
   kann: No-Gos, Gesundheit, Rolle, Neugier. Nicht gefragt wird, was Fachwissen
   oder Erfahrung voraussetzt — Risikomodelle, Top/Bottom neben Dom/Sub, Kink als
   Lebensstil. Diese Punkte standen bis 2026-10 im Einstieg und wurden entfernt.

Der Umfang: 54 Items, davon 23 Sicherheit und Limits, 3 Rolle, 28 Neigungen.
*Nüchternheit* steht getrennt nach Seite da: wer folgt, kann auf eine nüchterne
führende Seite bestehen und sich selbst trotzdem einen leichten Rausch wünschen
(„will ich nicht" bei der eigenen Seite). *Wasser* als Aftercare steht nicht im
Einstieg — auf der Wunsch-Skala gefragt, las sich die Notwendigkeit wie eine
Vorliebe.

**Was ein fremdes Gegenüber vorher wissen muss.** Der Einstieg geht davon aus, dass
sich beide womöglich noch nicht kennen. Deshalb gehören dazu: die Limits als
Freitext (No-Gos, Gesundheit, Körper, emotionale Grenzen samt früherer schlechter
Erfahrungen, ohne Details), Identitätsprüfung, erstes Treffen in der
Öffentlichkeit, Orts- und Zeitgrenzen, keine Aufnahmen, STI-Status, sichtbare
Spuren, Kontakt danach — und **einzeln**, nie als Sammelhaken, ob und wie weit es
sexuell wird. Ein Haken an „Sexualität" wäre gegenüber einer unbekannten Person zu
viel Zustimmung auf einmal. Hard und Soft Limits „benennen" stehen nicht mehr im
Einstieg: die Limits selbst stehen dort, die Vereinbarung, sie zu benennen, war
dieselbe Frage ein zweites Mal. Einen Safe Call gibt es weiterhin nicht (§ 6b,
`data/entfernte-items.md`).

**Oberkategorien.** Elf Themenbereiche haben im Einstieg keine eigenen Items.
Drei davon — Sinne, Fetische, Rollenspiel — bekommen stattdessen **eine** Frage
für den ganzen Bereich: *Wie sehr interessiert dich dieser Bereich?*

Zwei weitere bündelten zu Verschiedenes für eine Frage und sind in
**Teilfragen** auf Sektion oder Gruppe zerlegt, jede mit eigenem Titel in
Alltagssprache (`KATEGORIE | <sektion>[.<gruppe>] | <Beschreibung> | <Titel>`):

- *Öffentlichkeit, Medien und Gruppe* → Zusehen und gesehen werden · Fotos,
  Videos und Sexting · Mehr als zwei Personen · Über Distanz · Geschenke ·
  **FinDom: Geld als Machtmittel**. Geld ist für viele ein klares Limit; in einer
  gemeinsamen Frage hätte „Fotos: interessant" FinDom mitbewertet. Bezahlte
  Angebote und finanzielle Schutzgrenzen bleiben offen.
- *Körper, Nahrung und Medizinisches* → Essen und Nasses · Doktorspiele.
  Körperflüssigkeiten werden im Einstieg nicht gefragt: an dieser Stelle war das
  Wort für Menschen ohne Vorwissen abschreckend und missverständlich.

Teilfragen wirken wie die Bereichsfrage, auch in der Ausnahme: Praktiken mit
Risikohinweis erben von ihnen nicht. In Standard und Vollständig gilt diese
Ausnahme für dieselben Knoten weiter — eine Bewertung bleibt eine Bewertung,
egal in welchem Modus sie gesetzt wurde.

Jede dieser Antworten ist eine Knotenbewertung aus § 5 und
vererbt sich auf jedes Item darin. Ein Einstiegsprofil ist damit ohne Umrechnung
gegen ein Vollprofil vergleichbar: wer „Fetische — mag ich" angibt, hat 141 Items
mit einem geerbten Wert belegt, und der Vergleich weiß, dass sie geerbt sind.

**Jede Oberkategorie braucht eine Beschreibung mit Beispielen** — der Themenname
allein sagt jemandem ohne Vorwissen nichts. „Sinne und Empfindung" wird zuverlässig
als *Sinnesentzug* gelesen, obwohl Augenbinde und Kapuze unter Fesseln stehen; die
Beschreibung nennt deshalb nicht nur, was drin ist (Streicheln, Kitzeln, Eis, Wachs,
Kneifen, Klemmen), sondern auch das, was nicht. Deutsch in `data/einstieg.txt`,
englisch im vierten Feld von `data/content/_themes.txt`; beides ist Pflicht und wird
von `tools/audit.py` geprüft, ebenso eine Mindestlänge, damit „Verschiedenes" nicht
als Beschreibung durchgeht.

**Ein Haken am Bereichsnamen erreicht nicht alles.** Er ist die gröbste Geste im
ganzen Bogen und im Einstieg die einzige. Ohne Grenze würde „Rollenspiel — mag ich"
im Profil einer Anfängerin *Ravishment-Fantasie: Neigung (geerbt)* erzeugen, und
„Körper, Nahrung und Medizinisches" ebenso *Blut* und *Kotspiel*. Deshalb gilt in
`effOf`: von einem **Themenknoten** erbt nicht, was

- eine **Risikoflagge** trägt (117 Items), oder
- in einer Sektion liegt, die in `data/einstieg.txt` als **`NUR-EINZELN`** erklärt
  ist. Bisher genau eine: **Consensual Non-Consent**. Dort lebt die Sache davon,
  dass die Zustimmung vorher ausdrücklich und im Einzelnen gegeben wurde — ein
  Sammelhaken ist das Gegenteil davon, auch für die Items ohne eigene Flagge
  (*Überraschungsszene*, *Widerstand mit erlaubten Mitteln*).

Auf **Gruppen- und Sektionsebene** bleibt die Vererbung uneingeschränkt: dort sieht
man, worauf man den Haken setzt. Die Einschränkung gilt in allen Modi, nicht nur im
Einstieg — 16 Themen anzuklicken sollte nirgends 117 Risiko-Items mitbewerten.

**Die Zahl in der Beschriftung nennt, was die Bewertung erreicht — nicht, was
gerade sichtbar ist.** Die Vererbung kennt keinen Modus: eine Bewertung wirkt auch
auf Punkte, die der Modus ausblendet. In *Hochrisiko* stand im Standardmodus
„Ganzer Bereich auf einmal (17)", gewirkt hätte sie auf 44 — und 20 davon sind
risikomarkiert und werden gar nicht erreicht. Die Zeile zählt jetzt die tatsächlich
erreichten Punkte (24) und nennt darunter die Ausnahme. Dasselbe gilt für
Sektionen und Gruppen, wo nichts gesperrt ist, die Vererbung aber ebenfalls über
den Modus hinausreicht.

**Die Toys-Liste war unerreichbar.** Die Sektion ist eine freie Liste und hat
bauartbedingt **keine** Items. In `secBody` stand die Leerprüfung vor der
Fallunterscheidung nach Sektionstyp — sie brach also ab und zeigte einen Strich,
während der Hinweis daneben „Mit Plus hinzufügen" versprach. Kein Eingabefeld,
kein Plus. Der Fehler war von Anfang an da und blieb unbemerkt, weil die
vorhandene Prüfung den *Export* der Toys testete, nicht ihre Bedienung. Die
Typprüfung steht jetzt vorn, eine Renderprüfung deckt es ab.

**Die Auswertung markiert, was der Modus nicht zeigt.** Eine geerbte Bewertung auf
einem Punkt der Stufe *Vollständig* erschien im Standardmodus in der Auswertung,
war in der Liste aber nicht auffindbar und nicht änderbar — eine Sackgasse. Solche
Einträge tragen jetzt den Vermerk *„in diesem Modus nicht sichtbar"*.

Die Bereiche **Hochrisiko** und **CNC** bekommen zusätzlich gar keine Oberkategorie.
Nadeln, Blut, Elektro, Feuer und Atemkontrolle gehören nicht in den ersten Kontakt
mit dem Thema — auch nicht als Auswahlfeld. Sie werden benannt und sonst nichts.

Die Kategorieantworten stehen im Markdown-Export und in der Druckansicht als
eigener Abschnitt; sonst würden sie lautlos verschwinden, weil sie in keiner
Item-Tabelle vorkommen.

**Die Auswertung fasst sie zusammen, statt sie aufzufalten.** Zwei Kategorieklicks
erzeugen über die Vererbung mehrere hundert Einträge. Ausgeschrieben las sich die
Auswertung als Wand aus *Abendkleidung, Achseln, Andreaskreuz* … — genau die
Überfrachtung, die der Einstieg vermeiden soll — und der Hinweis auf den
Anker-Effekt („6 % deines Profils sind eigene Entscheidungen") wurde zum Vorwurf
an jemanden, der den Bogen wie vorgesehen benutzt hat. Im Einstieg steht deshalb
eine Zeile je Bereich (*Fetische — Interessant — gilt für 140 Punkte*), und der
Anker-Hinweis entfällt: dort **ist** die Bereichsantwort die vorgesehene Antwort.
Im Standard- und Vollmodus bleibt beides unverändert, denn dort ist eine
Gruppenbewertung tatsächlich eine Abkürzung.

**Die Auswertung trennt nach Seite.** „Handspanking — Neigung" sagt nicht, ob man
es gibt oder bekommt; die Rollenbezeichnung hing klein hinter jeder Zeile und
ging unter. Die Auswertung steht deshalb in drei Abschnitten: *Als Bottom — was
mit dir gemacht wird*, *Als Top — was du machst*, *Ohne Seite* (Rollenwahl,
Kuscheln, Gegenstände). Innerhalb eines Abschnitts gelten die Stufen wie bisher.
Eine Rollenbezeichnung je Zeile steht nur noch, wo das Item eine eigene hat
(„kniet selbst"), sonst wiederholte sie bloß die Überschrift. Die Abschnitte
heißen Top und Bottom, nicht Dom und Sub: das ist die Achse, auf der die Items
geteilt sind (§ Rollen, `data/rollen.txt`).

**Ein frischer Bogen startet im Einstieg** (`BLANK()`), ein gespeicherter behält
seinen Modus. Wer die Datei zum ersten Mal öffnet, hat sich nicht entschieden, und
die beiden Fehlerfälle sind ungleich schwer: eine Anfängerin, die in 891 Items
landet, hört auf; eine erfahrene Person schaltet oben in einem Klick um.

**Die Vererbung aus § 5 ist der eigentliche Mechanismus des Einstiegs:** wer nur auf
Gruppenebene bewertet, hat nach 60–80 Entscheidungen ein grobes, aber gültiges und
voll vergleichbares Profil.

Die Zuordnung `einstieg` · `standard` · `voll` wird pro Item in der Datendatei
gepflegt (`level`).

### 6.3 Reduzierte Achsen im Einstieg

Sichtbar sind die Wunsch-Skala auf fünf Stufen (`neigung` · `interessant` ·
`neutral` · `soft` · `hard`) und der Fantasie-Schalter.

Einzeln per Schalter aufdeckbar:

- „Strafen sind für mich ein Thema" → Strafe-Achse
- „Erfahrung angeben" → Erfahrungs-Achse
- „Besonders wichtig markieren" → Stern

**Präzisierung aus der Umsetzung:** Diese Schalter gelten nicht nur im Einstieg,
sondern in **allen Modi**, und Strafe und Erfahrung sind überall voreingestellt
aus. Der erste Browser-Test zeigte, dass sechs Chip-Reihen pro Item auch im
Standardmodus unlesbar sind. Zusätzlich blendet ein **＋ an einer einzelnen Zeile**
die beiden Achsen nur für diesen Punkt ein — dieselbe Logik wie die
Verschachtelung: sichtbar wird, was relevant ist.

Die fünf Stufen sind eine **echte Teilmenge derselben Codes**, keine eigene Skala.
Ein Einstiegsprofil ist dadurch ohne Umrechnung gegen ein Vollprofil vergleichbar.

Dazu ein globaler Schalter **„ich habe noch keine Erfahrung"**, der die
Erfahrungs-Achse auf `keine` vorbelegt, statt sie 1529-mal abzufragen.

### 6.4 Hochrisiko im Einstieg

Nadeln/Blut/Markierungen, Elektro/Feuer/Atemkontrolle und CNC sind im Einstieg
ausgeblendet, aber **benannt**: „wird im Einstiegsmodus nicht abgefragt". Kein
stilles Verschwinden — nur keine Selbsteinschätzung ohne Grundlage.

### 6.5 Geführter Ablauf

Der geführte Ablauf zeigt **eine Frage pro Karte**, in jedem Modus; die Liste
bleibt die Gesamtansicht. Eine Seite mit zwanzig Zeilen und einem
Inhaltsverzeichnis darüber sah für jemanden, der die Datei zum ersten Mal
öffnet, nach Formular aus — eine Karte nach einer Frage, die man beantworten
kann.

- **Nur von Hand weiter.** Zurück und Weiter (bzw. „Überspringen", solange
  nichts gewählt ist), Wischen und die Pfeiltasten blättern. Ein automatischer
  Sprung 450 ms nach der Antwort war kurz eingebaut und wurde wieder entfernt:
  auf dem Handy verschwand die Karte, bevor man Stern, Fantasie oder Notiz
  darunter erreichte.
- **Karten mit zwei Rollen** zeigen die Antworten kompakt, zweispaltig und ohne
  Beschreibungszeile — sonst stünden zehn große Knöpfe untereinander.
- **Rahmen:** eine Begrüßungskarte vorn (wie es funktioniert, Top/Bottom,
  Pseudonym), eine Speichern-Karte hinten.
- **Inhaltsverzeichnis** am Rechner als Seitenleiste links, auf dem Handy hinter
  „Übersicht". Ohne Zähler „0/12 gesetzt" — das las sich wie eine Aufforderung;
  ein Haken markiert, was erledigt ist.
- **Handy zuerst.** Unter 760 px liegen Ansicht, Modus, Sprache, Suche und Export
  hinter ☰; im geführten Ablauf entfällt dort auch die Fortschrittsleiste im
  Kopf, die Karte hat ihre eigene. Angaben zur Person, Einleitung und
  Quellenliste stehen im geführten Ablauf nicht unter der Karte.
- **Die zuletzt benutzte Ansicht wird gemerkt.** Im Einstieg ist der geführte
  Ablauf die Vorgabe, auch wenn schon etwas beantwortet ist — vorher öffnete die
  Datei nach der ersten Antwort in der Liste.

**Erst das, was Spaß macht, zuletzt die Limits.** Die Reihenfolge ist: Neigungen
→ Prioritäten („welche fünf sind dir die wichtigsten?") → Rahmen und Sicherheit →
**Deine Limits** als eigener, letzter Schritt. Früher stand der Sicherheitsteil
vorn; wer aber als Erstes liest, wogegen man sich absichern muss, hört auf, bevor
er weiß, was er eigentlich will. Die Prioritäten stehen direkt nach den Neigungen,
um die es dort geht. Am Ende steht statt „Weiter" der Knopf zum Speichern.

**Ohne Limits kein Export.** Markdown und JSON lassen sich erst speichern, wenn
mindestens ein Limit angegeben ist: ein Eintrag in No-Gos, körperlichen,
emotionalen, gesundheits- oder beziehungsbezogenen Grenzen, oder ein `hard` bzw.
`soft` irgendwo auf der Wunsch-Skala. Ein Bogen ohne ein einziges Limit liest sich
in der Hand einer fremden Person wie „alles erlaubt". Statt eines Downloads kommt
ein Hinweis — bewusst mit Humor, weil er niemanden belehren soll, der schlicht noch
nicht fertig ist — und ein Knopf, der direkt zum Limit-Schritt führt. Der
Zwischenstand im Browser bleibt unberührt; gesperrt ist nur, was das Gerät
verlässt. Das gilt in allen Modi.

### 6.6 Modus im Vergleich

Das Vergleichsdokument nennt Modus und Abdeckung jeder Seite:

> A hat im Einstiegsmodus ausgefüllt, 54 Items und 11 Bereichsfragen von 1589.
> Alles übrige ist **offen, nicht abgelehnt.**

Bei ungleichen Modi werden Bereiche, die nur eine Seite ausgefüllt hat, als
*einseitig erhoben* gekennzeichnet und nicht als Differenz gewertet.

## 6b. Fassungen und Abwärtskompatibilität

Die Liste wird sich ändern. Ein Export von heute muss in einer späteren Fassung
lesbar und vergleichbar bleiben — sonst ist ein ausgefüllter Bogen ein Wegwerfartikel.

### Stichtag: das erste Release

Bis zum ersten Release dürfen Ids brechen — danach nicht mehr. Die Neuvergabe der
Ids (§ 7) hat jeden älteren Export unbrauchbar gemacht; das war der Preis dafür,
die Altlast loszuwerden, solange sie noch kostenlos zu tilgen war.

`data/migrations.txt` beginnt deshalb bei null. Die Entwicklungsgeschichte — 16
bewusst entfernte Punkte mit Begründung — steht als reine Dokumentation in
`data/entfernte-items.md`. Einträge stehen zu lassen, die eine Kompatibilität nur
noch behaupten, wäre irreführend.

Die Migrationstests arbeiten seitdem mit **eigenen Attrappen** statt mit dem
Inhalt der Datei. Ein Test, der auf reale Einträge baut, wäre am Tag des Release
rot, ohne dass am Code etwas falsch ist.

### Migrationsdatei

`data/migrations.txt` wird **nur ergänzt, nie umgeschrieben**:

```
REMOVE | <alte id>             | <Begründung>
RENAME | <alte id> | <neue id> | <Begründung>
```

Der Build prüft: ein RENAME-Ziel muss existieren, und eine migrierte Id darf im
aktuellen Bestand **nicht** mehr vorkommen. Beides bricht den Bau ab, statt still
durchzugehen.

### Verhalten beim Import

- **Umbenannt** → die Angabe zieht auf die neue Id um.
- **Entfernt oder unbekannt** → die Angabe wird **nicht gelöscht**, sondern als
  *Waise* mitgeführt und beim nächsten Export wieder mitgeschrieben. Stiller
  Datenverlust ist der schlimmere Fehler; wer die Datei später in einer anderen
  Fassung öffnet, findet seine Angabe wieder.
- **Knoten** (Themen, Sektionen, Gruppen), die es nicht mehr gibt, entfallen — samt
  Rollen-Suffix korrekt behandelt.
- Ein **Hinweisband** nennt Zahl und Verbleib. Die Migration ist idempotent.

### Verhalten im Vergleich

Der Abschnitt *Abdeckung* nennt eine abweichende `listRevision` und die Zahl der
Angaben zu Punkten, die es hier nicht gibt, mit dem entscheidenden Zusatz:

> „Nicht bewertet" kann hier also auch heißen, dass es den Punkt in jener Fassung
> noch nicht gab.

Bei gleicher Fassung erscheint der Hinweis nicht. `schemaVersion` einer neueren
Datei wird ebenfalls gemeldet.

## 6c. Messqualität

Der Katalog ist **kein psychometrischer Test.** Ein Persönlichkeitsfragebogen misst
ein latentes Konstrukt über austauschbare Indikatoren; dort sind Cronbachs α und
Faktorenanalyse sinnvoll. Hier gibt es kein latentes Konstrukt: „Magst du Flogger?"
ist kein Indikator für etwas Dahinterliegendes, sondern die Sache selbst. Formal ist
das ein **formatives Inventar**. Interne Konsistenz wäre dort kein Qualitätsmerkmal,
sondern ein Fehlersignal — hoch korrelierende Items wären bloß Redundanz. α-Werte
auszuweisen wäre Scheinpräzision.

| Begriff | Hier anwendbar als |
|---|---|
| Reliabilität | Retest-Stabilität und innere Widerspruchsfreiheit, **nicht** Inter-Item-Korrelation |
| Validität | Inhalts- und Augenscheinvalidität, **nicht** Konstruktvalidität |

### Regeln für Item-Formulierungen

1. **Ein Ding pro Item.** „X und Y" nur, wenn beide Teile *einen* Begriff bilden.
   Sonst beantworten verschiedene Menschen faktisch verschiedene Fragen und
   erzeugen identisch aussehende Daten.
2. **Keine Verneinung im Label.** Bei negativ formulierten Items wird jede Ablehnung
   zur doppelten Verneinung: „Keine Kontrolle über Medikamente → lehne ich ab"
   liest sich als *ich will Kontrolle über deine Medikamente*.
3. **Kein Vorbehalt im Label.** „nur …", „ausschließlich …", „vorher …" gehören in
   die Erklärung. Im Label sind sie doppelbarreliert und suggestiv. Ausnahme: der
   Vorbehalt *ist* die Aussage („Freigegebene Sprache gilt nur in der Szene").
4. **Keine Wertung im Label.** „einvernehmlich", „sicher", „kontrolliert" beantworten
   die Frage mit. Die ganze Liste setzt Einvernehmlichkeit voraus; das im Label zu
   wiederholen ist Suggestion.
5. **Keine Aussage über Häufigkeit.** „als Spezialinteresse" teilt mit, dass man
   unüblich ist, und beeinflusst damit die Antwort. Risiko steht im Badge.
6. **Label ≤ 60 Zeichen.** Die Präzision steht in der Erklärung.
7. **Keine Tatsache auf der Vereinbarungs-Skala.** „Essstörung in der Vorgeschichte"
   ließ sich nicht mit *verbindlich* oder *will ich nicht* beantworten — eine
   Vorgeschichte ist keine Zusage. Gefragt wird nach der **Grenze**, nicht nach dem
   Grund: „Ernährung und Gewicht außerhalb der Dynamik". Das ist zugleich ein
   Gewinn an Privatsphäre, denn niemand muss eine Diagnose offenlegen, um eine
   Grenze zu setzen.
8. **Im Vereinbarungsteil Infinitiv, kein Satz.** „Ziele **dürfen** gesenkt werden"
   trägt die Modalität schon im Label, die Skala legt eine zweite darüber. Das Verb
   steht am Ende oder gar nicht: *Safeword vereinbaren · Trigger vorher benennen ·
   Nüchtern bleiben*.
9. **Kein bloßes Substantiv, wo eine Handlung gemeint ist.** „Triggerliste" konnte
   heißen *„wir tauschen Trigger aus"* oder *„hier sind meine Trigger"*. Die Skala
   fragt nach einer Zusicherung, also benennt das Label eine Handlung.

### Ergebnis der Überarbeitung

| Befund | vorher | nachher |
|---|---|---|
| Verneinung im Label | 26 | 0 |
| Eingebauter Vorbehalt | 92 | 0 |
| Wertende Wortwahl | 39 | 0 |
| Zwei Dinge in einem Item | 111 | 0 |
| Label über 60 Zeichen | 41 | 0 |
| Längstes Label | 101 Zeichen | 59 Zeichen |
| Tatsache auf der Vereinbarungs-Skala | 1 | 0 |
| Satzform statt Infinitiv (§ 3) | 22 | 0 |
| Bloßes Substantiv für eine Handlung (§ 3) | 20 | 0 |

Rund 300 Items wurden umformuliert, ohne eine einzige Id zu ändern: das deutsche
Label wird über ein eigenes Feld der Inhaltsdatei gesetzt. Die Ids blieben dadurch
am ursprünglichen Wortlaut hängen — samt der Vorbehalte, die aus den Labels gerade
entfernt worden waren. Vor dem ersten Release wurden sie einmalig neu vergeben,
siehe § 7 *IDs*.

Alle verbliebenen Treffer stehen mit Begründung in `data/audit-exempt.txt`
(82 Einträge). `tools/audit.py` läuft als Teil der Testsuite und schlägt fehl,
sobald eine **unbegründete** Verletzung auftaucht oder eine Ausnahme veraltet.

### Bekannte Schwächen, benannt statt versteckt

**Die Vererbung ist ein Anker.** Eine Gruppenbewertung, die nach unten durchschlägt,
ist messmethodisch ein starker Anker — und zugleich das, was 1518 Items ausfüllbar
macht. Der Kompromiss wird nicht versteckt: Geerbtes ist markiert, wird getrennt
gezählt, gilt im Vergleich nie als ausdrückliche Zusage, und die Auswertung weist
aus, **welcher Anteil des Profils eine eigene Entscheidung ist**.

**Ermüdung ist hier die Hauptbedrohung der Reliabilität**, nicht die Formulierung.
Dagegen wirken die Modi aus § 6 und die Möglichkeit, jederzeit zu unterbrechen.

**Reihenfolgeeffekte** sind in Kauf genommen: die thematische Blockung hilft dem
Verständnis mehr, als die Randomisierung der Vergleichbarkeit helfen würde.

### Antwortformat

Die Skalen sind durchgehend **beschriftet statt nummeriert**, es gibt eine
ausdrückliche „Keine Angabe"-Option und eine echte Mitte. Abstände zwischen den
Stufen werden **nicht** als gleich behandelt: es wird nirgends gerechnet, nirgends
summiert und keine Passungskennzahl gebildet (§ 9.5).

Die Stufen müssen sich gegenseitig ausschließen. Deshalb wurde „lehne ich ab" in
der Vereinbarungs-Skala aufgeteilt: *brauche ich nicht* (keine Bedingung, stört
aber nicht) und *will ich nicht* (ausdrücklicher Gegenwille). Die alte Formulierung
vermischte beides — und bei einer Absicherung wie „Befristung der Dynamik" ist die
Ablehnung tatsächlich eine Neigung, nämlich zur Unbefristetheit.

## 7. Zweisprachigkeit

Deutsch und Englisch, vollständig übersetzt: Oberfläche, Themenbereiche, Sektionen,
Gruppen, alle Item-Labels, alle Erklärungen, Sicherheitshinweise, Exporttexte.

**Jedes Item hat eine Erklärung in beiden Sprachen.** Bei Begriffen wie „Predicament
Bondage" oder „Placiosexuell" ist die Erklärung der eigentliche Inhalt.

Die Inhalte liegen als `data/content/<sektion>.txt` im Format
`<slug> | <EN Label> | <DE Erklärung> | <EN explanation> | <DE Label, optional>`.

Der Schlüssel ist immer der Slug — der Teil der Id hinter dem Schrägstrich.
Früher ging auch das deutsche Label. Das war zirkulär: dieselbe Datei **setzt**
das Label über das fünfte Feld und benutzte es zugleich als Schlüssel, band sich
also an einen Wortlaut, der sich ändern darf. 868 Zeilen wurden umgestellt.

Das **fünfte Feld ist das deutsche Label**; fehlt es, gilt der Wortlaut der
Quellcheckliste. 276 Items tragen hier ihre Neuformulierung aus der Fragebogen-
Überarbeitung — die Quelle bleibt unverändert, damit nachvollziehbar ist, woraus
ein Item entstanden ist. Sein früherer zweiter Zweck, die Id am alten Wortlaut
festzuhalten, ist mit `data/ids.lock` entfallen. Ein fünftes Feld, das nur den
Quelltext wiederholt, bewirkt nichts und **bricht den Lauf ab**; 10 solche
Karteileichen wurden entfernt.
Ein leeres Feld lässt den vorhandenen Wert stehen. `tools/content.py` spielt sie in
die kuratierten Daten ein, prüft jede Zeile gegen den Bestand und meldet die
Abdeckung; unbekannte Slugs brechen den Lauf ab, statt still zu verschwinden.

Wo eine Erklärung ein Risiko benennt, benennt sie es konkret statt allgemein zu
warnen — „nicht länger als etwa zwanzig Minuten, wegen der Durchblutung" ist
brauchbar, „Vorsicht geboten" nicht.

Die Antwortdaten speichern **ausschließlich IDs und Codes, keine Texte**. Ein auf
Deutsch und ein auf Englisch ausgefüllter Bogen sind dadurch ohne Umrechnung
vergleichbar. Ausnahme sind naturgemäß die Freitextfelder und die Wortlisten.

### IDs

Sektions-qualifizierte, sprachunabhängige Slugs: `impact-play/rohrstock`.
Notwendig, weil 32 Labels der Quelle mehrfach in verschiedenen Sektionen vorkommen
(34 Labels betroffen: Latex, Leder, Massage, Spiegel, Kratzen, Ketten, Handschuhe …).

**Die Id ist keine Funktion des Labels.** Sie war es, und das war der Fehler: die
Id entsteht aus dem Quelltext der Checkliste, das Label wird später umformuliert,
und beides driftet auseinander. Vor dem ersten Release trugen **333 von 1557 Items
(21 %)** eine Id, die nicht mehr zu ihrem Label passte, **54** davon mitten im Wort
abgeschnitten:

| Id | Label |
|---|---|
| `kotspiel-scat-als-erheblich-hygienisch-riskantes-spezialinte` | Kotspiel / Scat |
| `intoxikations-oder-kontrollverlustthema-ausschliesslich-nuec` | Rausch als Thema |
| `geofencing-nur-transparent-freiwillig-und-datenschutzbewusst` | Geofencing |

Das ist nicht nur hässlich: diese Zeichenketten stehen im JSON-Block **jedes
exportierten Profils** — also in einer Datei, die Menschen einander geben. Die
wertenden Formulierungen, die aus den sichtbaren Labels bewusst entfernt wurden,
standen dort weiter drin.

Deshalb einmalig, solange es nichts kostet: `tools/lockids.py --init` vergibt die
Ids aus den aktuellen Labels neu und schreibt sie nach **`data/ids.lock`**.
`curate.py` liest diese Datei und setzt die dort festgehaltene Id. Ab jetzt gilt:

- Ein Label darf sich ändern, die Id wandert nicht mit. Der Schlüssel des Locks ist
  der Quellindex (`<sektion>|n<index>`) beziehungsweise der in `curation.txt`
  vergebene Slug — beides unabhängig vom Wortlaut.
- Verschwindet ein Eintrag aus dem Lock, **bricht der Bau ab**, bis ein Eintrag in
  `data/migrations.txt` erklärt, was mit dem Item geschehen ist.
- Neue Items trägt `curate.py` selbst nach.
- Gekürzt wird an der Wortgrenze, nicht nach Zeichen (`…ohne-veraenderung-der`
  statt `…ohne-veraenderung-der-at`). Längster Slug: 60 Zeichen.

**Zwei Wächter in der Testkette** (`tools/test/all.sh`), beide aus Fehlern
entstanden, die bei genau dieser Umbenennung passiert sind:

- `tools/lockids.py` ohne Argument vergleicht Lock und Bau.
- `tools/checkids.py` prüft jede Id-Nennung in `src/` und `tools/test/`. Er
  verbietet außerdem die Konstruktion `'sektion/' + variable`: ein so
  zusammengesetzter Verweis überlebt keine Umbenennung und bricht **lautlos** —
  der Querverweis findet dann nichts und meldet auch nichts. Genau so blieben bei
  der Neuvergabe 26 Verweise in `app.5.js` unentdeckt, bis Tests fehlschlugen.

Eine dritte Lehre steht im Werkzeug selbst: die Ersetzung braucht **Wortgrenzen**.
`…/safeword` ist ein Präfix von `…/safeword-vereinbaren`; ohne Grenze macht ein
zweiter Lauf daraus `safeword-vereinbaren-vereinbaren`.

### Blackmail und Bloßstellung

Einvernehmliches Erpressungsspiel war mit zwei verstreuten Punkten abgedeckt
(`erpressungs-rollenspiel`, `blackmail-fantasie-mit-drehbuch`) und hatte keine
eigenen Grenzen. Es hat aber dieselbe Sonderstellung wie die Manipulationssektion,
nur schärfer: **die Drohung richtet sich gegen die Möglichkeit, das Spiel zu
beenden.** Wer erpresst wird, kann schlecht abbrechen — darin liegt der Reiz und
darin liegt die Gefahr. Ein Safeword allein trägt nicht; deshalb steht unter den
Grenzen ausdrücklich *Safeword steht über dem Spiel*.

31 Punkte in fünf Gruppen, die vier Fragen trennen, die im Gespräch durcheinander
gehen: **was gehalten wird** (von reiner Fiktion bis zu echtem Material),
**womit gedroht wird** (eingeweihte Person, erfundene Öffentlichkeit, Geld,
Aufgaben, Eskalation, Frist), **welche Spielform** und **welche Reichweite** (eine
Szene, mehrere Tage, dauerhaft). Dazu **elf Grenzen**, nicht rollengetrennt, weil
sie für beide Seiten gelten.

Risiko hoch: echtes Material, Geldforderung, eskalierende Forderungen, dauerhafte
Dynamik. Die Sektion ist `NUR-EINZELN` (§ 6.2.1) — ein Haken am Themennamen
erreicht sie nicht, und die Grenzen sind an alle vier Inhaltsgruppen gekoppelt.

Der Sektionshinweis nennt die Rechtslage: eine vorher erteilte Zustimmung macht
eine später ernst gemeinte Drohung nicht zulässig (§ 253, § 240 StGB), und intime
Aufnahmen weiterzugeben ist auch dann strafbar, wenn ihre Entstehung einvernehmlich
war (§ 201a StGB).

## 8. Export und Import

| Format | Zweck |
|---|---|
| **Markdown** | Lesbares Dokument **plus** abschließender ```kinkcompass-Codeblock mit vollständigem JSON — menschenlesbar und verlustfrei rückführbar in einer Datei |
| **JSON** | Reine Daten für maschinelle Auswertung |
| **Druckansicht** | Aus dem Vorgängertool übernommen, inkl. „nur bewertete Punkte" und „Erklärungen mitdrucken" |

Import akzeptiert **beide** Formate — beim Markdown wird der eingebettete Block
gelesen. Das behebt die Einschränkung des Vorgängertools, dessen Markdown-Export
nicht re-importierbar war.

Die globale Rangliste (§ 2.5) steht im Markdown-Export **vor allen Sektionen**.

Der Export enthält Metadaten: Pseudonym, Datum, Selbstbeschreibung, Version/Kontext,
freie Notiz, Skalen- und Listenrevision, Item-Zahl.

## 9. Vergleich zweier Profile

Zwei Dateien werden geladen (JSON oder Markdown), das Ergebnis ist ein Dokument,
das selbst als Markdown exportierbar ist. Gematcht wird über Kreuz nach Rolle,
nie 1:1.

### Reihenfolge des Dokuments

**Sicherheit vor Lust, auch in der Dokumentstruktur.** Die Abschnitte 1 bis 5
stehen vor jedem Match:

1. **Absolute No-Gos** — Union beider Hard Limits, inklusive der ausgeschlossenen Worte
2. **Unvereinbare Vereinbarungen** — `verbindlich` bei A gegen `ablehnend` bei B
3. **Unterschiedliches Risikomodell** — SSC gegen RACK wird benannt, bevor über Hochrisiko verhandelt wird
4. **Zuerst zu besprechen** — Querverweis reale Abhängigkeit (§ 9.3)
5. **Nutzbare Sprache** — Schnittmenge der Wortlisten (§ 9.4)
6. Strafe-Auswertung inklusive „Strafe wirkt nicht"
7. **Prioritäten-Abgleich** — die Ranglisten beider Seiten gegeneinander (§ 9.5)
8. Matches
9. Gemeinsam entdecken
10. Einseitige Kernwünsche
11. Nur Fantasie, nicht umsetzen
12. Aftercare-Abgleich
13. Offen oder nicht bewertet

### 9.1 Wunsch-Matching

| Person A | Person B | Ergebnis |
|---|---|---|
| aktiv: must/neigung | passiv: must/neigung | ✅ **Match**, Richtung A→B |
| irgendwo `hard` | irgendetwas außer `hard` | ⛔ **No-Go** |
| `soft` | interessant/neigung | ⚠️ **Verhandeln** |
| `interessant` | `interessant` | 🔍 **Gemeinsam entdecken** (beide ohne Erfahrung extra markiert) |
| Fantasie-Schalter an | egal was | 💭 **Nur reden, nicht umsetzen** |
| `must` | neutral / nicht bewertet | ❗ **Einseitiger Kernwunsch** |

### 9.2 Strafe-Matching

| A (empfängt) | B (verhängt) | Ergebnis |
|---|---|---|
| `echt` | `echt` | ✅ **wirksame Konsequenz**, beidseitig getragen |
| `reizvoll` | `echt` | ⚠️ **Strafe wirkt nicht** — B glaubt zu bestrafen, A genießt es |
| `echt` | `-` | ❗ **steht nicht zur Verfügung** |
| `hard` | egal was | ⛔ **No-Go**, auch als Strafe |

Die Zeile „Strafe wirkt nicht" deckt ein Missverständnis auf, das in realen
Dynamiken laufend passiert und sonst unbemerkt bleibt.

### 9.3 Querverweis Machtabgabe ohne Absicherung

Wenn 24/7-Dynamik, Total Power Exchange, Slave, Property, Owner, FinDom oder
dominante Alltagsbegleitung als `must` bewertet sind **und** Punkte aus § 3.3 offen
oder abgelehnt bleiben, erscheint der Befund unter „Zuerst zu besprechen":

> Eine dauerhafte Machtabgabe ist nur so widerruflich, wie der Weg hinaus materiell
> offen bleibt.

**Sachlich, beschreibend, ohne Bewertung der Personen** — benannt wird die
Kombination und die Liste der offenen Punkte, nicht ein Urteil. Sind alle
Absicherungen beantwortet, erscheint nichts.

### 9.3b Querverweis gesundheitsbezogene Kontrolle

Wenn eine Seite Ernährungs-, Gewichts- oder Messwertkontrolle mit `must` oder
`neigung` bewertet und Punkte aus § 3.5 unbeantwortet sind, erscheint der Befund
unter „Zuerst zu besprechen" — mit der Liste der offenen Grenzen und der Angabe,
wer sie offen gelassen hat. Sachlich und beschreibend, ohne Bewertung der Personen.
Sind alle Grenzen beantwortet, erscheint nichts.

### 9.4 Schnittmenge der Wortlisten

Geschnitten wird **getrennt nach Bedeutung**: belohnende Worte gegen belohnende,
herabsetzende gegen herabsetzende. Nutzbar ist ein Wort nur, wenn es auf **beiden**
Listen derselben Art und auf **keiner** Verbotsliste steht. Jedes Wort auf einer
Verbotsliste ist absolut ausgeschlossen, unabhängig von der anderen Seite. Bei den
Kategorien gilt die restriktivere Angabe beider Seiten.

**Bedeutungskonflikt.** Steht dasselbe Wort bei der einen Seite auf der belohnenden
und bei der anderen auf der herabsetzenden Liste, erscheint es rot:

> ⛔ Bedeutungskonflikt: „Schlampe" — Ben hat es als Lob freigegeben, Anna als
> Beschimpfung. Dasselbe Wort kommt gegenteilig an — vor dem Gebrauch klären.

Dieser Befund ist der Grund für die Teilung. Eine gemeinsame Wortliste hätte beide
Seiten als Treffer ausgewiesen.

### 9.5 Prioritäten-Abgleich

Die beiden globalen Ranglisten werden gegeneinander gelegt. Das ist die Auswertung,
die eine Papierliste nicht leisten kann, weil ein Rang-2-Wunsch sonst in 1470 Zeilen
untergeht.

| Befund | Bedeutung |
|---|---|
| bei beiden in den obersten Rängen | ✅ **stärkster Match des Dokuments**, steht ganz oben |
| A hoher Rang, bei B `soft` | ⚠️ **Kernwunsch trifft Grenze** — der wichtigste Verhandlungspunkt |
| A hoher Rang, bei B `hard` | ⛔ **Kernwunsch trifft No-Go** — muss ausdrücklich benannt werden, nicht unter den No-Gos versteckt |
| A hoher Rang, bei B nicht bewertet | ❗ **nicht erhoben** — offen, ausdrücklich nicht ablehnend |
| A hoher Rang, bei B gegenläufige Rolle fehlt | ❗ **Rolle nicht besetzt** |

Ränge werden **nicht miteinander verrechnet.** Es gibt keine Prozentzahl und keine
Punktzahl für Passung — Rang 3 bei A und Rang 8 bei B ergeben keine Kennzahl,
sondern zwei Angaben, die nebeneinander stehen. Eine errechnete Kompatibilität wäre
eine Scheingenauigkeit, die das Gespräch ersetzt, statt es zu eröffnen.

### 9.7 Umsetzung

Die geladenen Profile liegen **ausschließlich im Arbeitsspeicher** und werden nie
gespeichert. Der eigene Bogen bleibt unberührt; das Laden eines fremden Profils
kann die eigenen Antworten nicht überschreiben. Beide Dateien bleiben im Browser,
nichts wird übertragen.

Angenommen werden JSON und Markdown mit eingebettetem Block; das eigene Profil
lässt sich direkt als Seite A oder B einsetzen, ohne den Umweg über eine Datei.

Ein Wort auf einer Verbotsliste erscheint ausschließlich unter den No-Gos, nie
unter „von der anderen Seite nicht freigegeben" — es ist absolut ausgeschlossen
und nicht bloß unfreigegeben.

### 9.6 Sortierung und Sichtbarkeit

Innerhalb der Match-Abschnitte sortiert nach Bucket-Kombination (must+must vor
must+neigung vor …), dann nach gesetztem Rang, dann nach Stern. **Kein
Intensitätswert nötig.**

Geerbte Werte sind als *abgeleitet* gekennzeichnet und werden nicht wie
ausdrückliche Zusagen gewertet.

**Notizen** haben je einen Schalter *privat / teilen*. Private Notizen bleiben im
eigenen Profil und erscheinen nicht im Vergleichsdokument.

Das Dokument trägt einen Vorspann: **ein Match ist ein Gesprächsanlass, keine
Erlaubnis.** Zustimmung entsteht im Gespräch, nicht durch übereinstimmende Kreuze.

## 10. Sicherheitsinhalte

- Die 10 Sektionshinweise der Quelle werden übernommen, einklappbar pro Sektion.
- Risiko-Items tragen ein Badge: 56 Items als *hoch*, 34 als *mittel* eingestuft. Betroffen sind Nadeln/Blut/Markierungen,
  Elektro/Feuer/Atemkontrolle, CNC, Körperflüssigkeiten, Ageplay, Pet Play,
  Öffentlichkeit, Foto/Video, FinDom, Medizinisches.
- Die 18 Quellen (StGB, BGH zur Grenze der Einwilligung, ICD-11,
  Community-Referenzen) werden als Anhang geführt.
- Einleitungstext des Vorgängertools bleibt: Freiwilligkeit, Überspringbarkeit,
  jederzeitige Änderbarkeit, Zustimmung und Stoppsignale.

## 11. Technik

- **Eine eigenständige HTML-Datei**, Daten inline, kein Netzwerk, keine externen
  Ressourcen. Läuft per Doppelklick aus `file://` — deshalb inline, ein externes
  JSON würde dort an CORS scheitern.
- Gepflegt wird nicht die HTML-Datei, sondern `data/` plus ein Build-Skript, das
  daraus die eine Datei erzeugt. Bei 1529 Items mit je vier Textfeldern ist
  Handpflege der HTML nicht mehr tragfähig.
- Autospeicherung in `localStorage`. Keine Daten verlassen das Gerät. Ist die
  Speicherung gesperrt — auf `file://` je nach Browser möglich —, erscheint eine
  sichtbare Warnung mit dem Hinweis auf den Export. Ein stiller Verlust eines
  ausgefüllten Bogens ist der schlimmste denkbare Fehlerfall und wird deshalb
  aktiv geprüft, nicht nur abgefangen.
- Bedienung für großen Umfang: Tastatur-Schnellbewertung, Suche, Filter nach
  Bewertung und Status, Fortschrittsanzeige, Sektionen überspringen.

## 12. Vorgehen

| Phase | Ergebnis |
|---|---|
| **1 — Datengerüst** ✅ | Markdown parsen, Extras zusammenführen, Rahmen- und Sicherheitsteil (§ 3) verfassen, Hierarchie kuratieren, IDs, aktiv/passiv-, Risiko- und `level`-Flags (§ 6.2). `data/` deutsch, ohne Erklärungen. **Baum wird zur Durchsicht vorgelegt, bevor darauf gebaut wird.** Ergebnis: `data/curation.txt` (Quelle), `data/tree.json` + `data/items/*.json` (erzeugt), `data/TREE.md` (Durchsicht), `tools/` (Extraktion, Compiler, Prüfbericht). |
| **2 — App** ✅ | Bewertungsoberfläche mit allen Achsen und der Vereinbarungs-Skala, Verschachtelung und Vererbung samt Ausnahme, Suche, Stern, Prioritätenansicht mit Drag & Drop und Tastenbedienung, Fortschritt, Modusumschaltung und geführter Einstiegsablauf, Export/Import, Druckansicht. Oberfläche zweisprachig, Item-Texte zunächst deutsch mit Fallback. Ergebnis: `KinkCompass.html` (422 KB, eigenständig), Quellen in `src/`, Bau über `tools/build.py`, Prüfungen über `tools/test/all.sh` (233 Stück). |
| **3 — Vergleich** ✅ | Zwei-Profil-Vergleich in der Reihenfolge aus § 9, inklusive Wortlisten-Schnittmenge, Abhängigkeits-Querverweis und Modus-Abdeckung, samt Exportdokument. Ergebnis: Ansicht „Vergleich" in derselben Datei, 14 Abschnitte in der Reihenfolge aus § 9, 64 eigene Prüfungen. Das Tool ist damit funktional vollständig. |
| **4 — Inhalte** ✅ | Erklärungen deutsch und englische Übersetzungen, sektionsweise in Durchgängen. Ergebnis: 100 % Abdeckung — 1529 englische Labels, 1529 deutsche und 1529 englische Erklärungen, dazu 16 Themen-, 57 Sektions- und rund 260 Gruppentitel, 19 Sektionshinweise, 7 Antwortsätze und die gesamte Oberfläche. Quelle: `data/content/*.txt`, eingespielt über `tools/content.py`, abgesichert durch 7 Abdeckungsprüfungen. |
