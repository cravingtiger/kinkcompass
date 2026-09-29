#!/bin/sh
# Prueft, was beim Veroeffentlichen ueber die Autorin verraten wuerde.
#
# tools/dist.sh prueft die eine HTML-Datei. Hier geht es um das Repository:
# Git schreibt Name, Mail und Zeitzone in JEDEN Commit, und eine Historie laesst
# sich nach dem Push nicht mehr still korrigieren.
#
# Aufruf ohne Argument prueft den Arbeitsstand; "--staged" nur das Vorgemerkte
# (so ruft der pre-commit-Haken es auf).
set -e
cd "$(dirname "$0")/.."
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
MUSTER=$(muster_bauen)

echo "== Git-Identität =="
n=$(git config user.name  2>/dev/null || echo '')
m=$(git config user.email 2>/dev/null || echo '')
printf '  Name  %s\n  Mail  %s\n' "${n:-（leer）}" "${m:-（leer）}"
case "$n$m" in
  *PSEUDONYM-NICHT-GESETZT*|*example.invalid*)
    echo "  OFFEN: noch kein Pseudonym gesetzt."
    echo "         git config user.name  \"…\""
    echo "         git config user.email \"…@users.noreply.github.com\""
    fail=1 ;;
  '') echo "  FEHLER: keine Identität gesetzt."; fail=1 ;;
esac
if printf '%s %s' "$n" "$m" | grep -qiE "$MUSTER"; then
  echo "  FEHLER: die Identität enthält einen Klarnamen oder eine echte Adresse."
  fail=1
fi
g=$(git config --global user.email 2>/dev/null || echo '')
[ -n "$g" ] && [ "$g" = "$m" ] && { echo "  FEHLER: identisch mit der globalen Identität."; fail=1; }

echo
echo "== Zeitzone der Commits =="
tz=$(git log -1 --format=%ai 2>/dev/null | awk '{print $3}')
if [ -z "$tz" ]; then
  echo "  noch keine Commits"
elif [ "$tz" = "+0000" ]; then
  echo "  +0000 — verrät keinen Aufenthaltsort"
else
  echo "  $tz — verrät deine Zeitzone. Mit TZ=UTC committen:"
  echo "         TZ=UTC git commit -m \"…\""
  fail=1
fi

echo
echo "== Inhalte =="
if [ "$1" = "--staged" ]; then
  liste=$(git diff --cached --name-only --diff-filter=ACM)
else
  liste=$(git ls-files 2>/dev/null; git ls-files --others --exclude-standard 2>/dev/null)
fi
treffer=0
for f in $liste; do
  [ -f "$f" ] || continue
  # Zeilenweise Ausnahme statt Dateiausnahme: eine ganze Datei auszunehmen war
  # der Fehler, durch den die Musterliste selbst — und damit der Klarname —
  # beinahe veroeffentlicht worden waere.
  fund=$(grep -niE "$MUSTER" "$f" 2>/dev/null | grep -v 'spuren:ignore' || true)
  if [ -n "$fund" ]; then
    printf '  GEFUNDEN  %s\n' "$f"
    printf '%s\n' "$fund" | head -3 | sed 's/^/            /'
    treffer=1; fail=1
  fi
done
[ "$treffer" = "0" ] && echo "  kein Klarname, keine Adresse, kein Benutzerpfad"

echo
[ "$fail" = "0" ] && echo "Bereit zum Veröffentlichen." || echo "NICHT bereit — siehe oben."
exit $fail
