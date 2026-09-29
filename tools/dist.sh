#!/bin/sh
# Erzeugt die Verteilkopie und ihre Pruefsumme.
set -e
cd "$(dirname "$0")/.."
python3 tools/build.py
mkdir -p dist
cat KinkCompass.html > dist/KinkCompass.html
chmod 644 dist/KinkCompass.html
xattr -c dist/KinkCompass.html 2>/dev/null || true

echo
echo "== Prüfung auf identifizierende Spuren =="
fail=0
# Die Suchmuster werden ZUR LAUFZEIT abgeleitet und stehen bewusst nicht in
# dieser Datei: ein Muster wie "nachname" im Repository veroeffentlicht genau
# den Namen, den es verbergen soll. Quellen sind die globale Git-Identitaet,
# der Anmeldename und das Heimatverzeichnis — alles lokal, nichts davon wandert
# in einen Commit.
muster_bauen() {
  gn=$(git config --global user.name  2>/dev/null || echo '')
  ge=$(git config --global user.email 2>/dev/null || echo '')
  un=$(id -un 2>/dev/null || echo '')
  hb=$(basename "${HOME:-/}" 2>/dev/null || echo '')
  # Endungen und Allerweltswoerter: aus "…@beispiel.net" faellt sonst das
  # Fragment "net", und das steckt in "geoeffnet".
  STOPP='net|com|org|dev|dei|dies|dass|dem|dir|dieser|dein|dies|dass|mail|users|user|home|local|noreply|name|info|web|test|data|main|src|tools'
  # Wortbestandteile, klein, ohne Dubletten und ohne Stoppwoerter
  eigen=$(printf '%s %s %s %s' "$gn" "$ge" "$un" "$hb" \
    | tr 'A-ZÄÖÜ' 'a-zäöü' | tr -cs 'a-z0-9äöü' '\n' \
    | awk 'length($0)>=3' | grep -vxE "$STOPP" | sort -u | paste -sd'|' -)
  # allgemeine Muster, die niemanden benennen
  allg='/Users/|/home/|@gmail|@gmx|@web\.de|@googlemail'   # spuren:ignore
  [ -n "$eigen" ] && printf '%s|%s' "$allg" "$eigen" || printf '%s' "$allg"
}
for p in "$(muster_bauen)" "127\.0\.0\.1" "localhost" \
         "\bfetch\(" "XMLHttpRequest" "WebSocket" "sendBeacon" "<iframe" "<script src" \
         "<link" "@import" "[^A-Za-z_$]eval\("; do
  n=$(grep -o -i -E -- "$p" dist/KinkCompass.html 2>/dev/null | wc -l | tr -d ' ')
  [ "$n" = "0" ] || { printf '  GEFUNDEN  %-18s %s\n' "$p" "$n"; fail=1; }
done
[ "$fail" = "0" ] && echo "  sauber: kein Name, kein Pfad, kein Netzwerkzugriff, keine externe Ressource"

echo
echo "== Verteilkopie =="
ls -l dist/KinkCompass.html | awk '{printf "  %s Bytes\n", $5}'
printf '  SHA-256  '
shasum -a 256 dist/KinkCompass.html | cut -d' ' -f1
exit $fail
