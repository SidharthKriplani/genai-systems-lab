import { useState } from "react";
import { CompanyLogo } from "./CompanyLogo.jsx";
import {
  COMPANIES, ROLES, LEVELS, getCompanyTrackItems, companyHasTrack,
} from "./data/companyTracks.js";

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

        {/* R7 (Rev-2): Company Tracks is the ONE company home. These three tiles surface everything
            company-specific: the Question-Bank slice, the Interview-Signal intel, and the spoken
            Company Scenarios — the standalone modes those used to live in have been retired from
            PrepLab / Fluency and now route through here. */}
        <div className="text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color: "var(--text-muted, #71717a)" }}>
          Everything for this company
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-6">
          {[
            {
              key: "questions",
              title: "Questions",
              desc: "Archetype-weighted slice of the Question Bank.",
              accent: "#22c55e",
              onClick: () => onNavigateTo && onNavigateTo({ tab: "preplab", mode: "companyprep" }),
            },
            {
              key: "intel",
              title: "Interview intel",
              desc: "Real loop patterns — what's actually tested.",
              accent: "#818cf8",
              onClick: () => onNavigateTo && onNavigateTo({ tab: "preplab", mode: "intexp" }),
            },
            {
              key: "spoken",
              title: "Spoken scenarios",
              desc: "Bespoke company cases to reason out loud.",
              accent: "#f59e0b",
              onClick: () => {
                try { localStorage.setItem("gsl-fluency-initial", "cases"); } catch {}
                if (onNavigate) onNavigate("fluency"); else window.location.hash = "fluency";
              },
            },
          ].map(t => (
            <button key={t.key} onClick={t.onClick}
              className="text-left group"
              style={{
                padding: "12px 14px", borderRadius: 10, cursor: "pointer",
                background: "var(--surface)", border: "1px solid var(--border)",
                transition: "border-color 0.12s",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = t.accent + "88"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; }}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[13px] font-bold" style={{ color: "var(--text, #e4e4e7)" }}>{t.title}</span>
                <span style={{ color: t.accent }}>→</span>
              </div>
              <div className="text-[11.5px] leading-snug" style={{ color: "var(--text-muted, #a1a1aa)" }}>{t.desc}</div>
            </button>
          ))}
        </div>

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
      </div>
    </div>
  );
}
