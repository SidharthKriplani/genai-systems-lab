import { useState, useMemo } from "react";
import { CompanyLogo } from "./CompanyLogo.jsx";
import {
  COMPANIES, ROLES, LEVELS, getCompanyTrackItems, companyHasTrack, COMPANY_PROFILES,
} from "./data/companyTracks.js";
import { PREP_QUESTIONS, questionTier, TIER_META } from "./data/preplabQuestions";

// Company aliases → substrings to match against a question's `source` field, so bank
// questions attributed to (e.g.) "Google DeepMind screen" surface under Google.
const COMPANY_SOURCE_ALIASES = {
  Google: ["google", "deepmind"], Amazon: ["amazon", "aws", "bedrock", "re:invent"],
  Microsoft: ["microsoft", "azure", "copilot", "autogen", "github"], Meta: ["meta ", "llama"],
  Anthropic: ["anthropic"], Databricks: ["databricks"], Salesforce: ["salesforce", "einstein"],
  Nvidia: ["nvidia"], LinkedIn: ["linkedin"], Adobe: ["adobe"], Netflix: ["netflix"], Uber: ["uber"],
};
function questionsForCompany(company) {
  const needles = COMPANY_SOURCE_ALIASES[company] || [company.toLowerCase()];
  return PREP_QUESTIONS.filter(qq => {
    const s = (qq.source || "").toLowerCase();
    return s && needles.some(n => s.includes(n));
  });
}

// Company Tracks — curated, company × role × level prep paths for AI-engineering
// roles. Pick a company, a role, a level → get an ordered curriculum that
// deep-opens existing GSL content (Foundations gyms, GT posts, labs, PrepLab).
//
// Deep-link contract: every item is dispatched through App.jsx's navigateTo():
//   concepts    → { tab:'concepts', gymId:itemId }
//   groundtruth → { tab:'groundtruth', postId:itemId }
//   preplab     → { tab:'preplab', topic:itemId }
//   everything else → { tab:tabId }
function openItem(onNavigateTo, item) {
  if (!onNavigateTo) return;
  const { tabId, itemId } = item;
  if (tabId === "concepts") return onNavigateTo({ tab: "concepts", gymId: itemId });
  if (tabId === "groundtruth") return onNavigateTo({ tab: "groundtruth", postId: itemId });
  if (tabId === "preplab") return onNavigateTo(itemId ? { tab: "preplab", topic: itemId } : { tab: "preplab" });
  return onNavigateTo({ tab: tabId });
}

const KIND_COLORS = {
  foundation: { bg: "rgba(99,102,241,0.14)",  bd: "rgba(99,102,241,0.4)",  fg: "#a5b4fc" },
  post:       { bg: "rgba(139,92,246,0.14)",  bd: "rgba(139,92,246,0.4)",  fg: "#c4b5fd" },
  lab:        { bg: "rgba(34,211,238,0.14)",   bd: "rgba(34,211,238,0.4)",   fg: "#67e8f9" },
  drill:      { bg: "rgba(34,197,94,0.14)",    bd: "rgba(34,197,94,0.4)",    fg: "#86efac" },
  project:    { bg: "rgba(245,158,11,0.14)",   bd: "rgba(245,158,11,0.4)",   fg: "#fcd34d" },
  question:   { bg: "rgba(34,197,94,0.14)",    bd: "rgba(34,197,94,0.4)",    fg: "#86efac" },
};

function KindBadge({ kind }) {
  if (!kind) return null;
  const c = KIND_COLORS[kind] || KIND_COLORS.post;
  return (
    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded shrink-0"
      style={{ background: c.bg, border: `1px solid ${c.bd}`, color: c.fg }}>
      {kind}
    </span>
  );
}

export default function CompanyTracks({ onNavigate, onNavigateTo }) {
  const [company, setCompany] = useState(COMPANIES[0]);
  const [role, setRole] = useState(ROLES[0]);
  const [level, setLevel] = useState(LEVELS[1]); // default Senior
  const [q, setQ] = useState("");

  const shown = COMPANIES.filter(c => c.toLowerCase().includes(q.toLowerCase()));
  const items = getCompanyTrackItems(company, role, level);
  const profile = COMPANY_PROFILES[company];
  const reportedQs = useMemo(() => questionsForCompany(company), [company]);

  const chip = (active, accent) => ({
    padding: "6px 12px", fontSize: 13, fontWeight: 600, cursor: "pointer",
    borderRadius: 8, whiteSpace: "nowrap",
    border: `1px solid ${active ? accent : "var(--border)"}`,
    background: active ? accent : "transparent",
    color: active ? "#0a0a0a" : "var(--text-muted, #a1a1aa)",
  });

  return (
    <div className="flex" style={{ height: "calc(100vh - 0px)", minHeight: "100vh" }}>
      {/* Company rail */}
      <div className="shrink-0 overflow-y-auto"
        style={{ width: 248, borderRight: "1px solid var(--border)", background: "var(--surface)", padding: "1rem 0.6rem" }}>
        <div className="text-[11px] font-bold uppercase tracking-widest px-1 mb-2" style={{ color: "var(--text-muted, #71717a)" }}>
          Companies
        </div>
        <input
          value={q} onChange={e => setQ(e.target.value)} placeholder="Search company…"
          className="w-full box-border text-[13px] mb-2 outline-none"
          style={{ padding: "6px 9px", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 7, color: "var(--text, #e4e4e7)" }}
        />
        {shown.map(c => {
          const on = c === company;
          const has = companyHasTrack(c);
          return (
            <button key={c} onClick={() => setCompany(c)}
              className="w-full text-left flex items-center gap-2 mb-0.5"
              style={{
                padding: "7px 9px", borderRadius: 8, fontSize: "0.85rem",
                background: on ? "rgba(139,92,246,0.14)" : "transparent",
                border: `1px solid ${on ? "rgba(139,92,246,0.45)" : "transparent"}`,
                color: on ? "var(--text, #e4e4e7)" : "var(--text-muted, #a1a1aa)",
                fontWeight: on ? 700 : 500, cursor: "pointer",
              }}>
              <CompanyLogo company={c} size={18} />
              <span className="overflow-hidden text-ellipsis whitespace-nowrap flex-1">{c}</span>
              {has && <span title="Has a curated track" style={{ width: 6, height: 6, borderRadius: 999, background: "#22c55e", flexShrink: 0 }} />}
            </button>
          );
        })}
        {shown.length === 0 && (
          <div className="text-[12px] px-1 py-3" style={{ color: "var(--text-muted, #71717a)" }}>No match.</div>
        )}
      </div>

      {/* Detail */}
      <div className="flex-1 overflow-y-auto min-w-0" style={{ background: "var(--bg)", padding: "1.5rem 2rem" }}>
        <div className="flex items-center gap-3 mb-1">
          <CompanyLogo company={company} size={30} />
          <h1 className="text-2xl font-extrabold" style={{ color: "var(--text, #f4f4f5)" }}>{company}</h1>
        </div>
        <p className="text-[13px] mb-4" style={{ color: "var(--text-muted, #a1a1aa)", lineHeight: 1.5, maxWidth: 640 }}>
          Curated prep for {company} — pick a role and seniority. Each item opens the exact
          Foundations track, Ground Truth post, lab, or PrepLab drill you need, in order.
        </p>

        {/* Researched interview profile — how this company actually interviews (sourced). */}
        {profile && (
          <div className="rounded-xl mb-6" style={{ border: "1px solid var(--border)", background: "var(--surface)", padding: "16px 18px" }}>
            <div className="text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color: "#a5b4fc" }}>
              How {company} interviews
            </div>
            <p className="text-[13px] mb-3" style={{ color: "var(--text, #e4e4e7)", lineHeight: 1.6 }}>{profile.overview}</p>

            <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1fr" }}>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: "var(--text-muted, #71717a)" }}>The loop</div>
                <ol className="flex flex-col gap-1.5 list-none p-0 m-0">
                  {profile.process.map((r, i) => (
                    <li key={i} className="flex gap-2 text-[12.5px]" style={{ color: "var(--text-muted, #a1a1aa)", lineHeight: 1.45 }}>
                      <span className="font-mono shrink-0" style={{ color: "#71717a" }}>{i + 1}.</span>
                      <span><span style={{ color: "var(--text, #e4e4e7)", fontWeight: 600 }}>{r.round}</span> — {r.detail}</span>
                    </li>
                  ))}
                </ol>
              </div>
              <div className="flex flex-col gap-3">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: "var(--text-muted, #71717a)" }}>What they weight</div>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.emphasis.map((e, i) => (
                      <span key={i} className="text-[11px] px-2 py-0.5 rounded" style={{ background: "rgba(139,92,246,0.14)", border: "1px solid rgba(139,92,246,0.3)", color: "#c4b5fd" }}>{e}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: "var(--text-muted, #71717a)" }}>Focus your prep</div>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.focusAreas.map((f, i) => (
                      <span key={i} className="text-[11px] px-2 py-0.5 rounded" style={{ background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.3)", color: "#a5b4fc" }}>{f}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {profile.prep && (
              <p className="text-[12.5px] mt-3 pt-3" style={{ color: "var(--text-muted, #a1a1aa)", lineHeight: 1.55, borderTop: "1px solid var(--border)" }}>
                <span style={{ color: "#86efac", fontWeight: 700 }}>Prep angle: </span>{profile.prep}
              </p>
            )}
            {profile.sources?.length > 0 && (
              <div className="text-[10.5px] mt-2 flex flex-wrap items-center gap-x-2 gap-y-0.5" style={{ color: "var(--text-muted, #71717a)" }}>
                <span>Based on public reports:</span>
                {profile.sources.map((s, i) => (
                  <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" style={{ color: "#818cf8", textDecoration: "underline" }}>{s.title}</a>
                ))}
              </div>
            )}
          </div>
        )}

        {/* R1/R8 (2026-07-03, revised): Interview Signal + Questions-by-Company DELETED — no clean
            native integration, so per instruction both components were removed rather than embedded. */}
        <div className="text-[11px] font-bold uppercase tracking-widest mb-1.5" style={{ color: "var(--text-muted, #71717a)" }}>Role</div>
        <div className="flex gap-2 flex-wrap mb-4">
          {ROLES.map(r => <button key={r} style={chip(r === role, "#8b5cf6")} onClick={() => setRole(r)}>{r}</button>)}
        </div>

        <div className="text-[11px] font-bold uppercase tracking-widest mb-1.5" style={{ color: "var(--text-muted, #71717a)" }}>Seniority</div>
        <div className="flex gap-2 flex-wrap mb-6">
          {LEVELS.map(l => <button key={l} style={chip(l === level, "#6366f1")} onClick={() => setLevel(l)}>{l}</button>)}
        </div>

        <div className="text-[12.5px] mb-3" style={{ color: "var(--text-muted, #a1a1aa)" }}>
          <span style={{ color: "var(--text, #e4e4e7)", fontWeight: 700 }}>{company}</span> · {role} · {level}
          {items.length > 0 && <span> · {items.length} steps</span>}
        </div>

        {items.length === 0 ? (
          <div className="rounded-xl"
            style={{ border: "1px dashed var(--border)", padding: "22px 20px", color: "var(--text-muted, #a1a1aa)", fontSize: 13.5, lineHeight: 1.6, background: "var(--surface)" }}>
            <div style={{ fontWeight: 700, color: "var(--text, #e4e4e7)", marginBottom: 6 }}>Coming soon</div>
            No curated track for this company / role / level yet. The scaffold is ready — when a
            path is authored it appears here as an ordered checklist you can open directly.
            <div className="mt-3">
              <button onClick={() => { setCompany("Google"); setRole("Applied AI Engineer"); setLevel("Senior"); }}
                className="text-[12.5px] font-semibold"
                style={{ color: "#a5b4fc", cursor: "pointer", background: "transparent", border: "none", padding: 0 }}>
                See a fully-populated example → Google · Applied AI Engineer · Senior
              </button>
            </div>
          </div>
        ) : (
          <ol className="flex flex-col gap-2 list-none p-0 m-0">
            {items.map((it, i) => (
              <li key={i}>
                <button
                  onClick={() => openItem(onNavigateTo, it)}
                  className="w-full text-left flex items-center gap-3 group"
                  style={{
                    padding: "11px 14px", borderRadius: 10, cursor: "pointer",
                    background: "var(--surface)", border: "1px solid var(--border)",
                    color: "var(--text, #e4e4e7)", fontSize: 14, fontWeight: 600,
                    transition: "border-color 0.12s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(139,92,246,0.55)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; }}>
                  <span className="text-[11px] font-mono shrink-0 w-5 text-center" style={{ color: "var(--text-muted, #71717a)" }}>{i + 1}</span>
                  <KindBadge kind={it.kind} />
                  <span className="flex-1 min-w-0">{it.label}</span>
                  <span className="shrink-0" style={{ color: "var(--text-muted, #71717a)" }}>→</span>
                </button>
              </li>
            ))}
          </ol>
        )}

        {/* Reported interview questions — pulled from our own bank via source attribution */}
        {reportedQs.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center gap-2 mb-2">
              <CompanyLogo company={company} size={18} />
              <div className="text-[11px] font-bold uppercase tracking-widest" style={{ color: "var(--text-muted, #71717a)" }}>
                Reported at {company} · {reportedQs.length}
              </div>
            </div>
            <p className="text-[12px] mb-3" style={{ color: "var(--text-muted, #a1a1aa)" }}>
              Questions from our bank attributed to {company} interviews. Open the Question Bank to drill them.
            </p>
            <div className="flex flex-col gap-1.5">
              {reportedQs.slice(0, 12).map(qq => {
                const meta = TIER_META[questionTier(qq)];
                return (
                  <button key={qq.id}
                    onClick={() => onNavigateTo && onNavigateTo({ tab: "preplab", mode: "browse" })}
                    className="w-full text-left flex items-start gap-2.5"
                    style={{ padding: "10px 12px", borderRadius: 10, cursor: "pointer",
                      background: "var(--surface)", border: "1px solid var(--border)", transition: "border-color 0.12s" }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(139,92,246,0.5)"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; }}>
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded shrink-0 mt-0.5 ${meta.chip}`}>{meta.label}</span>
                    <span className="flex-1 min-w-0 text-[13px]" style={{ color: "var(--text, #e4e4e7)" }}>{qq.question}</span>
                  </button>
                );
              })}
            </div>
            {reportedQs.length > 12 && (
              <div className="text-[11px] mt-2" style={{ color: "var(--text-muted, #71717a)" }}>+{reportedQs.length - 12} more in the Question Bank</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
