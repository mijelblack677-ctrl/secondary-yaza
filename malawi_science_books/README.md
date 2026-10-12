# Malawi Science Books — Patch Method

## Setup
    pip install -r requirements.txt

## Build one patch (.docx)
    python patch.py content/physics/form4/PHY_F4_01_Electricity.md

Output → `output/docx/PHY_F4_01_Electricity.docx`

## Build the full book (later)
    python stitch.py content/physics/form4 output/docx/Physics_Form4_Complete.docx

## Adding a new topic
1. Copy `PHY_F4_01_Electricity.md` as a template.
2. Change the `patch_id`, `title`, `form`, and content.
3. Save as e.g. `PHY_F4_02_Forces.md` in the same folder.
4. Run `python patch.py <new_file>`.

## Style rules (locked)
- Topic banner: deep blue #1B3A6B
- Big Idea: soft yellow #FFF9C4
- Key Points: light green #E8F5E9
- Worked Example: light blue #E3F2FD
- Exam Tip: orange #FFF3E0
- Remember: red #C62828 with white text
- Questions: plain white

## Website
The same `.md` files feed the website. Convert with MkDocs Material or Pandoc:
    pandoc PHY_F4_01_Electricity.md -o PHY_F4_01_Electricity.html