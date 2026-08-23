#!/usr/bin/env bash
# The adapter boundary, enforced rather than remembered.
#
# Only src/lib/adapters/ may DEPEND on which grievance system is on the other end. If the
# vendor leaks upward as an import or an identifier, adding EPFO stops being "one file" and the
# claim we make about the architecture stops being true.
#
# Prose is deliberately exempt. Pages are allowed — required, really — to tell a citizen which
# system this is simulating; that is disclosure, not coupling. What is banned is code that
# knows: imports, identifiers, type names.
set -uo pipefail
cd "$(dirname "$0")/.."

leaks=$(grep -rniE \
  "(^|[^a-z])import[^\"']*[\"'][^\"']*cpgrams|[A-Za-z_]CPGRAMS|CPGRAMS[A-Za-z_]|cpgrams[_-]|[_-]cpgrams|cpgrams[A-Za-z]" \
  --include='*.ts' --include='*.tsx' src/ \
  | grep -v '^src/lib/adapters/' || true)

if [ -n "$leaks" ]; then
  echo "LEAK: the vendor escaped the adapter boundary"
  echo "$leaks"
  exit 1
fi
echo "adapter boundary OK — the vendor is named only in prose outside src/lib/adapters/"
