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
import re, os, csv, json, argparse, sys

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

    rows = []
    for mid in ids:
        gym = mod2gym[mid]
        if args.room and gym != args.room: continue
        r = reg[mid]
        flags = []
        # D4 fidelity-honesty (structural): badge present?
        if not r["fidelity"]: flags.append("no-fidelity")
        # D6 synthesis: forward pointer in the component body?
        src = bodies.get(r["component"] or "", "")
        if not any(mk in src for mk in FWD_MARKERS): flags.append("no-forward")
        # D8 competency (structural proxy): depth/Gradient layer present?
        cov = grad.get(mid)
        if cov is None:   flags.append("gradient-missing")
        elif cov == "skeleton": flags.append("gradient-skeleton")
        # NOTE: D1/D2/D3/D5 + the D8 judgment call require Stage B (LM Studio).
        if args.llm:
            flags += llm_flags(mid, r, src)
        verdict = "ok" if not flags else "review"
        rows.append({"id": mid, "room": gym, "level": r["level"],
                     "fidelity": r["fidelity"] or "-", "gradient": cov or "none",
                     "flags": ",".join(flags) or "-", "verdict": verdict})

    rows.sort(key=lambda x: (x["verdict"] == "ok", len(x["flags"].split(",")) if x["flags"] != "-" else 0), reverse=True)
    if args.limit: rows = rows[:args.limit]

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

def llm_flags(mid, reg, src):
    """Stage B — LM Studio judge for D1/D2/D3/D5 + D8 rung. Off in this sandbox."""
    try:
        import requests
    except ImportError:
        return ["llm-unavailable"]
    url = os.environ.get("LMSTUDIO_URL", "http://localhost:1234/v1/chat/completions")
    model = os.environ.get("LMSTUDIO_MODEL", "qwen/qwen3-14b")  # LM Studio API Model Identifier
    rubric = ("Score this learning module 0-2 on: intuition(why,not just what), "
              "example(concrete/failure demo), accuracy, depth-fit(matches level), "
              "competency(recall=1, transfer/mastery=2). Return JSON "
              '{"flags":["no-intuition"|"no-example"|"inaccurate"|"depth-mismatch"|"low-competency"]}. '
              "Length is not quality. Be terse.")
    try:
        resp = requests.post(url, json={"model": model, "temperature": 0,
            "messages": [{"role":"system","content":rubric},
                         {"role":"user","content":src[:4000]}]}, timeout=60)
        txt = resp.json()["choices"][0]["message"]["content"]
        txt = re.sub(r"<think>.*?</think>", "", txt, flags=re.S)  # Qwen3 thinking-mode guard
        m = re.search(r'\{[^{}]*"flags"[^{}]*\}', txt, re.S)       # grab the JSON object holding flags
        return json.loads(m.group(0)).get("flags", []) if m else ["llm-parse-fail"]
    except Exception as e:
        return ["llm-error"]

if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--room", default=None, help="gym id, e.g. language-models")
    ap.add_argument("--limit", type=int, default=0, help="cap rows (0 = all)")
    ap.add_argument("--llm", action="store_true", help="add LM Studio Stage B")
    triage(ap.parse_args())
