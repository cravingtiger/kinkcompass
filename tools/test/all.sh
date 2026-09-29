#!/bin/sh
# Baut die App neu und laesst alle Pruefungen laufen.
set -e
cd "$(dirname "$0")/../.."
# Das Ausgangsmaterial liegt nicht im Repository (siehe .gitignore). Wer klont,
# hat die kuratierten Daten in data/ — damit laesst sich alles bauen und pruefen,
# nur die beiden ersten Schritte entfallen. Ohne diese Weiche braeche der Testlauf
# direkt nach dem Klonen ab.
if [ -f "Umfassende BDSM- und Kink-Checkliste für einwilligende Erwachsene.md" ]; then
  python3 tools/extract.py >/dev/null
  python3 tools/curate.py
else
  echo "Ausgangsmaterial nicht vorhanden — extract.py und curate.py übersprungen."
  echo "    (die kuratierten Daten in data/ werden verwendet)"
fi
python3 tools/content.py
# Die Ids sind eingefroren (data/ids.lock). Beide Pruefungen muessen vor den
# Tests laufen: ein gebrochener Id-Verweis faellt sonst nur dort auf, wo ein
# Test zufaellig hinsieht.
python3 tools/lockids.py
python3 tools/checkids.py
python3 tools/report.py
python3 tools/audit.py
python3 tools/build.py
node tools/test/run.js
node tools/test/render.js
node tools/test/storage.js
node tools/test/compare.js
node tools/test/migrate.js
node tools/test/rollen.js
