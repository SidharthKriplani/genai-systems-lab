import React, { useState, useEffect, useRef } from "react";
import {
  getTracks, createTrack, renameTrack, deleteTrack,
  addNote, updateNote, removeItem, reorderItems, moveItem, seedTierTracks,
} from "./utils/tracks.js";
import { MODULE_SEARCH_INDEX } from "./data/moduleSearchIndex";

// moduleId → foundation/gym label, so saved Foundation modules group by their
// foundation (Language Models, Retrieval, NLP Foundations…) not their raw tag.
const GYM_BY_MODULE = Object.fromEntries(MODULE_SEARCH_INDEX.map(m => [m.id, m.gymLabel]));
const GYMID_BY_MODULE = Object.fromEntries(MODULE_SEARCH_INDEX.map(m => [m.id, m.gymId]));
function conceptGym(item) {
  return (item.type === "concept" && GYM_BY_MODULE[item.itemId]) || null;
}

const TOPIC_LABELS = {
  rag: "RAG", agents: "Agents", finetuning: "Fine-Tuning",
  evaluation: "Evaluation", llmops: "LLMOps",
  safety: "Safety", product: "Product", behavioral: "Behavioral",
  multimodal: "Multimodal", reasoning: "Reasoning",
  serving: "Serving", foundations: "Foundations",
  "agent-eval": "Agent Evaluation", "rag-ingestion": "RAG Ingestion",
  "model-routing": "Model Routing", "llm-security": "LLM Security",
};

const DIFF_STYLES = {
  easy:   "bg-emerald-950/50 text-emerald-400 border border-emerald-800/40",
  medium: "bg-amber-950/50 text-amber-400 border border-amber-800/40",
  hard:   "bg-red-950/50 text-red-400 border border-red-800/40",
  beginner:     "bg-emerald-950/50 text-emerald-400 border border-emerald-800/40",
  intermediate: "bg-amber-950/50 text-amber-400 border border-amber-800/40",
  advanced:     "bg-red-950/50 text-red-400 border border-red-800/40",
};

const TYPE_LABELS = {
  preplab: "PrepLab", note: "Notes", gt_post: "GT Posts",
  hub_q: "Foundations Q", concept: "Concepts",
  cheatsheet: "Quick Reference", sd_scenario: "System Design",
  code_exercise: "Code Exercises", code_lab: "Code Labs",
  company_track: "Company Tracks", judgment: "Judgment",
};

// Group items by category (meta.category) or a readable type label, keeping
// each item's true index in track.items and first-appearance order of groups.
function groupItems(items) {
  const groups = [];
  const byKey = {};
  items.forEach((item, idx) => {
    const key = conceptGym(item) || item.meta?.category || item.meta?.tag || TYPE_LABELS[item.type] || item.type;
    if (!byKey[key]) {
      byKey[key] = { key, entries: [] };
      groups.push(byKey[key]);
    }
    byKey[key].entries.push({ item, idx });
  });
  return groups;
}

function TopicBadge({ topic }) {
  if (!topic) return null;
  return (
    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded"
      style={{ background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.3)", color: "#c4b5fd" }}>
      {TOPIC_LABELS[topic] || topic}
    </span>
  );
}

function DiffBadge({ difficulty }) {
  if (!difficulty) return null;
  const cls = DIFF_STYLES[difficulty] || DIFF_STYLES.medium;
  return (
    <span className={`text-[10px] font-mono font-black uppercase tracking-widest px-2 py-0.5 rounded ${cls}`}>
      {difficulty}
    </span>
  );
}

function TrackList({ tracks, selectedId, onSelect, onCreate, onDelete, onMoveItem, onBuildTiers }) {
  const [hoverId, setHoverId] = useState(null);
  const [dropId, setDropId] = useState(null);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (creating && inputRef.current) inputRef.current.focus();
  }, [creating]);

  function handleCreate(e) {
    e.preventDefault();
    if (!newName.trim()) return;
    onCreate(newName.trim());
    setNewName("");
    setCreating(false);
  }

  return (
    <div className={`${selectedId ? "hidden sm:flex" : "flex"} flex-col shrink-0 overflow-y-auto w-full sm:w-60`}
      style={{ borderRight: "1px solid rgba(63,63,70,0.5)", padding: "1rem 0.5rem", background: "rgba(9,9,11,0.6)" }}>
      <div className="flex items-center justify-between px-2 mb-3">
        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">My Tracks</span>
        <button onClick={() => setCreating(true)} title="New track"
          style={{ background: "none", border: "none", cursor: "pointer", color: "#8b5cf6", fontSize: "1.1rem", lineHeight: 1, padding: "0 0.2rem" }}>+</button>
      </div>

      {onBuildTiers && (
        <button
          onClick={onBuildTiers}
          title="Create the S / A / B tier tracks from every Foundation module, ranked by interview frequency"
          className="mx-2 mb-3 text-[11px] font-semibold rounded-lg px-2 py-1.5 transition-colors hover:opacity-90"
          style={{ background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.35)", color: "#fcd34d", cursor: "pointer" }}
        >
          Build S / A / B tier tracks
        </button>
      )}

      {creating && (
        <form onSubmit={handleCreate} className="flex gap-1.5 px-2 mb-2">
          <input
            ref={inputRef}
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="Track name…"
            className="flex-1 text-xs px-2 py-1.5 rounded-lg outline-none"
            style={{ background: "rgba(39,39,42,0.8)", border: "1px solid rgba(63,63,70,0.7)", color: "#f4f4f5" }}
            onKeyDown={e => { if (e.key === "Escape") { setCreating(false); setNewName(""); } }}
          />
          <button type="submit" disabled={!newName.trim()}
            className="px-2 py-1.5 text-xs font-semibold rounded-lg text-white transition-opacity"
            style={{ background: "#7c3aed", opacity: newName.trim() ? 1 : 0.4 }}>Add</button>
        </form>
      )}

      {tracks.length === 0 && !creating && (
        <p className="text-xs text-zinc-600 px-2 leading-relaxed">
          No tracks yet. Hit + to create one, then add content using the + buttons across the app.
        </p>
      )}

      {tracks.map(t => (
        <div
          key={t.id}
          onClick={() => onSelect(t.id)}
          onMouseEnter={() => setHoverId(t.id)}
          onMouseLeave={() => setHoverId(null)}
          onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; setDropId(t.id); }}
          onDragLeave={() => setDropId(prev => (prev === t.id ? null : prev))}
          onDrop={e => {
            e.preventDefault();
            setDropId(null);
            try {
              const d = JSON.parse(e.dataTransfer.getData("application/x-track-item"));
              if (d && d.fromTrackId && d.fromTrackId !== t.id && Number.isInteger(d.index)) {
                onMoveItem(d.fromTrackId, t.id, d.index);
              }
            } catch (err) {}
          }}
          className="flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer mb-0.5 transition-all"
          style={{
            background: dropId === t.id ? "rgba(124,58,237,0.25)" : t.id === selectedId ? "rgba(124,58,237,0.15)" : hoverId === t.id ? "rgba(39,39,42,0.5)" : "transparent",
            border: `1px solid ${dropId === t.id ? "rgba(139,92,246,0.7)" : t.id === selectedId ? "rgba(139,92,246,0.5)" : "transparent"}`,
          }}
        >
          <div className="min-w-0">
            <div className="text-sm font-semibold truncate"
              style={{ color: t.id === selectedId ? "#e4d4fc" : "#d4d4d8" }}>
              {t.name}
            </div>
            <div className="text-[11px] text-zinc-600 mt-0.5">
              {t.items.length} item{t.items.length !== 1 ? "s" : ""}
            </div>
          </div>
          {hoverId === t.id && (
            <button
              onClick={e => { e.stopPropagation(); if (window.confirm('Delete this track? This cannot be undone.')) onDelete(t.id); }}
              className="text-zinc-600 hover:text-red-400 text-xs ml-2 shrink-0 transition-colors"
              style={{ background: "none", border: "none", cursor: "pointer" }}
            >✕</button>
          )}
        </div>
      ))}
    </div>
  );
}

function TrackDetail({ track, onNavigate, onNavigateTo, onBack, onRename, onAddNote, onUpdateNote, onRemoveItem, onReorderItems }) {
  const [editingName, setEditingName] = useState(false);
  const [editNoteIdx, setEditNoteIdx] = useState(null);
  const [editNoteDraft, setEditNoteDraft] = useState("");
  const [draftName, setDraftName] = useState(track.name);
  const [noteText, setNoteText] = useState("");
  const [dragFrom, setDragFrom] = useState(null);
  const nameInputRef = useRef(null);

  useEffect(() => {
    setDraftName(track.name);
    setEditingName(false);
  }, [track.id, track.name]);

  useEffect(() => {
    if (editingName && nameInputRef.current) nameInputRef.current.focus();
  }, [editingName]);

  function submitName(e) {
    if (e) e.preventDefault();
    const n = draftName.trim();
    if (n && n !== track.name) onRename(n);
    setEditingName(false);
  }

  function handleAddNote(e) {
    e.preventDefault();
    if (!noteText.trim()) return;
    onAddNote(noteText.trim());
    setNoteText("");
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:px-8 sm:py-6" style={{ minWidth: 0 }}>
      {/* Mobile: back to the track list */}
      <button onClick={onBack}
        className="sm:hidden mb-4 text-xs font-medium text-zinc-400 hover:text-white flex items-center gap-1"
        style={{ background: "none", border: "none", cursor: "pointer" }}>← All tracks</button>
      {/* Track title */}
      <div className="flex items-center gap-2 mb-6">
        {editingName ? (
          <form onSubmit={submitName} className="flex items-center gap-2">
            <input
              ref={nameInputRef}
              value={draftName}
              onChange={e => setDraftName(e.target.value)}
              onBlur={() => submitName()}
              onKeyDown={e => { if (e.key === "Escape") { setDraftName(track.name); setEditingName(false); } }}
              className="text-xl font-bold rounded-lg px-2 py-0.5 outline-none"
              style={{ color: "#f4f4f5", background: "rgba(39,39,42,0.8)", border: "1px solid #7c3aed" }}
            />
            <button type="submit"
              className="px-3 py-1 text-xs font-semibold rounded-lg text-white"
              style={{ background: "#7c3aed" }}>Save</button>
          </form>
        ) : (
          <>
            <h2 className="text-xl font-bold text-white m-0">{track.name}</h2>
            <button onClick={() => setEditingName(true)} title="Rename"
              className="text-zinc-600 hover:text-zinc-400 text-sm transition-colors"
              style={{ background: "none", border: "none", cursor: "pointer" }}>✎</button>
          </>
        )}
        <span className="ml-auto text-xs text-zinc-600">
          {track.items.length} item{track.items.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Items */}
      {track.items.length === 0 ? (
        <p className="text-zinc-500 text-sm leading-relaxed">
          Empty track. Click the + on any PrepLab question, Ground Truth post, or Foundations question to add it here.
        </p>
      ) : (
        <div className="space-y-4 mb-6">
          {groupItems(track.items).map(group => (
            <div key={group.key} className="space-y-2">
              <div className="flex items-center gap-2 px-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                  {group.key}
                </span>
                <span className="text-[10px] font-mono text-zinc-700">·</span>
                <span className="text-[10px] font-mono text-zinc-600">{group.entries.length}</span>
              </div>
              {group.entries.map(({ item, idx }) => (
            <div
              key={idx}
              draggable={editNoteIdx !== idx}
              onDragStart={e => {
                setDragFrom(idx);
                e.dataTransfer.setData("application/x-track-item", JSON.stringify({ fromTrackId: track.id, index: idx }));
                e.dataTransfer.effectAllowed = "move";
              }}
              onDragOver={e => e.preventDefault()}
              onDrop={() => { if (dragFrom !== null && dragFrom !== idx) { onReorderItems(dragFrom, idx); setDragFrom(null); } }}
              onDragEnd={() => setDragFrom(null)}
              className="flex items-start gap-2 rounded-xl p-4 transition-all"
              style={{
                background: dragFrom === idx ? "rgba(124,58,237,0.15)" : "rgba(24,24,27,0.9)",
                border: `1px solid ${dragFrom === idx ? "rgba(139,92,246,0.5)" : "rgba(63,63,70,0.6)"}`,
                cursor: "grab",
              }}
            >
              <span className="text-zinc-700 text-xs mt-0.5 shrink-0 select-none">⠿</span>

              {item.type === "preplab" ? (
                <>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
                      <TopicBadge topic={item.topic} />
                      <DiffBadge difficulty={item.difficulty} />
                    </div>
                    <p className="text-sm text-zinc-200 leading-snug font-medium">{item.title}</p>
                  </div>
                  <button
                    onClick={() => onNavigate("preplab")}
                    title="Open PrepLab"
                    className="shrink-0 text-xs px-2.5 py-1 rounded-lg border text-zinc-400 border-zinc-700 hover:border-violet-500 hover:text-violet-400 transition-all"
                    style={{ background: "none", cursor: "pointer", whiteSpace: "nowrap" }}
                  >Open →</button>
                </>
              ) : item.type === "note" ? (
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-[10px] font-mono text-zinc-600 uppercase tracking-wider">Note</div>
                    {editNoteIdx !== idx && (
                      <button onClick={() => { setEditNoteIdx(idx); setEditNoteDraft(item.content); }}
                        title="Edit note"
                        className="text-zinc-600 hover:text-violet-400 text-xs transition-colors"
                        style={{ background: "none", border: "none", cursor: "pointer" }}>✎ Edit</button>
                    )}
                  </div>
                  {editNoteIdx === idx ? (
                    <div>
                      <textarea
                        value={editNoteDraft}
                        onChange={e => setEditNoteDraft(e.target.value)}
                        rows={4}
                        autoFocus
                        className="w-full text-sm rounded-lg px-2 py-1.5 outline-none leading-relaxed"
                        style={{ background: "rgba(39,39,42,0.9)", border: "1px solid #7c3aed", color: "#f4f4f5", resize: "vertical" }}
                        onKeyDown={e => { if (e.key === "Escape") setEditNoteIdx(null); }}
                      />
                      <div className="flex gap-2 mt-1.5">
                        <button onClick={() => { onUpdateNote(idx, editNoteDraft.trim()); setEditNoteIdx(null); }}
                          className="px-2.5 py-1 text-xs font-semibold rounded-lg text-white"
                          style={{ background: "#7c3aed", cursor: "pointer", border: "none" }}>Save</button>
                        <button onClick={() => setEditNoteIdx(null)}
                          className="px-2.5 py-1 text-xs text-zinc-400 hover:text-zinc-200"
                          style={{ background: "none", border: "none", cursor: "pointer" }}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-zinc-400 leading-relaxed whitespace-pre-wrap">{item.content}</p>
                  )}
                </div>
              ) : (
                <>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
                      <span style={{
                        fontSize: "0.62rem", fontWeight: 700, color: "#a78bfa",
                        background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.3)",
                        borderRadius: "4px", padding: "0.05rem 0.35rem",
                        textTransform: "uppercase", letterSpacing: "0.04em",
                      }}>
                        {item.type === "gt_post" ? "GT Post"
                          : item.type === "hub_q" ? "Foundations Q"
                          : item.type === "concept" ? "Concept"
                          : TYPE_LABELS[item.type] || item.type}
                      </span>
                      {(item.meta?.difficulty || item.meta?.level) && (
                        <DiffBadge difficulty={(item.meta.difficulty || item.meta.level).toLowerCase()} />
                      )}
                      {(conceptGym(item) || item.meta?.category || item.meta?.tag) && (
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded"
                          style={{ background: "rgba(99,102,241,0.14)", border: "1px solid rgba(99,102,241,0.3)", color: "#a5b4fc" }}>
                          {conceptGym(item) || item.meta.category || item.meta.tag}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-zinc-200 leading-snug font-medium">{item.label}</p>
                  </div>
                  {item.type === "gt_post" && (
                    <button
                      onClick={() => onNavigate("groundtruth")}
                      title="Open Ground Truth"
                      className="shrink-0 text-xs px-2.5 py-1 rounded-lg border text-zinc-400 border-zinc-700 hover:border-violet-500 hover:text-violet-400 transition-all"
                      style={{ background: "none", cursor: "pointer", whiteSpace: "nowrap" }}
                    >Read →</button>
                  )}
                  {item.type === "hub_q" && (
                    <button
                      onClick={() => onNavigate("preplab")}
                      title="Open PrepLab"
                      className="shrink-0 text-xs px-2.5 py-1 rounded-lg border text-zinc-400 border-zinc-700 hover:border-violet-500 hover:text-violet-400 transition-all"
                      style={{ background: "none", cursor: "pointer", whiteSpace: "nowrap" }}
                    >Answer →</button>
                  )}
                  {item.type === "concept" && (
                    <button
                      onClick={() => (onNavigateTo
                        ? onNavigateTo({ tab: "concepts", gymId: GYMID_BY_MODULE[item.itemId], moduleId: item.itemId })
                        : onNavigate("concepts"))}
                      title="Open Concepts"
                      className="shrink-0 text-xs px-2.5 py-1 rounded-lg border text-zinc-400 border-zinc-700 hover:border-violet-500 hover:text-violet-400 transition-all"
                      style={{ background: "none", cursor: "pointer", whiteSpace: "nowrap" }}
                    >Study →</button>
                  )}
                  {item.type === "cheatsheet" && (
                    <button
                      onClick={() => onNavigate?.("preplab")}
                      title="Open Quick Reference"
                      className="shrink-0 text-xs px-2.5 py-1 rounded-lg border text-zinc-400 border-zinc-700 hover:border-violet-500 hover:text-violet-400 transition-all"
                      style={{ background: "none", cursor: "pointer", whiteSpace: "nowrap" }}
                    >Open →</button>
                  )}
                  {item.type === "sd_scenario" && (
                    <button
                      onClick={() => onNavigate?.("sysdesign")}
                      title="Open System Design"
                      className="shrink-0 text-xs px-2.5 py-1 rounded-lg border text-zinc-400 border-zinc-700 hover:border-violet-500 hover:text-violet-400 transition-all"
                      style={{ background: "none", cursor: "pointer", whiteSpace: "nowrap" }}
                    >Open →</button>
                  )}
                  {(item.type === "code_exercise" || item.type === "code_lab") && (
                    <button
                      onClick={() => onNavigate?.("codelabs")}
                      title="Open Coding Dojo"
                      className="shrink-0 text-xs px-2.5 py-1 rounded-lg border text-zinc-400 border-zinc-700 hover:border-violet-500 hover:text-violet-400 transition-all"
                      style={{ background: "none", cursor: "pointer", whiteSpace: "nowrap" }}
                    >Open →</button>
                  )}
                  {item.type === "company_track" && (
                    <button
                      onClick={() => onNavigate?.("company-tracks")}
                      title="Open Company Tracks"
                      className="shrink-0 text-xs px-2.5 py-1 rounded-lg border text-zinc-400 border-zinc-700 hover:border-violet-500 hover:text-violet-400 transition-all"
                      style={{ background: "none", cursor: "pointer", whiteSpace: "nowrap" }}
                    >Open →</button>
                  )}
                  {item.type === "judgment" && (
                    <button
                      onClick={() => onNavigate?.("preplab")}
                      title="Open"
                      className="shrink-0 text-xs px-2.5 py-1 rounded-lg border text-zinc-400 border-zinc-700 hover:border-violet-500 hover:text-violet-400 transition-all"
                      style={{ background: "none", cursor: "pointer", whiteSpace: "nowrap" }}
                    >Open →</button>
                  )}
                </>
              )}

              <button
                onClick={() => {
                  if (item.type === "note" && !window.confirm('Delete this note? This cannot be undone.')) return;
                  onRemoveItem(idx);
                }}
                title="Remove"
                className="text-zinc-700 hover:text-red-400 text-xs transition-colors shrink-0"
                style={{ background: "none", border: "none", cursor: "pointer", padding: "0 0.1rem" }}
              >✕</button>
            </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Add note */}
      <form onSubmit={handleAddNote} className="flex gap-2 items-start">
        <textarea
          value={noteText}
          onChange={e => setNoteText(e.target.value)}
          placeholder="Add a note to this track…"
          rows={2}
          className="flex-1 text-sm rounded-xl px-3 py-2 resize-none outline-none leading-relaxed"
          style={{
            background: "rgba(24,24,27,0.8)", border: "1px solid rgba(63,63,70,0.6)",
            color: "#d4d4d8", fontFamily: "inherit",
          }}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); if (noteText.trim()) { onAddNote(noteText.trim()); setNoteText(""); } } }}
        />
        <button
          type="submit"
          disabled={!noteText.trim()}
          className="px-4 py-2 text-sm font-semibold rounded-xl text-white shrink-0 transition-opacity"
          style={{ background: "#7c3aed", opacity: noteText.trim() ? 1 : 0.4 }}
        >Add Note</button>
      </form>
    </div>
  );
}

export default function MyTracks({ onNavigate, onNavigateTo }) {
  const [tracks, setTracks] = useState(() => getTracks());
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    const h = () => setTracks(getTracks());
    window.addEventListener("gsl_tracks", h);
    return () => window.removeEventListener("gsl_tracks", h);
  }, []);

  useEffect(() => {
    if (!selectedId && tracks.length > 0) setSelectedId(tracks[0].id);
  }, [tracks, selectedId]);

  function refresh() { setTracks(getTracks()); }

  const selectedTrack = tracks.find(t => t.id === selectedId) || null;

  return (
    <div className="flex bg-zinc-950 text-zinc-100" style={{ height: "calc(100vh - 48px)", overflow: "hidden", fontFamily: "inherit" }}>
      <TrackList
        tracks={tracks}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onCreate={name => { const t = createTrack(name); refresh(); setSelectedId(t.id); }}
        onDelete={id => { deleteTrack(id); refresh(); if (selectedId === id) setSelectedId(null); }}
        onMoveItem={(fromTrackId, toTrackId, index) => { moveItem(fromTrackId, toTrackId, index); refresh(); }}
        onBuildTiers={() => {
          if (!window.confirm("Build the S / A / B tier tracks? This creates (or rebuilds) three tracks — S Tier, A Tier, B Tier — from every Foundation module, ranked by senior-AIE interview frequency.")) return;
          const res = seedTierTracks();
          setTracks(getTracks());
          const sTrack = getTracks().find(t => t.name === "S Tier");
          if (sTrack) setSelectedId(sTrack.id);
          const total = res.reduce((n, r) => n + r.count, 0);
          window.alert(`Done: S (${res.find(r=>r.name==='S Tier')?.count}), A (${res.find(r=>r.name==='A Tier')?.count}), B (${res.find(r=>r.name==='B Tier')?.count}) — ${total} modules across 3 tracks.`);
        }}
      />

      <div className={`${selectedTrack ? "flex" : "hidden sm:flex"} flex-1 overflow-hidden flex-col`} style={{ background: "rgba(9,9,11,0.4)" }}>
        {selectedTrack ? (
          <TrackDetail
            key={selectedTrack.id}
            track={selectedTrack}
            onNavigate={onNavigate}
            onNavigateTo={onNavigateTo}
            onBack={() => setSelectedId(null)}
            onRename={name => { renameTrack(selectedTrack.id, name); refresh(); }}
            onAddNote={content => { addNote(selectedTrack.id, content); refresh(); }}
            onUpdateNote={(idx, content) => { updateNote(selectedTrack.id, idx, content); refresh(); }}
            onRemoveItem={idx => { removeItem(selectedTrack.id, idx); refresh(); }}
            onReorderItems={(from, to) => { reorderItems(selectedTrack.id, from, to); refresh(); }}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-zinc-600 text-sm">
            {tracks.length === 0 ? "Create a track to get started." : "Select a track."}
          </div>
        )}
      </div>
    </div>
  );
}
