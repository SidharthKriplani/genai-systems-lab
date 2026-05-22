import { useState, useEffect, useRef } from "react";

const STORAGE_KEY = "__wr_b26";
const STATUS_OPTIONS = ["raw", "testing", "active", "dropped"];
const STATUS_COLORS = {
  raw:     { bg: "bg-zinc-700", text: "text-zinc-300", dot: "bg-zinc-400" },
  testing: { bg: "bg-amber-900/60", text: "text-amber-300", dot: "bg-amber-400" },
  active:  { bg: "bg-emerald-900/60", text: "text-emerald-300", dot: "bg-emerald-400" },
  dropped: { bg: "bg-zinc-800", text: "text-zinc-600", dot: "bg-zinc-600" },
};

function loadIdeas() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); }
  catch { return []; }
}
function saveIdeas(ideas) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(ideas)); } catch {}
}
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

const BLANK_FORM = { title: "", thesis: "", why: "", status: "raw", notes: "" };

export default function WarRoom({ onClose }) {
  const [ideas, setIdeas] = useState(loadIdeas);
  const [form, setForm] = useState(BLANK_FORM);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState("all");
  const [expandedId, setExpandedId] = useState(null);
  const titleRef = useRef(null);

  useEffect(() => {
    saveIdeas(ideas);
  }, [ideas]);

  useEffect(() => {
    if (showForm && titleRef.current) titleRef.current.focus();
  }, [showForm]);

  // close on Escape
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") {
        if (showForm) { setShowForm(false); setEditId(null); setForm(BLANK_FORM); }
        else { onClose(); }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showForm, onClose]);

  function openNew() {
    setForm(BLANK_FORM);
    setEditId(null);
    setShowForm(true);
  }

  function openEdit(idea) {
    setForm({ title: idea.title, thesis: idea.thesis, why: idea.why, status: idea.status, notes: idea.notes || "" });
    setEditId(idea.id);
    setShowForm(true);
  }

  function saveForm() {
    if (!form.title.trim()) return;
    if (editId) {
      setIdeas(prev => prev.map(i => i.id === editId ? { ...i, ...form, updatedAt: Date.now() } : i));
    } else {
      setIdeas(prev => [{ id: uid(), ...form, createdAt: Date.now(), updatedAt: Date.now() }, ...prev]);
    }
    setShowForm(false);
    setEditId(null);
    setForm(BLANK_FORM);
  }

  function cycleStatus(id) {
    setIdeas(prev => prev.map(i => {
      if (i.id !== id) return i;
      const next = STATUS_OPTIONS[(STATUS_OPTIONS.indexOf(i.status) + 1) % STATUS_OPTIONS.length];
      return { ...i, status: next, updatedAt: Date.now() };
    }));
  }

  function deleteIdea(id) {
    setIdeas(prev => prev.filter(i => i.id !== id));
    if (expandedId === id) setExpandedId(null);
  }

  const filtered = filter === "all" ? ideas : ideas.filter(i => i.status === filter);

  const counts = STATUS_OPTIONS.reduce((acc, s) => {
    acc[s] = ideas.filter(i => i.status === s).length;
    return acc;
  }, {});

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col"
      style={{ background: "#09090b" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
        <div className="flex items-center gap-4">
          <span className="text-zinc-100 font-mono text-sm font-bold tracking-widest uppercase">WAR ROOM</span>
          <span className="text-zinc-600 text-xs font-mono">{ideas.length} ideas</span>
        </div>
        <div className="flex items-center gap-3">
          {/* Filter pills */}
          <div className="flex items-center gap-1">
            {["all", ...STATUS_OPTIONS].map(s => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-2 py-0.5 rounded text-xs font-mono transition-colors ${
                  filter === s
                    ? "bg-zinc-200 text-zinc-900"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {s}{s !== "all" && counts[s] > 0 ? ` ${counts[s]}` : ""}
              </button>
            ))}
          </div>
          <button
            onClick={openNew}
            className="px-3 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-mono transition-colors"
          >
            + new idea
          </button>
          <button
            onClick={onClose}
            className="text-zinc-600 hover:text-zinc-300 text-xs font-mono transition-colors"
          >
            esc
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {filtered.length === 0 && (
          <div className="text-center py-24 text-zinc-700 font-mono text-sm">
            {filter === "all" ? "no ideas yet. start with + new idea" : `no ideas in ${filter}`}
          </div>
        )}
        <div className="grid gap-3 max-w-4xl mx-auto">
          {filtered.map(idea => {
            const sc = STATUS_COLORS[idea.status];
            const expanded = expandedId === idea.id;
            return (
              <div
                key={idea.id}
                className={`rounded-lg border border-zinc-800 bg-zinc-900 transition-all ${idea.status === "dropped" ? "opacity-40" : ""}`}
              >
                <div className="flex items-start gap-3 p-4">
                  {/* Status dot — click to cycle */}
                  <button
                    onClick={() => cycleStatus(idea.id)}
                    title={`status: ${idea.status} — click to cycle`}
                    className={`mt-1 w-2.5 h-2.5 rounded-full shrink-0 ${sc.dot} hover:ring-2 hover:ring-zinc-500 transition-all`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-zinc-100 font-mono text-sm font-semibold">{idea.title}</span>
                        {idea.thesis && (
                          <p className="text-zinc-400 text-xs mt-0.5 leading-relaxed">{idea.thesis}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${sc.bg} ${sc.text}`}>
                          {idea.status}
                        </span>
                        <button
                          onClick={() => setExpandedId(expanded ? null : idea.id)}
                          className="text-zinc-600 hover:text-zinc-300 text-xs font-mono"
                        >
                          {expanded ? "less" : "more"}
                        </button>
                        <button
                          onClick={() => openEdit(idea)}
                          className="text-zinc-600 hover:text-zinc-300 text-xs font-mono"
                        >
                          edit
                        </button>
                        <button
                          onClick={() => deleteIdea(idea.id)}
                          className="text-zinc-700 hover:text-red-500 text-xs font-mono transition-colors"
                        >
                          ×
                        </button>
                      </div>
                    </div>

                    {expanded && (
                      <div className="mt-3 space-y-2 border-t border-zinc-800 pt-3">
                        {idea.why ? (
                          <div>
                            <span className="text-zinc-600 text-[10px] font-mono uppercase tracking-wider">why this · why now · why me</span>
                            <p className="text-zinc-300 text-xs mt-1 leading-relaxed whitespace-pre-wrap">{idea.why}</p>
                          </div>
                        ) : (
                          <p className="text-zinc-700 text-xs font-mono italic">no why/now/me — fill this or it stays raw forever</p>
                        )}
                        {idea.notes && (
                          <div>
                            <span className="text-zinc-600 text-[10px] font-mono uppercase tracking-wider">notes</span>
                            <p className="text-zinc-400 text-xs mt-1 leading-relaxed whitespace-pre-wrap">{idea.notes}</p>
                          </div>
                        )}
                        <p className="text-zinc-700 text-[10px] font-mono">
                          added {new Date(idea.createdAt).toLocaleDateString()}
                          {idea.updatedAt !== idea.createdAt && ` · updated ${new Date(idea.updatedAt).toLocaleDateString()}`}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add / Edit form — slides up from bottom */}
      {showForm && (
        <div className="border-t border-zinc-800 bg-zinc-950 px-6 py-5">
          <div className="max-w-4xl mx-auto space-y-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-zinc-400 text-xs font-mono uppercase tracking-wider">
                {editId ? "edit idea" : "new idea"}
              </span>
              <button
                onClick={() => { setShowForm(false); setEditId(null); setForm(BLANK_FORM); }}
                className="text-zinc-600 hover:text-zinc-300 text-xs font-mono"
              >
                cancel
              </button>
            </div>
            <input
              ref={titleRef}
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="idea title"
              className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-zinc-100 text-sm font-mono placeholder-zinc-600 focus:outline-none focus:border-zinc-500"
            />
            <input
              value={form.thesis}
              onChange={e => setForm(f => ({ ...f, thesis: e.target.value }))}
              placeholder="one-line thesis — what's the bet?"
              className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-zinc-300 text-xs font-mono placeholder-zinc-600 focus:outline-none focus:border-zinc-500"
            />
            <textarea
              value={form.why}
              onChange={e => setForm(f => ({ ...f, why: e.target.value }))}
              placeholder="why this, why now, why me — leave blank and it stays raw forever"
              rows={3}
              className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-zinc-300 text-xs font-mono placeholder-zinc-600 focus:outline-none focus:border-zinc-500 resize-none"
            />
            <textarea
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              placeholder="notes, links, data points (optional)"
              rows={2}
              className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-zinc-300 text-xs font-mono placeholder-zinc-600 focus:outline-none focus:border-zinc-500 resize-none"
            />
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {STATUS_OPTIONS.map(s => {
                  const sc = STATUS_COLORS[s];
                  return (
                    <button
                      key={s}
                      onClick={() => setForm(f => ({ ...f, status: s }))}
                      className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs font-mono transition-colors ${
                        form.status === s ? `${sc.bg} ${sc.text}` : "text-zinc-600 hover:text-zinc-400"
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                      {s}
                    </button>
                  );
                })}
              </div>
              <div className="flex-1" />
              <button
                onClick={saveForm}
                disabled={!form.title.trim()}
                className="px-4 py-1.5 rounded bg-zinc-200 hover:bg-white text-zinc-900 text-xs font-mono font-bold disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                {editId ? "save changes" : "add idea"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
