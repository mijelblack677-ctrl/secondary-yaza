#!/usr/bin/env bash
# build.sh — Patch Method v3 (real math via Pandoc)
# Usage:
#   ./build.sh content/physics/form4/electricity/PHY_F4_ELEC_M1_Current.md

set -e

if [ -z "$1" ]; then
  echo "Usage: ./build.sh <path_to_md>"
  exit 1
fi

MD="$1"
BASENAME=$(basename "$MD" .md)

mkdir -p output/docx output/website
mkdir -p build

# Ensure reference.docx exists
if [ ! -f build/reference.docx ]; then
  echo "⚙  Building reference.docx..."
  python3 make_reference.py
fi

echo "📄 Building DOCX (real Word equations)..."
pandoc "$MD" \
  -o "output/docx/${BASENAME}.docx" \
  --reference-doc=build/reference.docx \
  --from markdown+tex_math_dollars+pipe_tables+smart \
  --toc --toc-depth=2 \
  --number-sections \
  --metadata title="" 2>/dev/null || \
pandoc "$MD" \
  -o "output/docx/${BASENAME}.docx" \
  --reference-doc=build/reference.docx \
  --from markdown+tex_math_dollars+pipe_tables+smart \
  --toc --toc-depth=2

echo "🌐 Building HTML (MathJax for equations)..."
pandoc "$MD" \
  -o "output/website/${BASENAME}.html" \
  --from markdown+tex_math_dollars+pipe_tables+smart \
  --standalone \
  --mathjax \
  --css=../style.css \
  --metadata title="Malawi Science Books"

echo ""
echo "✅ Done."
echo "   DOCX → output/docx/${BASENAME}.docx"
echo "   HTML → output/website/${BASENAME}.html"
