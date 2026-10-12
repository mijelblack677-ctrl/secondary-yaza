# -*- coding: utf-8 -*-
"""
build_ch09_em_induction.py
Chapter 9 — Electromagnetic Induction  ·  Malawi Form 4 MSCE Physics
Warm voice · Malawian examples · teaching diagrams · no placeholders.

    python3 build_ch09_em_induction.py
"""

import os
import math
from docx import Document
from docx.shared import Pt, RGBColor, Inches
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_BREAK
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml.ns import qn
from docx.oxml import OxmlElement
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import matplotlib.patches as patches
import numpy as np


# ═══════════════════════════════════════════════════════════
BANNER_BLUE  = "1B3A6B"
ACCENT_BLUE  = "0D47A1"
BIG_IDEA     = "FFF9C4"
HOOK_BG      = "FFF3E0"
STRUGGLE     = "FCE4EC"
KEY_POINTS   = "E8F5E9"
WORKED       = "E3F2FD"
CHECK        = "FFFDE7"
EXAM_Q       = "FFF8E1"
SOLUTIONS    = "F1F8E9"
MISTAKES     = "FFEBEE"
EXAM_TIP     = "FFF3E0"
REMEMBER_RED = "C62828"
WHITE        = "FFFFFF"
IMG_DIR      = "ch09_images"


# ═══════════════════════════════════════════════════════════
def set_cell_shading(cell, hex_color):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = OxmlElement('w:shd')
    shd.set(qn('w:val'), 'clear'); shd.set(qn('w:color'), 'auto')
    shd.set(qn('w:fill'), hex_color); tcPr.append(shd)


def shade_paragraph(p, hex_color):
    pPr = p._p.get_or_add_pPr()
    shd = OxmlElement('w:shd')
    shd.set(qn('w:val'), 'clear'); shd.set(qn('w:color'), 'auto')
    shd.set(qn('w:fill'), hex_color); pPr.append(shd)


def set_cell_borders(cell, color="BDBDBD", sz="6"):
    tcPr = cell._tc.get_or_add_tcPr()
    borders = OxmlElement('w:tcBorders')
    for edge in ('top', 'left', 'bottom', 'right'):
        el = OxmlElement(f'w:{edge}')
        el.set(qn('w:val'), 'single'); el.set(qn('w:sz'), sz)
        el.set(qn('w:space'), '0'); el.set(qn('w:color'), color)
        borders.append(el)
    tcPr.append(borders)


def set_cell_margins(cell, top=120, left=200, bottom=120, right=200):
    tcPr = cell._tc.get_or_add_tcPr()
    mar = OxmlElement('w:tcMar')
    for name, val in (('top', top), ('left', left), ('bottom', bottom), ('right', right)):
        el = OxmlElement(f'w:{name}')
        el.set(qn('w:w'), str(val)); el.set(qn('w:type'), 'dxa')
        mar.append(el)
    tcPr.append(mar)


def add_banner(doc, title, subtitle):
    t = doc.add_table(rows=1, cols=1); t.alignment = WD_TABLE_ALIGNMENT.CENTER
    c = t.cell(0, 0); set_cell_shading(c, BANNER_BLUE)
    set_cell_margins(c, 220, 240, 220, 240)
    p = c.paragraphs[0]; p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = p.add_run(title); r.bold = True; r.font.size = Pt(22)
    r.font.color.rgb = RGBColor.from_string(WHITE)
    p2 = c.add_paragraph(); p2.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r2 = p2.add_run(subtitle); r2.italic = True; r2.font.size = Pt(10)
    r2.font.color.rgb = RGBColor.from_string("E0E0E0")
    doc.add_paragraph()


def add_inline(paragraph, text):
    import re
    tokens = re.split(r'(\*\*[^*]+\*\*|\*[^*]+\*|\$[^$]+\$)', text)
    for tok in tokens:
        if not tok: continue
        if tok.startswith('**') and tok.endswith('**'):
            r = paragraph.add_run(tok[2:-2]); r.bold = True
        elif tok.startswith('*') and tok.endswith('*') and len(tok) > 2:
            r = paragraph.add_run(tok[1:-1]); r.italic = True
        elif tok.startswith('$') and tok.endswith('$'):
            r = paragraph.add_run(tok[1:-1]); r.italic = True
            r.font.name = "Cambria Math"
        else:
            paragraph.add_run(tok)


def add_box(doc, title, body_lines, fill_color, title_color=BANNER_BLUE, title_size=13):
    t = doc.add_table(rows=1, cols=1); t.alignment = WD_TABLE_ALIGNMENT.CENTER
    c = t.cell(0, 0); set_cell_shading(c, fill_color)
    set_cell_borders(c, color="BDBDBD"); set_cell_margins(c, 140, 220, 140, 220)
    if title:
        p = c.paragraphs[0]
        r = p.add_run(title); r.bold = True; r.font.size = Pt(title_size)
        r.font.color.rgb = RGBColor.from_string(title_color)
    else:
        c.paragraphs[0].text = ""
    for line in body_lines:
        bp = c.add_paragraph(); bp.paragraph_format.space_after = Pt(3)
        add_inline(bp, line)
    doc.add_paragraph()


def add_heading(doc, text, level=1):
    if level == 1:
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(18); p.paragraph_format.space_after = Pt(8)
        r = p.add_run(text); r.bold = True; r.font.size = Pt(20)
        r.font.color.rgb = RGBColor.from_string(BANNER_BLUE)
    elif level == 2:
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(14); p.paragraph_format.space_after = Pt(6)
        r = p.add_run(text); r.bold = True; r.font.size = Pt(15)
        r.font.color.rgb = RGBColor.from_string(BANNER_BLUE)
    else:
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(10); p.paragraph_format.space_after = Pt(4)
        r = p.add_run(text); r.bold = True; r.font.size = Pt(12)
        r.font.color.rgb = RGBColor.from_string(ACCENT_BLUE)


def add_para(doc, text):
    p = doc.add_paragraph(); add_inline(p, text); return p


def add_equation(doc, text, boxed=False, note=""):
    p = doc.add_paragraph(); p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(8); p.paragraph_format.space_after = Pt(8)
    r = p.add_run(text); r.italic = True
    r.font.name = "Cambria Math"; r.font.size = Pt(14)
    if boxed: shade_paragraph(p, "FFFDE7")
    if note:
        pn = doc.add_paragraph(); pn.alignment = WD_ALIGN_PARAGRAPH.CENTER
        rn = pn.add_run(note); rn.italic = True; rn.font.size = Pt(10)
        rn.font.color.rgb = RGBColor.from_string("616161")


def add_image(doc, path, caption, width_inches=5.4):
    if not os.path.exists(path):
        add_para(doc, f"[missing figure: {path}]"); return
    doc.add_picture(path, width=Inches(width_inches))
    doc.paragraphs[-1].alignment = WD_ALIGN_PARAGRAPH.CENTER
    p = doc.add_paragraph(); p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = p.add_run(caption); r.italic = True; r.font.size = Pt(9.5)
    r.font.color.rgb = RGBColor.from_string("455A64")
    doc.add_paragraph()


def add_remember_strip(doc, text):
    t = doc.add_table(rows=1, cols=1)
    c = t.cell(0, 0); set_cell_shading(c, REMEMBER_RED)
    set_cell_margins(c, 160, 220, 160, 220)
    p = c.paragraphs[0]; p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = p.add_run("REMEMBER  •  " + text)
    r.bold = True; r.font.size = Pt(11)
    r.font.color.rgb = RGBColor.from_string(WHITE)
    doc.add_paragraph()


def add_table(doc, headers, rows, header_bg=BANNER_BLUE):
    t = doc.add_table(rows=len(rows) + 1, cols=len(headers))
    t.alignment = WD_TABLE_ALIGNMENT.CENTER
    for i, h in enumerate(headers):
        c = t.cell(0, i); set_cell_shading(c, header_bg)
        set_cell_margins(c, 80, 120, 80, 120)
        p = c.paragraphs[0]; p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r = p.add_run(h); r.bold = True; r.font.size = Pt(10)
        r.font.color.rgb = RGBColor.from_string(WHITE)
    for ri, row in enumerate(rows, start=1):
        for ci, val in enumerate(row):
            c = t.cell(ri, ci); set_cell_margins(c, 70, 120, 70, 120)
            set_cell_borders(c)
            p = c.paragraphs[0]; add_inline(p, val)
            for r in p.runs: r.font.size = Pt(10)
    doc.add_paragraph()


def page_break(doc):
    doc.add_paragraph().add_run().add_break(WD_BREAK.PAGE)


# ═══════════════════════════════════════════════════════════
# DIAGRAMS
# ═══════════════════════════════════════════════════════════
def make_diagrams():
    os.makedirs(IMG_DIR, exist_ok=True)

    # ── Fig 1: Magnet moving in and out of a coil ──
    fig, ax = plt.subplots(figsize=(7.2, 3.4))
    ax.set_xlim(0, 12); ax.set_ylim(0, 5); ax.axis('off')

    # Coil
    for i in range(6):
        x = 4 + i * 0.45
        ax.add_patch(patches.Ellipse((x, 2.5), 0.15, 1.8, fill=False,
                                      ec="#C62828", lw=1.8))

    # Magnet moving into coil
    ax.add_patch(patches.Rectangle((1.2, 2.1), 1.4, 0.35,
                                    color="#C62828", ec="#7F0000"))
    ax.add_patch(patches.Rectangle((1.2, 2.45), 1.4, 0.35,
                                    color="#0D47A1", ec="#0A2540"))
    ax.text(1.9, 2.28, "N", ha='center', va='center', fontsize=10,
            color="white", fontweight='bold')
    ax.text(1.9, 2.63, "S", ha='center', va='center', fontsize=10,
            color="white", fontweight='bold')
    ax.annotate("", xy=(3.6, 2.6), xytext=(2.7, 2.6),
                arrowprops=dict(arrowstyle="->", lw=2.5, color="#2E7D32"))
    ax.text(3.0, 3.15, "move", fontsize=9, color="#2E7D32")

    # Galvanometer
    ax.add_patch(patches.Rectangle((8.5, 2.0), 1.6, 1.0,
                                    color="#90CAF9", ec="#0D47A1"))
    ax.text(9.3, 2.5, "G", ha='center', va='center', fontsize=14,
            color="white", fontweight='bold')
    # wires from coil to meter
    ax.plot([6.7, 6.7, 8.5, 8.5], [2.5, 1.2, 1.2, 2.0], color="#37474F", lw=1.5)
    ax.plot([6.7, 6.7, 9.3, 9.3], [2.5, 4.0, 4.0, 3.0], color="#37474F", lw=1.5)

    ax.text(6, 4.6, "Moving a magnet into a coil induces a current",
            ha='center', fontsize=10.5, fontweight='bold', color="#1B3A6B")
    ax.text(6, 0.6, "Current flows only while the magnet is moving.",
            ha='center', fontsize=9, style='italic', color="#37474F")

    plt.tight_layout()
    plt.savefig(f"{IMG_DIR}/fig1_induction.png", dpi=150, bbox_inches='tight')
    plt.close()

    # ── Fig 2: Lenz's law ──
    fig, ax = plt.subplots(figsize=(6.8, 3.2))
    ax.set_xlim(0, 11); ax.set_ylim(0, 5); ax.axis('off')

    # Coil
    for i in range(5):
        x = 5 + i * 0.5
        ax.add_patch(patches.Ellipse((x, 2.5), 0.15, 1.8, fill=False,
                                      ec="#C62828", lw=1.8))

    # Magnet approaching from left
    ax.add_patch(patches.Rectangle((2, 2.1), 1.5, 0.35,
                                    color="#C62828", ec="#7F0000"))
    ax.add_patch(patches.Rectangle((2, 2.45), 1.5, 0.35,
                                    color="#0D47A1", ec="#0A2540"))
    ax.text(2.75, 2.28, "N", ha='center', va='center', fontsize=10,
            color="white", fontweight='bold')
    ax.text(2.75, 2.63, "S", ha='center', va='center', fontsize=10,
            color="white", fontweight='bold')
    ax.annotate("", xy=(4.4, 2.6), xytext=(3.6, 2.6),
                arrowprops=dict(arrowstyle="->", lw=2.5, color="#2E7D32"))
    ax.text(3.8, 3.15, "approach", fontsize=9, color="#2E7D32")

    # Induced N pole facing the magnet
    ax.text(5.0, 1.65, "N", ha='center', va='center', fontsize=12,
            color="#C62828", fontweight='bold')
    ax.text(5.0, 3.35, "Induced N pole repels approaching N",
            ha='center', fontsize=9, style='italic', color="#C62828")

    ax.text(5.5, 4.6, "Lenz's law: the induced effect OPPOSES the change",
            ha='center', fontsize=10.5, fontweight='bold', color="#1B3A6B")
    ax.text(5.5, 0.5, "Nature always tries to keep things as they are.",
            ha='center', fontsize=9, style='italic', color="#37474F")

    plt.tight_layout()
    plt.savefig(f"{IMG_DIR}/fig2_lenz.png", dpi=150, bbox_inches='tight')
    plt.close()

    # ── Fig 3: Mutual induction / transformer ──
    fig, ax = plt.subplots(figsize=(7.0, 3.6))
    ax.set_xlim(0, 12); ax.set_ylim(0, 5); ax.axis('off')

    # Iron core (rectangle)
    ax.add_patch(patches.Rectangle((3, 1.5), 6, 2.0,
                                    fill=False, ec="#455A64", lw=4))

    # Primary coil (left side)
    for i in range(5):
        y = 2.0 + i * 0.3
        ax.add_patch(patches.Rectangle((3.05, y), 0.25, 0.15,
                                        color="#C62828"))
    ax.text(3.2, 3.7, "Primary", ha='center', fontsize=9,
            color="#C62828", fontweight='bold')
    ax.text(3.2, 4.05, "N_p", ha='center', fontsize=11,
            color="#C62828", fontweight='bold')

    # Secondary coil (right side)
    for i in range(8):
        y = 1.7 + i * 0.25
        ax.add_patch(patches.Rectangle((8.7, y), 0.25, 0.15,
                                        color="#0D47A1"))
    ax.text(8.7, 3.7, "Secondary", ha='center', fontsize=9,
            color="#0D47A1", fontweight='bold')
    ax.text(8.7, 4.05, "N_s", ha='center', fontsize=11,
            color="#0D47A1", fontweight='bold')

    # AC source
    ax.add_patch(patches.Circle((1.2, 2.5), 0.4, fill=False,
                                 ec="#37474F", lw=1.5))
    ax.text(1.2, 2.5, "~", ha='center', va='center', fontsize=16,
            color="#37474F")
    ax.plot([1.6, 3.05], [2.5, 2.5], color="#37474F", lw=1.2)
    ax.text(1.2, 1.5, "AC", ha='center', fontsize=9, color="#37474F")

    # Load
    ax.add_patch(patches.Circle((10.5, 2.5), 0.35, fill=False,
                                 ec="#2E7D32", lw=1.5))
    ax.text(10.5, 2.5, "R", ha='center', va='center', fontsize=11,
            color="#2E7D32", fontweight='bold')
    ax.plot([8.95, 10.15], [2.5, 2.5], color="#37474F", lw=1.2)

    ax.text(6, 4.6, "Mutual induction in a transformer",
            ha='center', fontsize=11, fontweight='bold', color="#1B3A6B")
    ax.text(6, 0.7, "Changing current in primary → changing flux → induced emf in secondary",
            ha='center', fontsize=9, style='italic', color="#37474F")

    plt.tight_layout()
    plt.savefig(f"{IMG_DIR}/fig3_transformer.png", dpi=150, bbox_inches='tight')
    plt.close()

    # ── Fig 4: Power transmission ──
    fig, ax = plt.subplots(figsize=(7.2, 3.2))
    ax.set_xlim(0, 12); ax.set_ylim(0, 4); ax.axis('off')

    # Power station
    ax.add_patch(patches.Rectangle((0.5, 1.5), 1.3, 1.3,
                                    color="#455A64"))
    ax.text(1.15, 3.15, "power\nstation", ha='center', fontsize=9,
            fontweight='bold', color="#37474F")

    # Step-up transformer
    ax.add_patch(patches.Rectangle((2.5, 1.5), 0.9, 1.3,
                                    color="#C62828", ec="#7F0000"))
    ax.text(2.95, 3.15, "step-up\ntransformer", ha='center', fontsize=8.5,
            fontweight='bold', color="#C62828")
    ax.text(2.95, 2.15, "Np<Ns", ha='center', fontsize=8, color="white",
            fontweight='bold')

    # Transmission line
    ax.plot([3.4, 8.6], [2.5, 2.5], color="#37474F", lw=2.5)
    for x in [4.5, 6.0, 7.5]:
        ax.plot([x, x], [2.5, 3.3], color="#37474F", lw=1)
        ax.plot([x-0.15, x+0.15], [3.3, 3.3], color="#37474F", lw=1)
    ax.text(6, 3.55, "high-voltage transmission line",
            ha='center', fontsize=9, style='italic', color="#37474F")

    # Step-down transformer
    ax.add_patch(patches.Rectangle((8.6, 1.5), 0.9, 1.3,
                                    color="#0D47A1", ec="#0A2540"))
    ax.text(9.05, 3.15, "step-down\ntransformer", ha='center', fontsize=8.5,
            fontweight='bold', color="#0D47A1")
    ax.text(9.05, 2.15, "Np>Ns", ha='center', fontsize=8, color="white",
            fontweight='bold')

    # Homes/factories
    ax.add_patch(patches.Rectangle((10.0, 1.5), 1.5, 1.3,
                                    color="#A5D6A7", ec="#2E7D32"))
    ax.text(10.75, 3.15, "homes,\nfactories", ha='center', fontsize=9,
            fontweight='bold', color="#2E7D32")

    ax.text(6, 0.7, "Why we transmit at high voltage: less current, less heat loss",
            ha='center', fontsize=9.5, style='italic', color="#37474F")

    plt.tight_layout()
    plt.savefig(f"{IMG_DIR}/fig4_transmission.png", dpi=150, bbox_inches='tight')
    plt.close()

    # ── Fig 5: Applications ──
    fig, ax = plt.subplots(figsize=(7.2, 3.2))
    ax.set_xlim(0, 12); ax.set_ylim(0, 4); ax.axis('off')

    # Generator
    ax.add_patch(patches.Circle((1.8, 2.0), 0.7, fill=False,
                                 ec="#0D47A1", lw=2))
    ax.add_patch(patches.Circle((1.8, 2.0), 0.25, fill=True,
                                 color="#0D47A1"))
    ax.text(1.8, 3.3, "generator", ha='center', fontsize=9,
            fontweight='bold', color="#0D47A1")

    # Induction cooker
    ax.add_patch(patches.Rectangle((4.2, 1.5), 1.4, 0.5,
                                    color="#455A64"))
    ax.add_patch(patches.Circle((4.9, 2.3), 0.25, fill=False,
                                 ec="#C62828", lw=2))
    ax.text(4.9, 3.3, "induction\ncooker", ha='center', fontsize=9,
            fontweight='bold', color="#C62828")

    # Metal detector
    ax.plot([7.5, 8.5], [2.4, 2.4], color="#37474F", lw=2)
    ax.add_patch(patches.Circle((8.5, 2.4), 0.4, fill=False,
                                 ec="#2E7D32", lw=2))
    ax.text(8.0, 3.3, "metal detector", ha='center', fontsize=9,
            fontweight='bold', color="#2E7D32")

    # Microphone
    ax.add_patch(patches.Ellipse((10.8, 2.2), 0.5, 1.0,
                                  color="#90CAF9", ec="#0D47A1"))
    ax.text(10.8, 3.3, "microphone", ha='center', fontsize=9,
            fontweight='bold', color="#0D47A1")

    ax.text(6, 0.6, "Applications of electromagnetic induction",
            ha='center', fontsize=11, fontweight='bold', color="#1B3A6B")

    plt.tight_layout()
    plt.savefig(f"{IMG_DIR}/fig5_applications.png", dpi=150, bbox_inches='tight')
    plt.close()

    print(f"✅ Diagrams generated in {IMG_DIR}/")


# ═══════════════════════════════════════════════════════════
def build():
    make_diagrams()
    doc = Document()
    for section in doc.sections:
        section.left_margin = Inches(0.75); section.right_margin = Inches(0.75)
        section.top_margin = Inches(0.75); section.bottom_margin = Inches(0.75)

    add_banner(doc, "CHAPTER 9 — Electromagnetic Induction",
               "Physics  ·  Form 4  ·  MSCE  ·  Malawian Science Books")

    add_para(doc, "")
    add_para(doc, "**Welcome to Chapter 9.** This is the chapter that made the modern world possible. Every power station in Malawi, every transformer on every pole, every generator — all use the same idea: **move a magnet near a wire, and you make electricity.**")
    add_para(doc, "Michael Faraday discovered this in 1831. It sounds simple, but it took the world from candlelight to electricity in a single generation. It powers the whole grid that lights your home, charges your phone, and runs the maize mill.")
    add_para(doc, "This is a big chapter — 8 sub-sections, transformers, power transmission, and the environmental impacts of making electricity. Take it slowly. By the end, you'll understand one of the deepest ideas in physics.")
    add_para(doc, "")

    # ═══════════════════════════════════════════════════════
    # 9.1 DEMONSTRATION
    # ═══════════════════════════════════════════════════════
    add_heading(doc, "9.1  Demonstration of Electromagnetic Induction", level=1)

    add_box(doc, "HAVE YOU EVER NOTICED…", [
        "Push a magnet into a coil of wire. The needle on the galvanometer jumps. Hold the magnet still — the needle returns to zero. Pull the magnet out — the needle jumps the other way. Something remarkable is happening."
    ], HOOK_BG)

    add_box(doc, "THE BIG IDEA", [
        "**A changing magnetic field near a conductor induces an emf (and if the circuit is closed, a current).** "
        "The key word is **changing** — a steady field produces nothing."
    ], BIG_IDEA)

    add_heading(doc, "The real concept", level=3)
    add_para(doc, "Faraday found that whenever the magnetic field through a coil changes, an electromotive force (emf) is induced. This emf drives a current if the coil is connected to a closed circuit.")
    add_para(doc, "It doesn't matter *how* the field changes — you can:")
    add_para(doc, "- Move a magnet in or out of a coil.")
    add_para(doc, "- Move the coil near a magnet.")
    add_para(doc, "- Change the current in a nearby coil.")
    add_para(doc, "- Rotate a coil in a magnetic field.")
    add_para(doc, "All of these change the magnetic flux through the coil, and all of them induce an emf.")

    add_image(doc, f"{IMG_DIR}/fig1_induction.png",
              "Figure 9.1 — Moving a magnet into a coil induces a current. Notice: current flows only while the magnet is moving. When it's still, the current is zero.")

    add_heading(doc, "What is magnetic flux?", level=3)
    add_para(doc, "Magnetic flux (symbol Φ) is a measure of how much magnetic field passes through a given area. It is the product of the field strength and the area perpendicular to it.")
    add_equation(doc, "Φ = B A cos θ", note="Φ = magnetic flux (weber, Wb); B = field strength (T); A = area (m²); θ = angle between field and normal to the area")

    add_heading(doc, "Faraday's law", level=3)
    add_para(doc, "The induced emf is proportional to the **rate of change** of magnetic flux:")
    add_equation(doc, "emf = −N × (ΔΦ / Δt)", note="N = number of turns; ΔΦ/Δt = rate of change of flux (Wb/s); negative sign = Lenz's law (see 9.3)")

    add_box(doc, "WHY STUDENTS FIND THIS DIFFICULT", [
        "- Missing the word **changing**. A steady magnetic field near a coil induces nothing.",
        "- Thinking the magnet must be inside the coil. It just needs to be moving relative to the coil — inside or outside.",
        "- Confusing **flux** (Φ) with **flux density** (B). Flux = B × A; it's measured in webers, not teslas.",
        "- Forgetting to square the time. Rate of change of flux uses Δt in the denominator.",
    ], STRUGGLE)

    add_box(doc, "KEY POINTS — 9.1", [
        "- Changing magnetic flux induces emf.",
        "- Steady flux → no emf.",
        "- Φ = BA (flux, in webers).",
        "- emf = −N (ΔΦ / Δt).",
        "- Ways to induce: move magnet, move coil, change current in nearby coil, rotate coil.",
    ], KEY_POINTS)

    add_box(doc, "IF YOU REMEMBER ONE THING", [
        "Change the flux → get an emf. Keep it steady → get nothing."
    ], BIG_IDEA, title_color="8B6914")

    page_break(doc)

    # ═══════════════════════════════════════════════════════
    # 9.2 FACTORS AFFECTING MAGNITUDE
    # ═══════════════════════════════════════════════════════
    add_heading(doc, "9.2  Factors Affecting the Magnitude of the Induced emf", level=1)

    add_box(doc, "HAVE YOU EVER NOTICED…", [
        "Moving the magnet in quickly gives a bigger kick than moving it slowly. Using two magnets instead of one gives a bigger kick. Using a coil with 500 turns instead of 50 gives a bigger kick. Many factors."
    ], HOOK_BG)

    add_box(doc, "THE BIG IDEA", [
        "**Four things increase the induced emf:** faster change, stronger magnet, more turns, "
        "and larger area of the coil."
    ], BIG_IDEA)

    add_heading(doc, "The four factors", level=3)

    add_table(doc,
        ["Factor", "Effect on induced emf"],
        [
            ["Speed of change (ΔΦ/Δt)", "Faster movement → bigger emf"],
            ["Strength of magnetic field (B)", "Stronger magnet → bigger emf"],
            ["Number of turns (N)", "More turns → bigger emf (roughly proportional)"],
            ["Area of coil (A)", "Bigger area → bigger flux → bigger emf"],
        ])

    add_para(doc, "All four work through the same principle: **the induced emf is proportional to the rate of change of flux through the coil.** Faster movement changes flux faster. More turns means more layers of wire, each experiencing the same changing flux. Bigger area means bigger flux for the same field.")

    add_box(doc, "WHY STUDENTS FIND THIS DIFFICULT", [
        "- Thinking stronger magnet alone is enough. If the magnet is not moving, no emf.",
        "- Forgetting that moving the magnet **out** is just as effective as moving it **in** — the emf magnitude is the same, only the direction reverses.",
        "- Thinking area is not important. It is — bigger coil means more flux.",
    ], STRUGGLE)

    add_box(doc, "KEY POINTS — 9.2", [
        "- Faster flux change → bigger emf.",
        "- Stronger B → bigger emf.",
        "- More turns N → bigger emf.",
        "- Bigger area A → bigger emf.",
    ], KEY_POINTS)

    add_box(doc, "IF YOU REMEMBER ONE THING", [
        "Faster, stronger, more turns, bigger area → bigger induced emf."
    ], BIG_IDEA, title_color="8B6914")

    page_break(doc)

    # ═══════════════════════════════════════════════════════
    # 9.3 LAWS OF EMI
    # ═══════════════════════════════════════════════════════
    add_heading(doc, "9.3  Laws of Electromagnetic Induction", level=1)

    add_box(doc, "HAVE YOU EVER NOTICED…", [
        "When you push a magnet into a coil, you feel a slight resistance. The coil pushes back. That is Lenz's law in action — physics insisting you pay energy for the electricity you make."
    ], HOOK_BG)

    add_box(doc, "THE BIG IDEA", [
        "**Faraday's law** tells you how much emf is induced. **Lenz's law** tells you which way "
        "the induced current flows: it always **opposes the change** that produced it."
    ], BIG_IDEA)

    add_heading(doc, "Faraday's law (already met in 9.1)", level=3)
    add_equation(doc, "emf = −N × (ΔΦ / Δt)")

    add_heading(doc, "Lenz's law", level=3)
    add_para(doc, "**The direction of the induced current is such that it opposes the change that produced it.**")
    add_para(doc, "If you push a magnet toward a coil, the coil produces a current that creates a magnetic field pushing the magnet **away**. If you pull the magnet away, the coil produces a current that tries to pull it **back**.")
    add_para(doc, "That's the origin of the negative sign in Faraday's law.")
    add_para(doc, "Lenz's law is a consequence of **conservation of energy**. If the induced current helped the change, you could get something for nothing — an endless supply of energy from a moving magnet. That would violate physics. So the induced effect must oppose the change.")

    add_image(doc, f"{IMG_DIR}/fig2_lenz.png",
              "Figure 9.2 — Lenz's law. A North pole approaches the coil. The coil induces a North pole on its near side to repel the magnet. The induced effect opposes the change.")

    add_heading(doc, "Why this matters practically", level=3)
    add_para(doc, "When you turn a generator, you have to do work against the Lenz forces. That work becomes the electrical energy you produce. The generator doesn't create energy — it converts mechanical work into electrical energy.")

    add_box(doc, "WHY STUDENTS FIND THIS DIFFICULT", [
        "- Forgetting the negative sign, or not understanding why it exists. It's not decoration — it's Lenz's law.",
        "- Thinking the induced current *helps* the change. It **opposes** it.",
        "- Confusing Lenz's law with conservation of momentum. It is conservation of **energy**.",
    ], STRUGGLE)

    add_box(doc, "KEY POINTS — 9.3", [
        "- Faraday's law: emf = −N (ΔΦ/Δt).",
        "- Lenz's law: induced current opposes the change.",
        "- Consequence of conservation of energy.",
        "- Practically: turning a generator requires work against Lenz forces.",
    ], KEY_POINTS)

    add_box(doc, "IF YOU REMEMBER ONE THING", [
        "Induced current always fights the change. Faraday tells you how much; Lenz tells you which way."
    ], BIG_IDEA, title_color="8B6914")

    page_break(doc)

    # ═══════════════════════════════════════════════════════
    # 9.4 MUTUAL INDUCTION
    # ═══════════════════════════════════════════════════════
    add_heading(doc, "9.4  Mutual Induction", level=1)

    add_box(doc, "HAVE YOU EVER NOTICED…", [
        "Two coils of wire, side by side, not touching. Change the current in one, and the other produces a current. No wires between them. Just magnetism doing the work."
    ], HOOK_BG)

    add_box(doc, "THE BIG IDEA", [
        "**Mutual induction is when a changing current in one coil induces an emf in a second, nearby coil.** "
        "This is the principle behind every transformer."
    ], BIG_IDEA)

    add_heading(doc, "The real concept", level=3)
    add_para(doc, "Take two coils and put them close together. Coil 1 (the **primary**) carries a changing current. This changing current creates a changing magnetic field. The changing field passes through Coil 2 (the **secondary**). By Faraday's law, the changing flux through Coil 2 induces an emf in it.")
    add_para(doc, "No electrical connection between the coils. The energy is transferred entirely through the magnetic field.")
    add_para(doc, "Two things make mutual induction stronger:")
    add_para(doc, "- **Iron core** linking the two coils — the iron concentrates the magnetic field and channels it from primary to secondary.")
    add_para(doc, "- **More turns** on both coils — more flux capture.")

    add_image(doc, f"{IMG_DIR}/fig3_transformer.png",
              "Figure 9.3 — Mutual induction. A changing current in the primary coil produces a changing flux that induces an emf in the secondary coil. The iron core channels the magnetic field between them.")

    add_box(doc, "WHY STUDENTS FIND THIS DIFFICULT", [
        "- Thinking the coils must touch. They must not — only the magnetic field links them.",
        "- Forgetting that the current in the primary must be **changing** (AC, not DC).",
        "- Confusing mutual induction with self-induction. Mutual = between two coils. Self = a single coil inducing emf in itself.",
    ], STRUGGLE)

    add_box(doc, "KEY POINTS — 9.4", [
        "- Mutual induction: current in primary → emf in secondary.",
        "- Requires changing current in primary.",
        "- The two coils are not electrically connected.",
        "- Iron core strengthens it; more turns strengthen it.",
    ], KEY_POINTS)

    add_box(doc, "IF YOU REMEMBER ONE THING", [
        "Mutual induction: change the current in one coil, and a nearby coil feels it — through the magnetic field."
    ], BIG_IDEA, title_color="8B6914")

    page_break(doc)

    # ═══════════════════════════════════════════════════════
    # 9.5 TRANSFORMERS
    # ═══════════════════════════════════════════════════════
    add_heading(doc, "9.5  Transformers", level=1)

    add_box(doc, "HAVE YOU EVER NOTICED…", [
        "The big grey boxes on poles near your home hum quietly and get warm. These are transformers. They change voltage so power can travel long distances and still be safe in your house."
    ], HOOK_BG)

    add_box(doc, "THE BIG IDEA", [
        "**A transformer uses mutual induction to change an AC voltage from one value to another.** "
        "It has two coils on a shared iron core. The ratio of voltages equals the ratio of turns."
    ], BIG_IDEA)

    add_heading(doc, "The equation", level=3)
    add_equation(doc, "Vs / Vp = Ns / Np", note="Vs = secondary voltage; Vp = primary voltage; Ns = secondary turns; Np = primary turns")

    add_para(doc, "For an ideal (100 % efficient) transformer, power in = power out:")
    add_equation(doc, "Vp × Ip = Vs × Is")
    add_para(doc, "Combining gives the full relationship:")
    add_equation(doc, "Vs / Vp = Ns / Np = Ip / Is")

    add_heading(doc, "Step-up vs step-down", level=3)

    add_table(doc,
        ["Transformer", "Turns ratio", "Voltage", "Current"],
        [
            ["Step-up", "Ns > Np", "Increases", "Decreases"],
            ["Step-down", "Ns < Np", "Decreases", "Increases"],
            ["Isolation", "Ns = Np", "Same", "Same"],
        ])

    add_heading(doc, "Example: a Malawian household transformer", level=3)
    add_para(doc, "Electricity is transmitted at very high voltages (e.g. 66 kV or 132 kV) to reduce losses. But your home uses 230 V. Between the transmission line and your house, a step-down transformer reduces the voltage. Without it, your appliances would be destroyed.")
    add_para(doc, "A transformer works only on **alternating current (AC)**. A steady DC produces a steady flux, and a steady flux induces no emf. That is why ESCOM and most national grids use AC.")

    add_heading(doc, "Efficiency", level=3)
    add_para(doc, "Real transformers are not 100 % efficient — some energy is lost to:")
    add_para(doc, "- **Resistance heating** in the coils (I²R loss).")
    add_para(doc, "- **Eddy currents** in the iron core — circulating currents that heat the core.")
    add_para(doc, "- **Hysteresis** — energy lost each time the core magnetises and demagnetises.")
    add_para(doc, "Efficiency improved by: using thick copper wire (reduces resistance), laminating the core (reduces eddy currents), and using soft magnetic materials (reduces hysteresis).")
    add_equation(doc, "Efficiency = (Vs Is / Vp Ip) × 100 %")

    add_box(doc, "WHY STUDENTS FIND THIS DIFFICULT", [
        "- Thinking a transformer *creates* power. It does not — it changes the voltage-current trade-off. Power out ≤ power in.",
        "- Forgetting that it works **only on AC**. DC does not change flux, so no induction.",
        "- Mixing up step-up and step-down. Ns > Np is step-up; Ns < Np is step-down.",
        "- Forgetting that current decreases when voltage increases (for the same power).",
        "- Using Vp/Vs the wrong way round. Always check which side has more turns.",
    ], STRUGGLE)

    add_box(doc, "KEY POINTS — 9.5", [
        "- Vs/Vp = Ns/Np = Ip/Is (ideal transformer).",
        "- Works only on AC.",
        "- Step-up: Ns > Np, increases V, decreases I.",
        "- Step-down: Ns < Np, decreases V, increases I.",
        "- Losses: resistance, eddy currents, hysteresis.",
        "- Efficiency = (Vs Is) / (Vp Ip) × 100 %.",
    ], KEY_POINTS)

    add_box(doc, "IF YOU REMEMBER ONE THING", [
        "Vs/Vp = Ns/Np. AC only. Voltage up = current down (and vice versa). No free power."
    ], BIG_IDEA, title_color="8B6914")

    page_break(doc)

    # ═══════════════════════════════════════════════════════
    # 9.6 POWER TRANSMISSION
    # ═══════════════════════════════════════════════════════
    add_heading(doc, "9.6  Electric Power Transmission", level=1)

    add_box(doc, "HAVE YOU EVER NOTICED…", [
        "Why does ESCOM transmit electricity at 132,000 volts instead of just 230? Because high voltage means low current, and low current means less wasted heat. It's simple physics — but with enormous consequences for the price of your electricity."
    ], HOOK_BG)

    add_box(doc, "THE BIG IDEA", [
        "**Power is transmitted at very high voltage to reduce current, and therefore reduce the "
        "energy wasted as heat in the cables.** The wasted power is I²R."
    ], BIG_IDEA)

    add_heading(doc, "The physics", level=3)
    add_para(doc, "Power transmitted is P = VI. For a given power, if you increase V, the current I must decrease.")
    add_para(doc, "The power wasted as heat in the cables is:")
    add_equation(doc, "P_loss = I² R", note="I = current in cable (A); R = resistance of cable (Ω)")
    add_para(doc, "Because the loss depends on I², **halving the current reduces the loss to one quarter.** This is why stepping up to a very high voltage is so valuable.")

    add_image(doc, f"{IMG_DIR}/fig4_transmission.png",
              "Figure 9.4 — The transmission chain. A step-up transformer raises the voltage for transmission; a step-down transformer reduces it for safe domestic use.")

    add_heading(doc, "Example calculation", level=3)
    add_para(doc, "Suppose a power station delivers 10 MW to a city through a cable of resistance 5 Ω.")
    add_para(doc, "**Case 1: transmitted at 10,000 V.**")
    add_equation(doc, "I = P/V = 10,000,000 / 10,000 = 1000 A")
    add_equation(doc, "P_loss = I²R = 1000² × 5 = 5,000,000 W = 5 MW")
    add_para(doc, "Half the power is lost! Only 5 MW reaches the city.")
    add_para(doc, "**Case 2: transmitted at 100,000 V.**")
    add_equation(doc, "I = 10,000,000 / 100,000 = 100 A")
    add_equation(doc, "P_loss = 100² × 5 = 50,000 W = 50 kW")
    add_para(doc, "Only 0.5 % is lost. **99.5 % reaches the city.** The high voltage is doing enormous work for us.")

    add_heading(doc, "The transmission chain", level=3)
    add_para(doc, "1. **Power station** produces electricity at moderate voltage (e.g. 11 kV).")
    add_para(doc, "2. **Step-up transformer** raises to 66 kV, 132 kV, or higher.")
    add_para(doc, "3. **Transmission lines** carry the power long distances.")
    add_para(doc, "4. **Step-down transformers** reduce voltage step by step — first to 33 kV, then 11 kV, then 400 V for local distribution.")
    add_para(doc, "5. **Final step-down** to 230 V for homes and small businesses.")

    add_box(doc, "WHY STUDENTS FIND THIS DIFFICULT", [
        "- Thinking high voltage is dangerous on power lines — it is, but that is separate from why it is *used*.",
        "- Forgetting that P_loss depends on I², not I. This is why reducing current is so powerful.",
        "- Mixing up the voltage across the whole line (transmission) with the voltage across a component.",
        "- Using kW and MW without converting to W when doing I²R calculations.",
    ], STRUGGLE)

    add_box(doc, "KEY POINTS — 9.6", [
        "- Transmit at high V → low I → less I²R loss.",
        "- P_loss = I²R.",
        "- Chain: step-up → transmit → step-down → distribute.",
        "- High voltage is essential for economic transmission over long distances.",
    ], KEY_POINTS)

    add_box(doc, "IF YOU REMEMBER ONE THING", [
        "High voltage, low current. P_loss = I²R. That's why power lines carry 132 kV, not 230 V."
    ], BIG_IDEA, title_color="8B6914")

    page_break(doc)

    # ═══════════════════════════════════════════════════════
    # 9.7 ENVIRONMENTAL IMPACT
    # ═══════════════════════════════════════════════════════
    add_heading(doc, "9.7  Environmental Impact of Power Generation and Transmission", level=1)

    add_box(doc, "HAVE YOU EVER NOTICED…", [
        "Malawi gets most of its electricity from hydroelectric stations on the Shire River — clean in principle, but vulnerable to drought. Other countries burn coal, with different consequences. Every method of making electricity has a trade-off."
    ], HOOK_BG)

    add_box(doc, "THE BIG IDEA", [
        "**Making and moving electricity has environmental costs.** Some methods emit greenhouse gases; "
        "some use large amounts of land; some affect wildlife. Understanding these trade-offs is "
        "essential for making good energy decisions."
    ], BIG_IDEA)

    add_heading(doc, "Impacts by source", level=3)

    add_table(doc,
        ["Source", "Main environmental impacts"],
        [
            ["Coal / oil", "CO₂ (climate change), SO₂ (acid rain), particulates (air pollution)"],
            ["Hydro", "Flooding of land, displacement of people, changes to river ecosystems, methane from reservoirs"],
            ["Nuclear", "Radioactive waste, risk of accidents, high cost"],
            ["Wind", "Noise, visual impact, bird strikes"],
            ["Solar", "Manufacturing pollution, land use for large farms"],
            ["Geothermal", "Localised gas release, land use"],
        ])

    add_heading(doc, "Transmission-specific impacts", level=3)
    add_para(doc, "- **Habitat disruption** — clearing land for power line corridors.")
    add_para(doc, "- **Bird collisions** — especially for large birds.")
    add_para(doc, "- **Visual impact** — pylons and lines across landscape.")
    add_para(doc, "- **Electromagnetic fields** — usually low and considered safe at normal distances, but studied carefully.")
    add_para(doc, "- **Energy loss** — some power is lost as heat in transmission, so more fuel must be burned to deliver the same power.")

    add_heading(doc, "Malawi in context", level=3)
    add_para(doc, "Malawi's electricity is mostly hydroelectric — around 90 %. This is clean in operation but vulnerable to low water levels, especially during drought years. As a result, Malawi experiences load-shedding. Expanding solar power is increasingly important for resilience. Solar panels don't need water, work in Malawi's strong sunshine, and can be installed locally.")

    add_box(doc, "WHY STUDENTS FIND THIS DIFFICULT", [
        "- Thinking any energy source is 'free'. Every source has environmental costs, even renewables.",
        "- Thinking hydro has no impact. Large dams flood land, displace people, and change ecosystems.",
        "- Ignoring the difference between operational emissions and life-cycle emissions. Solar has zero operational emissions but non-zero manufacturing emissions.",
    ], STRUGGLE)

    add_box(doc, "KEY POINTS — 9.7", [
        "- Every energy source has environmental costs.",
        "- Fossil fuels: CO₂, pollution. Hydro: land use, ecosystem change.",
        "- Malawi is ~90 % hydroelectric.",
        "- Solar and other renewables are increasingly important for energy security.",
    ], KEY_POINTS)

    add_box(doc, "IF YOU REMEMBER ONE THING", [
        "No source of electricity is completely free of environmental impact. Understanding the trade-offs is essential for wise decisions."
    ], BIG_IDEA, title_color="8B6914")

    page_break(doc)

    # ═══════════════════════════════════════════════════════
    # 9.8 OTHER APPLICATIONS
    # ═══════════════════════════════════════════════════════
    add_heading(doc, "9.8  Other Applications of Electromagnetic Induction", level=1)

    add_box(doc, "HAVE YOU EVER NOTICED…", [
        "A microphone turns your voice into electricity. A metal detector finds buried metal. A bicycle dynamo lights your lamp. An induction cooker heats a pot without any flame. All use induction."
    ], HOOK_BG)

    add_box(doc, "THE BIG IDEA", [
        "**Electromagnetic induction is one of the most productive ideas in applied physics.** "
        "Every generator, transformer, and induction-based device in the world depends on it."
    ], BIG_IDEA)

    add_image(doc, f"{IMG_DIR}/fig5_applications.png",
              "Figure 9.5 — Applications of electromagnetic induction: generators, induction cookers, metal detectors, microphones.")

    add_heading(doc, "Applications", level=3)
    add_para(doc, "- **Generators (AC and DC).** A coil rotates in a magnetic field. As it rotates, the flux through the coil changes continuously, inducing an emf. This is how virtually all electricity is made.")
    add_para(doc, "- **Microphones.** Sound waves vibrate a diaphragm attached to a coil in a magnetic field. The moving coil induces a changing emf — an electrical signal.")
    add_para(doc, "- **Induction cookers.** A rapidly alternating current in a coil under the pot creates a changing magnetic flux, which induces eddy currents in the iron pot, heating it. The cooker surface itself stays cool.")
    add_para(doc, "- **Metal detectors.** A coil produces an alternating magnetic field. When the coil passes over metal, eddy currents are induced in the metal, which change the magnetic field, triggering a signal.")
    add_para(doc, "- **Bicycle dynamos.** A magnet rotates near a coil of wire. The changing flux induces an emf, lighting the lamp.")
    add_para(doc, "- **Electric guitars.** Vibrating metal strings disturb the magnetic field from a pickup coil, inducing a signal that is amplified to make sound.")

    add_box(doc, "WHY STUDENTS FIND THIS DIFFICULT", [
        "- Forgetting that all these devices rely on **changing** flux, not steady flux.",
        "- Thinking induction cookers work by 'passing current through the pot'. They don't — the pot is heated by eddy currents induced in it by the cooker's coil.",
        "- Thinking microphones work like loudspeakers. They work in the *reverse* way — sound in, electrical signal out.",
    ], STRUGGLE)

    add_box(doc, "KEY POINTS — 9.8", [
        "- Generators: rotation → changing flux → emf.",
        "- Microphones: sound → moving coil → emf.",
        "- Induction cookers: AC coil → eddy currents in pot.",
        "- Metal detectors: AC coil → eddy currents in metal.",
        "- Dynamos: rotating magnet → coil → lamp.",
    ], KEY_POINTS)

    add_box(doc, "IF YOU REMEMBER ONE THING", [
        "Induction is everywhere: motors, generators, transformers, microphones, cookers, detectors, dynamos. All because moving magnetic fields create electricity."
    ], BIG_IDEA, title_color="8B6914")

    page_break(doc)

    # ═══════════════════════════════════════════════════════
    # WORKED EXAMPLES
    # ═══════════════════════════════════════════════════════
    add_heading(doc, "Worked Examples", level=1)

    add_heading(doc, "Example 1 — Transformer voltages (Easy)", level=3)
    add_para(doc, "**Question.** A transformer has 200 turns on its primary and 1000 on its secondary. The primary is connected to 230 V AC. Find the secondary voltage.")
    add_para(doc, "**Given:** Np = 200, Ns = 1000, Vp = 230 V.")
    add_para(doc, "**Find:** Vs.")
    add_para(doc, "**Principle.** Vs/Vp = Ns/Np.")
    add_para(doc, "**Solution.**")
    add_equation(doc, "Vs = Vp × Ns/Np = 230 × 1000/200 = 230 × 5")
    add_equation(doc, "Vs = 1150 V", boxed=True)
    add_para(doc, "**Why this works:** More turns on the secondary means higher voltage — this is a step-up transformer.")
    add_para(doc, "**Common mistake:** Inverting the ratio. Ns/Np greater than 1 gives a step-up; less than 1 gives a step-down.")

    add_heading(doc, "Example 2 — Transformer current (Medium)", level=3)
    add_para(doc, "**Question.** A transformer steps down from 230 V to 12 V. The secondary supplies a current of 2.0 A to a lamp. Assuming 100 % efficiency, find the primary current.")
    add_para(doc, "**Given:** Vp = 230 V, Vs = 12 V, Is = 2.0 A.")
    add_para(doc, "**Find:** Ip.")
    add_para(doc, "**Principle.** For an ideal transformer, Vp Ip = Vs Is.")
    add_para(doc, "**Solution.**")
    add_equation(doc, "Vp Ip = Vs Is")
    add_equation(doc, "230 × Ip = 12 × 2.0")
    add_equation(doc, "Ip = 24 / 230 ≈ 0.104 A", boxed=True)
    add_para(doc, "**Why this works:** Power in = power out. Since voltage drops, current rises proportionally.")
    add_para(doc, "**Common mistake:** Using the voltage ratio instead of the power conservation equation. Use VpIp = VsIs when both voltages are given.")

    add_heading(doc, "Example 3 — Power transmission loss (Hard)", level=3)
    add_para(doc, "**Question.** A power station delivers 5 MW to a town. The resistance of the transmission cable is 4 Ω. (a) Calculate the power loss if transmission is at 25,000 V. (b) Recalculate the loss if transmission is at 250,000 V. (c) Comment on the results.")
    add_para(doc, "**Given:** P = 5 MW = 5 × 10⁶ W, R = 4 Ω.")
    add_para(doc, "**Find:** Losses at each voltage.")
    add_para(doc, "**Principle.** I = P/V, and P_loss = I²R.")
    add_para(doc, "**Solution (a).**")
    add_equation(doc, "I = (5 × 10⁶) / 25,000 = 200 A")
    add_equation(doc, "P_loss = 200² × 4 = 160,000 W = 160 kW", boxed=True)
    add_para(doc, "**Solution (b).**")
    add_equation(doc, "I = (5 × 10⁶) / 250,000 = 20 A")
    add_equation(doc, "P_loss = 20² × 4 = 1600 W = 1.6 kW", boxed=True)
    add_para(doc, "**Solution (c).** Ten times higher voltage → ten times lower current → **one hundred times less loss.** High-voltage transmission is enormously more efficient.")
    add_para(doc, "**Why this works:** P_loss ∝ I², and I ∝ 1/V. So P_loss ∝ 1/V². Going up by 10× voltage reduces loss by 100×.")
    add_para(doc, "**Common mistake:** Forgetting that P_loss uses the **current**, not the voltage. Or using MW without converting to W.")

    add_heading(doc, "Example 4 — Faraday's law reasoning (MSCE)", level=3)
    add_para(doc, "**Question.** A coil of 500 turns has a magnetic flux that changes from 0.02 Wb to 0.08 Wb in 0.5 s. Find the induced emf.")
    add_para(doc, "**Given:** N = 500, Φ₁ = 0.02 Wb, Φ₂ = 0.08 Wb, Δt = 0.5 s.")
    add_para(doc, "**Find:** induced emf.")
    add_para(doc, "**Principle.** emf = −N(ΔΦ/Δt) (magnitude = N(ΔΦ/Δt)).")
    add_para(doc, "**Solution.**")
    add_equation(doc, "ΔΦ = 0.08 − 0.02 = 0.06 Wb")
    add_equation(doc, "ΔΦ/Δt = 0.06 / 0.5 = 0.12 Wb/s")
    add_equation(doc, "emf = 500 × 0.12 = 60 V", boxed=True)
    add_para(doc, "**Why this works:** The emf is proportional to the number of turns times the rate of change of flux. Faster change or more turns give a bigger emf.")
    add_para(doc, "**Common mistake:** Forgetting to multiply by N. Or subtracting Φ₂ − Φ₁ and losing the sense of direction — the magnitude is what matters here.")

    page_break(doc)

    # ═══════════════════════════════════════════════════════
    # CHECK YOURSELF
    # ═══════════════════════════════════════════════════════
    add_heading(doc, "Check Yourself", level=1)
    add_box(doc, "", [
        "**1.** State what is meant by electromagnetic induction.",
        "**2.** Give one way to demonstrate electromagnetic induction.",
        "**3.** State two factors that affect the magnitude of an induced emf.",
        "**4.** State Faraday's law of electromagnetic induction.",
        "**5.** State Lenz's law and explain its connection to conservation of energy.",
        "**6.** What is mutual induction?",
        "**7.** State the transformer equation relating voltage and turns.",
        "**8.** Explain why a transformer works only on AC.",
        "**9.** State why electricity is transmitted at very high voltage.",
        "**10.** Give two environmental impacts of power generation.",
    ], CHECK)

    # ═══════════════════════════════════════════════════════
    # EXAM-STYLE
    # ═══════════════════════════════════════════════════════
    add_heading(doc, "Exam-Style Questions (MSCE-style practice)", level=1)
    add_box(doc, "", [
        "**Q1.** (a) Describe a simple experiment to demonstrate electromagnetic induction.",
        "     (b) State two ways to increase the induced emf in this experiment.",

        "**Q2.** (a) State Faraday's law and Lenz's law.",
        "     (b) Explain how Lenz's law is related to conservation of energy.",

        "**Q3.** A transformer has 400 turns on the primary and 40 on the secondary. The primary is connected to a 240 V AC supply.",
        "     (a) Calculate the secondary voltage.",
        "     (b) Is it a step-up or step-down transformer? Explain.",

        "**Q4.** (a) What is mutual induction?",
        "     (b) Describe how an iron core improves the efficiency of a transformer.",

        "**Q5.** A power station transmits 20 MW at 50,000 V through cables of total resistance 3 Ω.",
        "     (a) Calculate the current in the cables.",
        "     (b) Calculate the power lost in the cables.",
        "     (c) Suggest two ways the transmission loss could be reduced.",

        "**Q6.** (a) State three sources of energy loss in a real transformer.",
        "     (b) For each, suggest one way to reduce the loss.",

        "**Q7.** A coil with 300 turns is placed in a magnetic field. The flux through the coil changes at a rate of 0.05 Wb/s.",
        "     (a) Calculate the induced emf.",
        "     (b) State what happens to the emf if the number of turns is doubled.",

        "**Q8.** (a) Describe how an AC generator produces an alternating emf.",
        "     (b) Sketch a graph of emf against time for one complete rotation.",

        "**Q9.** (a) Describe two environmental impacts of using coal to generate electricity.",
        "     (b) State one advantage and one disadvantage of hydroelectric power in Malawi.",

        "**Q10.** (a) Describe how an induction cooker works.",
        "      (b) Explain why the surface of the cooker itself stays relatively cool.",
    ], EXAM_Q)

    page_break(doc)

    # ═══════════════════════════════════════════════════════
    # SOLUTIONS
    # ═══════════════════════════════════════════════════════
    add_heading(doc, "Full Worked Solutions", level=1)

    add_heading(doc, "Check Yourself — Answers", level=3)
    add_box(doc, "", [
        "**1.** The production of an emf (and hence a current, in a closed circuit) by a changing magnetic field.",
        "**2.** Move a magnet into (or out of) a coil connected to a galvanometer. The needle deflects while the magnet moves.",
        "**3.** Any two: speed of movement, strength of magnet, number of turns, area of coil.",
        "**4.** The induced emf is proportional to the rate of change of magnetic flux linkage. emf = −N(ΔΦ/Δt).",
        "**5.** The induced current always flows in such a direction as to oppose the change producing it. If it aided the change, energy would be created from nothing — violating conservation of energy.",
        "**6.** The induction of an emf in a coil due to a changing current in a nearby coil.",
        "**7.** Vs/Vp = Ns/Np.",
        "**8.** A transformer relies on changing magnetic flux. DC produces steady flux → no changing flux → no induced emf.",
        "**9.** To reduce the current, and hence reduce power loss in the cables, since P_loss = I²R.",
        "**10.** Any two: CO₂ and pollution from fossil fuels; land use and flooding from hydro; radioactive waste from nuclear.",
    ], SOLUTIONS)

    add_heading(doc, "Exam-Style — Full Solutions", level=3)
    add_box(doc, "", [
        "**Q1.** (a) Connect a coil to a sensitive galvanometer. Push a bar magnet into the coil — the needle deflects. Hold the magnet still — the needle returns to zero. Pull the magnet out — the needle deflects the other way.",
        "     (b) Move the magnet faster; use a stronger magnet; use more turns; use a larger coil.",

        "**Q2.** (a) Faraday: the induced emf is proportional to the rate of change of magnetic flux linkage. Lenz: the induced current flows in such a direction as to oppose the change producing it.",
        "     (b) If Lenz's law were violated (i.e. the induced current helped the change), the change would grow indefinitely, generating energy from nothing — a clear violation of conservation of energy.",

        "**Q3.** (a) Vs = Vp × Ns/Np = 240 × 40/400 = 240 × 0.1 = **24 V**.",
        "     (b) Step-down, because Ns < Np, so the voltage is reduced.",

        "**Q4.** (a) The induction of an emf in one coil due to a changing current in a nearby coil.",
        "     (b) The iron core channels magnetic flux from the primary to the secondary, so almost all the flux from the primary links with the secondary. This greatly improves efficiency.",

        "**Q5.** (a) I = P/V = (20 × 10⁶) / 50,000 = **400 A**.",
        "     (b) P_loss = I²R = 400² × 3 = 160,000 × 3 = **480,000 W = 480 kW**.",
        "     (c) Transmit at higher voltage; use thicker cables (lower resistance); use better conducting material.",

        "**Q6.** (a) Resistance heating in coils; eddy currents in the core; hysteresis in the core.",
        "     (b) Resistance: use thicker copper wire. Eddy currents: laminate the core. Hysteresis: use a soft magnetic material (e.g. soft iron or silicon steel).",

        "**Q7.** (a) emf = N × ΔΦ/Δt = 300 × 0.05 = **15 V**.",
        "     (b) The emf doubles to 30 V.",

        "**Q8.** (a) A coil rotates in a magnetic field. As the plane of the coil changes angle relative to the field, the flux through the coil changes continuously, inducing an emf that reverses each half-turn. The result is an alternating emf.",
        "     (b) A sinusoidal wave, going through zero at the vertical positions of the coil, reaching maximum when the coil plane is parallel to the field.",

        "**Q9.** (a) CO₂ emissions contributing to climate change; SO₂ emissions causing acid rain; particulates causing air pollution and health problems.",
        "     (b) Advantage: renewable, no direct CO₂. Disadvantage: vulnerable to drought (low water levels), leading to load-shedding.",

        "**Q10.** (a) A coil below the cooking surface carries a high-frequency alternating current. This creates a rapidly changing magnetic field, which induces eddy currents in the iron pot above it. The eddy currents heat the pot directly.",
        "      (b) The surface itself is not a good conductor of the changing field in the same way iron is, so it does not heat up significantly. Only ferromagnetic material (the pot) responds strongly.",
    ], SOLUTIONS)

    # ═══════════════════════════════════════════════════════
    # COMMON MISTAKES
    # ═══════════════════════════════════════════════════════
    add_heading(doc, "Common Mistakes", level=1)
    add_box(doc, "", [
        "- Forgetting the word 'changing'. Steady flux → no induced emf.",
        "- Thinking a transformer 'creates' energy. It converts voltage-current trade-off with some loss.",
        "- Using a transformer with DC. It doesn't work.",
        "- Mixing up step-up and step-down. Ns > Np is step-up.",
        "- Using Vp/Vs the wrong way round. Always check which coil has more turns.",
        "- Forgetting that P_loss = I²R uses **current**, not voltage.",
        "- Not converting kW/MW to W in power loss calculations.",
        "- Thinking Lenz's law contradicts energy conservation. It *is* a consequence of it.",
        "- Confusing mutual induction with self-induction.",
    ], MISTAKES)

    # ═══════════════════════════════════════════════════════
    # EXAM TIP
    # ═══════════════════════════════════════════════════════
    add_box(doc, "EXAM TIP", [
        "MSCE reliably tests: (1) the demonstration of induction; (2) Faraday's and Lenz's laws; (3) transformer calculations (Vs/Vp = Ns/Np); (4) power transmission loss (P_loss = I²R); (5) AC vs DC in transformers.",
        "For transformer calculations, write the ratio explicitly, then substitute. Examiners want to see the method.",
        "For power transmission, always convert MW to W. Then use I = P/V, then P_loss = I²R.",
        "For explanation questions, use the phrase 'rate of change of flux' and 'opposes the change'. Those are the mark-worthy phrases.",
        "Do not say 'electricity is lost' in transmission. Say 'energy is lost as heat in the cables'. Precision earns marks.",
    ], EXAM_TIP, title_color="E65100")

    # ═══════════════════════════════════════════════════════
    # REMEMBER STRIP
    # ═══════════════════════════════════════════════════════
    add_remember_strip(doc, "Changing flux induces emf. Faraday: emf = −N(ΔΦ/Δt). Lenz: opposes the change. Transformer: Vs/Vp = Ns/Np (AC only). Transmission: high V → low I → less I²R loss.")

    # ═══════════════════════════════════════════════════════
    # CHAPTER TEST
    # ═══════════════════════════════════════════════════════
    page_break(doc)
    add_heading(doc, "Chapter 9 Test", level=1)

    add_box(doc, "SECTION A — Multiple Choice (5 marks)", [
        "**1.** An emf is induced in a coil when:",
        "   A. It is near a magnet   B. The magnetic flux through it changes   C. It is connected to a battery   D. It is heated",
        "",
        "**2.** Lenz's law is a consequence of:",
        "   A. Conservation of momentum   B. Conservation of charge   C. Conservation of energy   D. Newton's third law",
        "",
        "**3.** A transformer with more turns on the secondary than the primary is called:",
        "   A. Step-down   B. Step-up   C. Isolation   D. Lossy",
        "",
        "**4.** Power is transmitted at high voltage in order to:",
        "   A. Increase the current   B. Reduce the current   C. Reduce the resistance   D. Increase the resistance",
        "",
        "**5.** A transformer works on:",
        "   A. DC only   B. AC only   C. Both AC and DC   D. Neither",
    ], "E1F5FE")

    add_box(doc, "SECTION B — Short Answers (10 marks)", [
        "**6.** State Faraday's law. (2)",
        "**7.** State Lenz's law. (2)",
        "**8.** A transformer has 500 primary turns and 100 secondary turns. If the primary voltage is 240 V, find the secondary voltage. (2)",
        "**9.** State two ways to reduce energy loss in a transformer. (2)",
        "**10.** Explain why electricity is transmitted at high voltage. (2)",
    ], "E1F5FE")

    add_box(doc, "SECTION C — Structured Questions (15 marks)", [
        "**12.** (a) Describe an experiment to demonstrate electromagnetic induction. (3)",
        "      (b) State two ways of increasing the induced emf in the experiment. (2)",
        "      (c) State what happens to the galvanometer reading when the magnet is held still inside the coil. Explain. (2)",
        "",
        "**13.** A power station generates 8 MW of power, transmitted at 40,000 V through cables of total resistance 2 Ω.",
        "      (a) Calculate the current in the cables. (2)",
        "      (b) Calculate the power lost in the cables. (3)",
        "      (c) If the voltage were doubled, what would the new power loss be? (2)",
        "",
        "**14.** (a) Describe the construction of a simple transformer. (2)",
        "      (b) Explain why the core is laminated. (1)",
    ], "E1F5FE")

    add_para(doc, "")
    add_box(doc, "END OF CHAPTER 9", [
        "Next chapter: **Chapter 10 — Introduction to Digital Electronics** — already shipped."
    ], BANNER_BLUE, title_color=WHITE)

    # save
    out = "PHY_F4_CH09_ElectromagneticInduction.docx"
    doc.save(out)
    print(f"✅ Saved: {out}")
    print(f"   {IMG_DIR}/ contains 5 diagrams (auto-generated, already embedded).")


if __name__ == '__main__':
    build()
