#!/usr/bin/env python3
"""
triage_concepts.py — quality triage for GSL Concepts modules.
Spec: EVAL_RUBRICS.md. Mirrors the PAL foundations harness:
  Stage A — deterministic gate (no model; runs anywhere).
  Stage B — LLM-as-judge via LM Studio (optional; --llm).
Doctrine: 'review' = look, 'ok' != clearance. The harness shortlists; you adjudicate.

Usage:
  python3 scripts/triage_concepts.py                 # all modules, gate only
  python3 scripts/triage_concepts.py --room language-models --limit 5
  python3 scripts/triage_concepts.py --llm           # add LM Studio judgment dims
"""
import re, os, csv, json, argparse, sys, time

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CONCEPTS = os.path.join(ROOT, "src", "Concepts.jsx")
GRADIENT = os.path.join(ROOT, "src", "data", "gradientContent.js")
OUT_CSV  = os.path.join(ROOT, "scripts", "triage_concepts.csv")

FWD_MARKERS = ("onNavigate(", "ForwardPointerCard", "WhatNextCard")

def read(p):
    with open(p, encoding="utf-8") as f: return f.read()

def parse_gyms(text):
    """module id -> gym id."""
    m = re.search(r"const GYMS\s*=\s*\[(.*?)\n\];", text, re.S)
    body = m.group(1) if m else text
    mod2gym = {}
    for gm in re.finditer(r"\{[^{}]*?id:\s*\"([^\"]+)\"[^{}]*?moduleIds:\s*\[([^\]]*)\][^{}]*?\}", body, re.S):
        gym = gm.group(1)
        for mid in re.findall(r"\"([^\"]+)\"", gm.group(2)):
            mod2gym.setdefault(mid, gym)  # first gym wins (training-signal shared)
    return mod2gym

def parse_registry(text, mod_ids):
    """For each known module id, pull level / fidelity tier / component name."""
    reg = {}
    for mid in mod_ids:
        m = re.search(r"id:\s*\"" + re.escape(mid) + r"\",(.*?)component:\s*(\w+)\s*,", text, re.S)
        if not m:
            reg[mid] = {"level": "?", "fidelity": None, "component": None}
            continue
        body, comp = m.group(1), m.group(2)
        lvl = re.search(r"level:\s*\"([^\"]+)\"", body)
        fid = re.search(r"fidelity:\s*\{\s*tier:\s*\"([^\"]+)\"", body)
        reg[mid] = {"level": lvl.group(1) if lvl else "?",
                    "fidelity": fid.group(1) if fid else None,
                    "component": comp}
    return reg

def component_bodies(text):
    """Map function name -> its source slice (for forward-pointer detection)."""
    bodies, parts = {}, text.split("\nfunction ")
    for part in parts[1:]:
        nm = re.match(r"(\w+)\s*\(", part)
        if nm: bodies[nm.group(1)] = part  # full slice to next top-level function
    return bodies

def parse_gradient(text):
    """module id -> 'built' | 'skeleton' | None."""
    cov = {}
    for m in re.finditer(r'(?:"([\w-]+)"|([a-zA-Z_][\w]*))\s*:\s*([\[{])', text):
        key = m.group(1) or m.group(2)
        cov[key] = "skeleton" if m.group(3) == "{" else "built"
    return cov

def triage(args):
    ctext, gtext = read(CONCEPTS), read(GRADIENT)
    mod2gym = parse_gyms(ctext)
    ids = list(mod2gym.keys())
    reg = parse_registry(ctext, ids)
    bodies = component_bodies(ctext)
    grad = parse_gradient(gtext)

    targets = [m for m in ids if not (args.room and mod2gym[m] != args.room)]
    if args.limit: targets = targets[:args.limit]   # only do the work we'll show
    N = len(targets); t0 = time.time()
    if args.llm:
        print(f"[concepts] judging {N} modules with {os.environ.get('LMSTUDIO_MODEL','qwen/qwen3-14b')}"
              f"{' (no-think)' if os.environ.get('NO_THINK') else ' (thinking — slow; set NO_THINK=1)'} — live:\n", flush=True)
    rows = []
    for i, mid in enumerate(targets, 1):
        gym = mod2gym[mid]; r = reg[mid]
        flags = []
        if not r["fidelity"]: flags.append("no-fidelity")            # D4
        src = bodies.get(r["component"] or "", "")
        if not any(mk in src for mk in FWD_MARKERS): flags.append("no-forward")  # D6
        cov = grad.get(mid)                                          # D8 structural proxy
        if cov is None:   flags.append("gradient-missing")
        elif cov == "skeleton": flags.append("gradient-skeleton")
        if args.llm:                                                 # Stage B: D1/D2/D3/D5
            print(f"  [{i:>2}/{N}] {mid:<24} judging…", end="\r", flush=True)
            ts = time.time()
            flags += llm_flags(module_text(mid, r, src, gtext), cov)
            dt = time.time() - ts
        verdict = "ok" if not flags else "review"
        if args.llm:
            print(f"  [{i:>2}/{N}] {verdict:<6} {mid:<24} {(','.join(flags) or '-'):<46} {dt:5.1f}s", flush=True)
        rows.append({"id": mid, "room": gym, "level": r["level"],
                     "fidelity": r["fidelity"] or "-", "gradient": cov or "none",
                     "flags": ",".join(flags) or "-", "verdict": verdict})
    if args.llm:
        print(f"\n[done] {N} modules in {time.time()-t0:.0f}s", flush=True)

    rows.sort(key=lambda x: (x["verdict"] == "ok", len(x["flags"].split(",")) if x["flags"] != "-" else 0), reverse=True)

    with open(OUT_CSV, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=["id","room","level","fidelity","gradient","flags","verdict"])
        w.writeheader(); w.writerows(rows)

    review = [r for r in rows if r["verdict"] == "review"]
    print(f"[concepts] triaged {len(rows)} modules"
          f"{' (room='+args.room+')' if args.room else ''}"
          f"{' +LLM' if args.llm else ' (gate only — Stage B/LLM dims pending)'}\n")
    for r in rows:
        mark = "review" if r["verdict"] == "review" else "  ok  "
        print(f"  {mark}  [{r['room'][:4]}] {r['id']:<22} {r['flags']}")
    print(f"\n— Shortlist: {len(review)} flagged for review (worst first) —")
    for r in review:
        print(f"  {r['id']:<22} ({r['level']}, grad:{r['gradient']}) — {r['flags']}")
    print(f"\nFull ledger: {os.path.relpath(OUT_CSV, ROOT)}. "
          f"'review' = look; 'ok' = not a clearance (gate dims only — run --llm for D1/D2/D3/D5). You adjudicate.")

def readable(src):
    """Pull human-readable teaching copy out of a JSX component (not code/classNames)."""
    out, seen = [], set()
    for t in re.findall(r">([^<>{}]+)<", src):          # JSX text nodes
        t = t.strip()
        if len(t) >= 20 and " " in t and t not in seen:
            seen.add(t); out.append(t)
    for q in re.findall(r'"([^"]{25,})"', src):          # prose-like string literals
        if " " in q and q not in seen and not re.search(
            r"(text-|bg-|border-|flex|px-|py-|rounded|grid|gap-|font-|var\(|https?:|className|w-\d|h-\d)", q):
            seen.add(q); out.append(q)
    return out[:60]

def gradient_text(mid, gtext):
    """The module's PhD-depth (Gradient) content as plain text, if built; else its skeleton outline."""
    m = re.search(r'(?:"' + re.escape(mid) + r'"|' + re.escape(mid) + r')\s*:\s*\[(.*?)\n  \]', gtext, re.S)
    if m: return " ".join(re.findall(r'c:\s*"([^"]+)"', m.group(1)))
    m = re.search(r'(?:"' + re.escape(mid) + r'"|' + re.escape(mid) + r')\s*:\s*\{[^}]*outline:\s*\[(.*?)\]', gtext, re.S)
    return " ".join(re.findall(r'"([^"]+)"', m.group(1))) if m else ""

def module_text(mid, reg, src, gtext):
    """What the judge actually grades: level + visible prose + the depth layer."""
    parts = ["Level: " + reg.get("level", "?")]
    parts += readable(src)
    g = gradient_text(mid, gtext)
    if g: parts.append("DEPTH (Gradient) LAYER: " + g)
    return "\n".join(parts)

def llm_flags(text, cov):
    """Stage B — LM Studio judge for D1/D2/D3/D5 + D8 rung. Judges teaching content, not code."""
    try:
        import requests
    except ImportError:
        return ["llm-unavailable"]
    url = os.environ.get("LMSTUDIO_URL", "http://localhost:1234/v1/chat/completions")
    model = os.environ.get("LMSTUDIO_MODEL", "qwen/qwen3-14b")  # LM Studio API Model Identifier
    depth_note = ("This module HAS a built PhD-depth layer (shown below), so do NOT flag depth-mismatch/"
                  "low-competency for lacking advanced depth — grade the content as written."
                  if cov == "built" else "This module has no depth layer yet.")
    rubric = ("You grade a learning module's TEACHING CONTENT (prose + derivations), not code. Score 0-2 each: "
              "intuition(explains why, not just what), example(a concrete case or failure demo), accuracy, "
              "depth-fit(matches its stated level), competency(builds real skill: recall=1, transfer/mastery=2). "
              + depth_note + ' Return ONLY JSON {"flags":[...]} drawn from '
              '"no-intuition","no-example","inaccurate","depth-mismatch","low-competency". No other text.')
    if os.environ.get("NO_THINK"): rubric += " /no_think"
    try:
        resp = requests.post(url, json={"model": model, "temperature": 0,
            "messages": [{"role": "system", "content": rubric},
                         {"role": "user", "content": text[:6000]}]}, timeout=120)
        txt = resp.json()["choices"][0]["message"]["content"]
        txt = re.sub(r"<think>.*?</think>", "", txt, flags=re.S)  # Qwen3 thinking-mode guard
        m = re.search(r'\{[^{}]*"flags"[^{}]*\}', txt, re.S)       # grab the JSON object holding flags
        return json.loads(m.group(0)).get("flags", []) if m else ["llm-parse-fail"]
    except requests.exceptions.Timeout:
        return ["llm-timeout"]
    except Exception:
        return ["llm-error"]

if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--room", default=None, help="gym id, e.g. language-models")
    ap.add_argument("--limit", type=int, default=0, help="cap rows (0 = all)")
    ap.add_argument("--llm", action="store_true", help="add LM Studio Stage B")
    triage(ap.parse_args())
