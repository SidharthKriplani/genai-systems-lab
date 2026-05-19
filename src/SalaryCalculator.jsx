import { useState } from "react";

const ROLES = [
  { id: "ai-engineer",    label: "AI Engineer" },
  { id: "ml-engineer",    label: "ML Engineer" },
  { id: "research",       label: "Research Scientist" },
  { id: "data-scientist", label: "Data Scientist" },
  { id: "ai-pm",          label: "AI Product Manager" },
];

const LEVELS = [
  { id: "junior",    label: "Junior (0–2 yrs)" },
  { id: "mid",       label: "Mid (2–5 yrs)" },
  { id: "senior",    label: "Senior (5–8 yrs)" },
  { id: "staff",     label: "Staff / Principal (8+ yrs)" },
];

// Data: [base_low, base_high, tc_low, tc_high] all in local currency
// tc = total comp (base + equity + bonus) for US/UK/AU/CA; same as base for IN/SG
const DATA = {
  // ─── US (USD) ───────────────────────────────────────────────────
  "us": {
    currency: "USD", symbol: "$", format: "k",
    label: "United States",
    note: "Total comp includes base + equity + bonus. FAANG/frontier labs pay 30–80% above these ranges.",
    "ai-engineer":    { junior:[115,150,140,190], mid:[155,210,180,270], senior:[210,300,250,380], staff:[290,450,380,600] },
    "ml-engineer":    { junior:[125,165,150,210], mid:[165,230,200,300], senior:[230,330,280,420], staff:[310,500,400,650] },
    "research":       { junior:[135,175,160,220], mid:[175,250,210,330], senior:[250,370,300,500], staff:[350,600,450,800] },
    "data-scientist": { junior:[100,135,120,170], mid:[135,185,160,240], senior:[185,260,220,340], staff:[250,390,320,510] },
    "ai-pm":          { junior:[120,155,145,195], mid:[155,210,185,270], senior:[210,290,250,370], staff:[280,440,360,560] },
  },
  // ─── UK (GBP) ───────────────────────────────────────────────────
  "uk": {
    currency: "GBP", symbol: "£", format: "k",
    label: "United Kingdom",
    note: "UK figures are base salary. Total comp is typically base + 10–20% bonus. London pays ~20% above these ranges.",
    "ai-engineer":    { junior:[50,70,55,80],   mid:[75,110,85,125],  senior:[115,165,130,185], staff:[160,220,180,250] },
    "ml-engineer":    { junior:[55,75,60,85],   mid:[80,120,90,135],  senior:[120,175,135,195], staff:[165,235,185,265] },
    "research":       { junior:[60,80,65,90],   mid:[85,130,95,145],  senior:[130,185,145,210], staff:[180,260,200,290] },
    "data-scientist": { junior:[45,65,50,72],   mid:[65,100,72,112],  senior:[100,145,112,162], staff:[140,200,155,225] },
    "ai-pm":          { junior:[55,75,60,85],   mid:[75,115,85,128],  senior:[115,160,128,178], staff:[155,215,172,240] },
  },
  // ─── INDIA (INR lakhs) ──────────────────────────────────────────
  "in": {
    currency: "INR", symbol: "₹", format: "L",
    label: "India",
    note: "Figures in lakhs per annum (CTC). Top-tier companies (Google, Microsoft, startups) are at the upper end. Includes variable pay.",
    "ai-engineer":    { junior:[12,22,14,26],  mid:[25,50,28,58],  senior:[50,90,55,100],  staff:[80,150,90,170] },
    "ml-engineer":    { junior:[14,25,16,30],  mid:[28,55,32,62],  senior:[55,100,60,110], staff:[90,170,100,190] },
    "research":       { junior:[16,28,18,32],  mid:[30,65,34,72],  senior:[60,110,68,125], staff:[100,200,115,220] },
    "data-scientist": { junior:[10,18,11,20],  mid:[20,40,22,45],  senior:[40,75,44,82],   staff:[65,120,72,135] },
    "ai-pm":          { junior:[14,24,16,28],  mid:[28,55,32,62],  senior:[55,95,62,108],  staff:[85,160,95,178] },
  },
  // ─── AUSTRALIA (AUD) ────────────────────────────────────────────
  "au": {
    currency: "AUD", symbol: "A$", format: "k",
    label: "Australia",
    note: "Australian figures are base salary (AUD). Super (11%) is on top. Sydney/Melbourne pay 10–15% above Brisbane/Perth.",
    "ai-engineer":    { junior:[90,120,100,135],  mid:[125,170,138,188],  senior:[170,230,188,255], staff:[225,310,248,340] },
    "ml-engineer":    { junior:[95,130,105,145],  mid:[135,180,149,198],  senior:[180,248,198,272], staff:[240,330,264,363] },
    "research":       { junior:[100,135,110,150], mid:[140,190,154,209],  senior:[185,260,204,286], staff:[250,360,275,396] },
    "data-scientist": { junior:[80,110,88,121],   mid:[112,155,123,170],  senior:[155,210,170,231], staff:[205,285,226,314] },
    "ai-pm":          { junior:[90,120,99,132],   mid:[122,165,134,182],  senior:[165,225,182,248], staff:[220,300,242,330] },
  },
  // ─── CANADA (CAD) ───────────────────────────────────────────────
  "ca": {
    currency: "CAD", symbol: "C$", format: "k",
    label: "Canada",
    note: "Canadian figures are base (CAD). Toronto and Vancouver are primary markets. US cross-border roles often pay USD + location premium.",
    "ai-engineer":    { junior:[85,115,95,128],  mid:[118,160,130,175],  senior:[160,220,174,240], staff:[215,300,235,328] },
    "ml-engineer":    { junior:[90,122,100,135], mid:[125,170,137,186],  senior:[168,232,183,254], staff:[225,318,246,349] },
    "research":       { junior:[95,128,105,142], mid:[132,178,145,196],  senior:[175,248,192,272], staff:[240,350,263,385] },
    "data-scientist": { junior:[75,105,82,116],  mid:[108,148,118,162],  senior:[148,200,162,218], staff:[195,275,214,302] },
    "ai-pm":          { junior:[85,115,93,127],  mid:[115,158,126,173],  senior:[158,215,173,236], staff:[210,290,231,318] },
  },
  // ─── SINGAPORE (SGD) ────────────────────────────────────────────
  "sg": {
    currency: "SGD", symbol: "S$", format: "k",
    label: "Singapore",
    note: "Singapore figures are base (SGD). Strong market for APAC AI roles; MNCs pay at or above these ranges.",
    "ai-engineer":    { junior:[60,85,66,94],   mid:[88,128,97,140],  senior:[130,188,143,207], staff:[185,265,204,292] },
    "ml-engineer":    { junior:[65,90,72,99],   mid:[94,135,103,149], senior:[138,198,152,218], staff:[195,280,215,308] },
    "research":       { junior:[68,95,75,105],  mid:[98,145,108,160], senior:[145,210,160,231], staff:[205,300,226,330] },
    "data-scientist": { junior:[55,78,60,86],   mid:[80,118,88,130],  senior:[118,170,130,187], staff:[165,240,182,264] },
    "ai-pm":          { junior:[62,88,68,97],   mid:[90,130,99,143],  senior:[130,188,143,207], staff:[180,260,198,286] },
  },
};

const COMPANY_MULTIPLIERS = [
  { id: "faang",    label: "FAANG / MANGA", mult: 1.6,  note: "Google, Meta, Apple, Amazon, Netflix, Microsoft" },
  { id: "ai-lab",   label: "AI Frontier Lab", mult: 2.0, note: "Anthropic, OpenAI, DeepMind, Mistral" },
  { id: "startup",  label: "AI-Native Startup", mult: 0.9, note: "Lower base, higher equity risk, more ownership" },
  { id: "mid",      label: "Growth-Stage Tech", mult: 1.0, note: "Series B–D startups, mid-size tech companies" },
  { id: "enterprise",label: "Enterprise / Consulting", mult: 0.85, note: "Banks, consultancies, large non-tech companies" },
];

function fmt(n, symbol, format) {
  if (format === "L") return `${symbol}${n}L`;
  return `${symbol}${n}k`;
}

export default function SalaryCalculator() {
  const [role,    setRole]    = useState("ai-engineer");
  const [level,   setLevel]   = useState("mid");
  const [country, setCountry] = useState("us");
  const [company, setCompany] = useState("mid");

  const market = DATA[country];
  const row    = market?.[role]?.[level];
  const comp   = COMPANY_MULTIPLIERS.find(c => c.id === company);

  const lo  = row ? Math.round(row[0] * comp.mult) : 0;
  const hi  = row ? Math.round(row[1] * comp.mult) : 0;
  const tcLo = row ? Math.round(row[2] * comp.mult) : 0;
  const tcHi = row ? Math.round(row[3] * comp.mult) : 0;

  const isUSorUK = ["us","uk"].includes(country);

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-zinc-800 bg-zinc-900/80">
        <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-0.5">Interactive Tool</p>
        <p className="text-sm font-bold text-white">AI/ML Salary Calculator — 2025</p>
      </div>

      {/* Controls */}
      <div className="p-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {/* Role */}
        <div>
          <label className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block mb-1">Role</label>
          <select
            value={role} onChange={e => setRole(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1.5 text-xs text-zinc-200 font-mono focus:outline-none focus:border-violet-600">
            {ROLES.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
          </select>
        </div>

        {/* Level */}
        <div>
          <label className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block mb-1">Level</label>
          <select
            value={level} onChange={e => setLevel(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1.5 text-xs text-zinc-200 font-mono focus:outline-none focus:border-violet-600">
            {LEVELS.map(l => <option key={l.id} value={l.id}>{l.label}</option>)}
          </select>
        </div>

        {/* Country */}
        <div>
          <label className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block mb-1">Market</label>
          <select
            value={country} onChange={e => setCountry(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1.5 text-xs text-zinc-200 font-mono focus:outline-none focus:border-violet-600">
            {Object.entries(DATA).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>

        {/* Company type */}
        <div>
          <label className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block mb-1">Company type</label>
          <select
            value={company} onChange={e => setCompany(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1.5 text-xs text-zinc-200 font-mono focus:outline-none focus:border-violet-600">
            {COMPANY_MULTIPLIERS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
        </div>
      </div>

      {/* Result */}
      {row && (
        <div className="px-4 pb-4">
          <div className="rounded-xl border border-violet-800/40 bg-violet-950/20 p-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Base */}
              <div>
                <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest mb-1">Base salary</p>
                <p className="text-xl font-black text-white">
                  {fmt(lo, market.symbol, market.format)}
                  <span className="text-zinc-500 font-normal text-sm"> – </span>
                  {fmt(hi, market.symbol, market.format)}
                </p>
                <p className="text-[10px] text-zinc-500 font-mono mt-0.5">{market.currency} / year</p>
              </div>

              {/* Total comp */}
              {isUSorUK && (
                <div>
                  <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest mb-1">Total comp</p>
                  <p className="text-xl font-black text-violet-300">
                    {fmt(tcLo, market.symbol, market.format)}
                    <span className="text-zinc-500 font-normal text-sm"> – </span>
                    {fmt(tcHi, market.symbol, market.format)}
                  </p>
                  <p className="text-[10px] text-zinc-500 font-mono mt-0.5">base + equity + bonus</p>
                </div>
              )}
            </div>

            {/* Company note */}
            <div className="mt-3 pt-3 border-t border-violet-800/30">
              <p className="text-[10px] text-violet-400 font-mono">
                <span className="font-bold">{comp.label}:</span> {comp.note}
              </p>
            </div>
          </div>

          {/* Market note */}
          <p className="text-[10px] text-zinc-600 font-mono mt-2 leading-relaxed">{market.note}</p>
        </div>
      )}
    </div>
  );
}
