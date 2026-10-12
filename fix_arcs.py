#!/usr/bin/env python3
"""Normalize SVG path `d` attributes so arc flags are always single, space-separated chars.

Fixes browser errors like:
  <path> attribute d: Expected arc flag ('0' or '1'), "... 0 001.82-..."
by re-parsing every d="..." with a spec-correct parser (arc large-arc-flag and
sweep-flag are consumed as ONE character each) and re-rendering with explicit
spaces between all tokens. Semantics are preserved; only whitespace changes.
"""
import re
import glob
import sys

NUM = r'[-+]?(?:\d+\.\d*|\.\d+|\d+)'
CMDS = set('MmZzLlHhVvCcSsQqTtAa')
NARGS = {'M': 2, 'L': 2, 'H': 1, 'V': 1, 'C': 6, 'S': 4, 'Q': 4, 'T': 2, 'Z': 0, 'A': 7}


def parse_and_fix(d):
    """Parse path data per SVG grammar; return normalized d string or None.

    Arc flags (large-arc-flag, sweep-flag) are consumed as exactly ONE
    character each, which correctly splits glued sequences like "0 001.82"
    into flags 0, 0 and coordinate 1.82.
    """
    toks = []  # ('cmd', letter) | ('num', text)
    i = 0
    L = len(d)
    while i < L:
        c = d[i]
        if c in ' \t\n\r,':
            i += 1
            continue
        if c in CMDS:
            toks.append(('cmd', c))
            i += 1
            continue
        m = re.match(NUM, d[i:])
        if not m:
            return None
        toks.append(('num', m.group(0)))
        i += m.end()

    out = []  # list of [cmd_letter, [values...]]
    ti = 0
    while ti < len(toks):
        kind, val = toks[ti]
        if kind != 'cmd':
            return None  # leading number without command
        cur = val
        cu = cur.upper()
        n = NARGS[cu]
        vals = []
        ti += 1
        while ti < len(toks) and toks[ti][0] == 'num':
            if n == 0:
                break
            slot = len(vals) % n if n else 0
            if cu == 'A' and slot in (4, 5):
                # flag slot: consume characters one at a time so glued tokens
                # like "001.82" split into flags 0, 0 and number 1.82
                t = toks[ti][1]
                k = 0
                while k < len(t):
                    ch = t[k]
                    if ch in '01' and len(vals) % 7 in (4, 5):
                        vals.append(ch)
                        k += 1
                    elif ch in '+-':
                        k += 1  # sign belongs to the following coordinate
                    else:
                        break
                if k > 0:
                    rest = t[k:]
                    if rest:
                        toks[ti] = ('num', rest)
                    else:
                        ti += 1
                continue
            vals.append(toks[ti][1])
            ti += 1
        if n > 0 and len(vals) % n != 0:
            return None
        out.append([cur, vals])
    parts = []
    for cmd, v in out:
        parts.append(cmd + (' ' + ' '.join(str(x) for x in v) if v else ''))
    return ' '.join(parts)


SELFTESTS = [
    "M4 19.5A2.5 2.5 0 0 1 6.5 17H20",
    "M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2a8 8 0 0 1-8-8v-1",
    "M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0",
    "M12 7v14",
    "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z",
]


def main():
    for t in SELFTESTS:
        f = parse_and_fix(t)
        print("selftest", "OK" if f else "FAIL", "->", (f[:110] if f else None))
        if f is None:
            print("parser broken; aborting without writing", file=sys.stderr)
            return 1
    print("--- parser verified ---")

    files = sorted(set(glob.glob('src/**/*.astro', recursive=True)
                       + glob.glob('src/**/*.ts', recursive=True)))
    total = 0
    unparseable = 0
    for fp in files:
        s = open(fp).read()
        cnt = [0]

        def sub(m):
            nonlocal unparseable
            d = m.group(1)
            if not re.match(r'\s*[Mm]', d) or not re.search(r'\d', d):
                return m.group(0)
            fixed = parse_and_fix(d)
            if fixed is None:
                print(f"  !! {fp}: UNPARSEABLE: {d[:80]}")
                unparseable += 1
                return m.group(0)
            if fixed != d:
                cnt[0] += 1
                return f'd="{fixed}"'
            return m.group(0)

        ns = re.sub(r'd="([^"]+)"', sub, s)
        if ns != s:
            open(fp, 'w').write(ns)
            print(f"{fp}: rewrote {cnt[0]} path(s)")
            total += cnt[0]
    print("TOTAL rewritten:", total, "| unparseable:", unparseable)
    return 0


if __name__ == '__main__':
    sys.exit(main())
