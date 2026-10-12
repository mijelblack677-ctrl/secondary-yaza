# -*- coding: utf-8 -*-
"""
make_reference.py — build a styled reference.docx for Pandoc
Run once:
    python3 make_reference.py
Produces:
    build/reference.docx
"""

from pathlib import Path
from docx import Document
from docx.shared import Pt, RGBColor, Inches
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml.ns import qn
from docx.oxml import OxmlElement


BANNER_BLUE = "1B3A6B"
ACCENT_BLUE = "0D47A1"
BODY_FONT   = "Calibri"
HEAD_FONT   = "Calibri Light"


def shade(paragraph, hex_color):
    pPr = paragraph._p.get_or_add_pPr()
    shd = OxmlElement('w:shd')
    shd.set(qn('w:val'), 'clear')
    shd.set(qn('w:color'), 'auto')
    shd.set(qn('w:fill'), hex_color)
    pPr.append(shd)


def set_style_font(style, name, size, bold=False, color=None):
    style.font.name = name
    style.font.size = Pt(size)
    style.font.bold = bold
    if color:
        style.font.color.rgb = RGBColor.from_string(color)
    # East Asian font fallback
    rpr = style.element.get_or_add_rPr()
    rfonts = rpr.find(qn('w:rFonts'))
    if rfonts is None:
        rfonts = OxmlElement('w:rFonts')
        rpr.append(rfonts)
    rfonts.set(qn('w:ascii'), name)
    rfonts.set(qn('w:hAnsi'), name)
    rfonts.set(qn('w:cs'), name)


def main():
    doc = Document()

    # Page setup
    for section in doc.sections:
        section.left_margin = Inches(0.7)
        section.right_margin = Inches(0.7)
        section.top_margin = Inches(0.7)
        section.bottom_margin = Inches(0.7)

    styles = doc.styles

    # Normal body
    set_style_font(styles['Normal'], BODY_FONT, 11)
    styles['Normal'].paragraph_format.space_after = Pt(6)
    styles['Normal'].paragraph_format.line_spacing = 1.15

    # Headings — Pandoc maps "# " to "Heading 1", etc.
    set_style_font(styles['Heading 1'], HEAD_FONT, 22, bold=True, color=BANNER_BLUE)
    set_style_font(styles['Heading 2'], HEAD_FONT, 16, bold=True, color=BANNER_BLUE)
    set_style_font(styles['Heading 3'], HEAD_FONT, 13, bold=True, color=ACCENT_BLUE)
    set_style_font(styles['Heading 4'], HEAD_FONT, 12, bold=True, color=ACCENT_BLUE)

    # Title style (Pandoc uses "Title" for YAML title)
    if 'Title' in [s.name for s in styles]:
        set_style_font(styles['Title'], HEAD_FONT, 26, bold=True, color=BANNER_BLUE)

    # Subtitle
    if 'Subtitle' in [s.name for s in styles]:
        set_style_font(styles['Subtitle'], HEAD_FONT, 12, bold=False, color="616161")

    # Quote style → we'll use this for colored boxes in markdown
    set_style_font(styles['Quote'], BODY_FONT, 11)
    styles['Quote'].paragraph_format.left_indent = Inches(0.15)
    styles['Quote'].paragraph_format.right_indent = Inches(0.15)

    # Save
    out = Path("build/reference.docx")
    out.parent.mkdir(parents=True, exist_ok=True)
    doc.save(out)
    print(f"✅ Reference docx created: {out}")


if __name__ == '__main__':
    main()
