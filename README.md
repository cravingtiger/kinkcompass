# KinkCompass

Ein Fragebogen über Neigungen und Grenzen — als **eine einzelne HTML-Datei**,
die vollständig im Browser läuft.

**Nichts verlässt das Gerät.** Es gibt keine Server, keine Analyse, keinen
Netzwerkzugriff. Der Zwischenstand liegt im lokalen Browserspeicher, der Export
schreibt eine Datei auf die Festplatte. Das lässt sich nachprüfen: die Datei
enthält kein `fetch`, kein `XMLHttpRequest`, kein `<script src>` und keine
externe Ressource (`tools/dist.sh` prüft genau das bei jedem Bau).

## Benutzen

Lade `KinkCompass.html` herunter und öffne sie per Doppelklick. Fertig.

Der sicherste Weg ist, die Datei lokal zu öffnen statt über eine Adresse zu
laden: wer sie über einen Hoster aufruft, teilt diesem mit, dass er es tut.
Die Antworten selbst bleiben in beiden Fällen auf dem eigenen Gerät.

## Drei Umfänge

| Modus | Umfang | für wen |
|---|---|---|
| **Einstieg** | 54 Punkte und 11 Bereichsfragen | erster Kontakt, auch vor einem ersten Treffen |
| **Standard** | 908 Punkte | die meisten |
| **Vollständig** | 1588 Punkte | mit Spezialinteressen |

Erst kommen die Neigungen, zum Schluss die Limits. Ohne mindestens ein Limit
lässt sich der Bogen nicht speichern: jeder Mensch hat welche.

Ein Moduswechsel löscht nie. Was nicht abgefragt wurde, gilt als **offen, nicht
abgelehnt** — eine Lücke ist kein Nein.

## Zwei Profile vergleichen

Beide Seiten exportieren ihren Bogen als Markdown und laden die zwei Dateien in
die Vergleichsansicht. Auch das läuft lokal. Das Ergebnis nennt Übereinstimmungen
und Grenzen, aber **keinen Prozentwert**: ein Treffer ist ein Gesprächsanlass,
keine Erlaubnis.

## Selbst bauen

```sh
python3 tools/content.py     # Übersetzungen und Erklärungen einspielen
python3 tools/build.py       # eine Datei daraus machen
bash    tools/test/all.sh    # alle Prüfungen
bash    tools/dist.sh        # Verteilkopie und Prüfsumme
```

Das **Ausgangsmaterial** (eine Roh-Checkliste) liegt nicht im Repository. Die
daraus kuratierten Items stehen vollständig in `data/`, der Bogen lässt sich also
bauen und prüfen. Nur `tools/extract.py` und `tools/curate.py` brauchen die
Rohdatei; `tools/test/all.sh` überspringt beide, wenn sie fehlt.

`SPEC.md` beschreibt die Entwurfsentscheidungen und ihre Gründe.

## Mitarbeiten

Nach dem Klonen den Schutzhaken einschalten — er verhindert Commits unter
Klarnamen und meldet, wenn die Zeitzone den Aufenthaltsort verrät:

```sh
cp tools/hooks/pre-commit .git/hooks/ && chmod +x .git/hooks/pre-commit
bash tools/spuren.sh          # dieselbe Prüfung von Hand
TZ=UTC git commit -m "…"      # Commits ohne Zeitzone
```

## Lizenz

**CC BY-SA 4.0** — teilen und bearbeiten, auch kommerziell. Zwei Bedingungen:
nenne `cravingtiger` als Quelle, und gib Bearbeitungen unter derselben Lizenz
weiter. Siehe `LICENSE`.

## Sicherheit und Haltung

Der Bogen setzt freiwillige, informierte und jederzeit widerrufbare Zustimmung
voraus, dazu klare Stoppsignale. Praktiken mit erhöhtem Risiko sind als solche
gekennzeichnet und lassen sich nicht pauschal mitbewerten — sie verlangen eine
eigene Entscheidung. Rechtshinweise im Text beziehen sich auf deutsches Recht
und sind keine Rechtsberatung.
