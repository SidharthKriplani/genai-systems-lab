// MyTasks — "My Tasks" feature (D24, 2026-07-23). A first-class to-do system,
// Microsoft-To-Do-shaped, deeply integrated with GSL content via moduleId
// deep-links and gym-based "Import as checklist." Separate feature from My
// Tracks — no shared data, no shared UI — left-nav item under the content
// frames (see App.jsx's NAV_AFTER_FRAMES).
//
// Data layer: utils/tasksStore.js (mirrors the annotations sync pattern —
// see that file's header comment for the merge-granularity + FLAGGED
// cross-device orphan-task edge case, both resolved there, not here).
//
// Design: house system per D24 spec — glass surfaces (rgba panel + 1px rim,
// no backdrop-blur needed at this size), 1px rims (uniform border, NOT a
// colored left rail — MyTracks.jsx's borderLeft accent is deliberately NOT
// reused here), mono tags for labels/chips, accents via tag color/glow only.
// Matches BreaklabsChrome/ProfileChip-era surfaces (rounded-xl, var(--surface)
// family, zinc-800 hover states) rather than MyTracks' rail-accented cards.
import { useState, useEffect, useRef, useMemo } from "react";
import {
  listLists, createList, renameList, deleteList,
  listTasks, listAllTasks, listOrphanTasks, addTask, updateTask,
  toggleDone, toggleStar, toggleMyDay, moveTaskToList, deleteTask,
  addStep, toggleStep, removeStep,
  importGymAsChecklist, getMyDayTarget, setMyDayTarget, isToday,
} from "./utils/tasksStore.js";
import { MODULE_SEARCH_INDEX } from "./data/moduleSearchIndex.js";
import { tierOf } from "./data/moduleTiers.js";
import { Icon } from "./Icon.jsx";

const MODULE_BY_ID = Object.fromEntries(MODULE_SEARCH_INDEX.map(m => [m.id, m]));

// Unique (gymId, gymLabel) pairs, first-seen order — same source MyTracks.jsx
// already trusts for "every foundation module" (see moduleSearchIndex.js's
// own header comment: GENERATED complete from GYMS.moduleIds).
const GYMS = (() => {
  const seen = new Map();
  for (const m of MODULE_SEARCH_INDEX) if (!seen.has(m.gymId)) seen.set(m.gymId, m.gymLabel);
  return [...seen.entries()].map(([gymId, gymLabel]) => ({ gymId, gymLabel }));
})();

function fmtDate(ts) {
  if (!ts) return "";
  const d = new Date(ts);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" }) + " " +
    d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

// ── Small shared bits ───────────────────────────────────────────────────
function ProgressBar({ done, total, width = 64, color = "#34d399" }) {
  if (!total) return null;
  const pct = Math.round((100 * done) / total);
  return (
    <span className="flex items-center gap-2 shrink-0">
      <span className="font-mono text-[10px] text-zinc-500">{done}/{total}</span>
      <span style={{ width, height: 4, borderRadius: 2, background: "rgba(63,63,70,0.6)", overflow: "hidden", display: "inline-block" }}>
        <span style={{ display: "block", height: "100%", width: `${pct}%`, background: color, transition: "width 0.2s" }} />
      </span>
    </span>
  );
}

function TaskCheckbox({ done, onToggle }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onToggle(); }}
      title={done ? "Mark not done" : "Mark done"}
      className="shrink-0"
      style={{
        width: 17, height: 17, borderRadius: 5, cursor: "pointer", padding: 0, marginTop: 1,
        border: done ? "1px solid #34d399" : "1px solid rgba(113,113,122,0.7)",
        background: done ? "rgba(52,211,153,0.22)" : "transparent",
        color: "#34d399", fontSize: 11, lineHeight: 1,
        display: "inline-flex", alignItems: "center", justifyContent: "center",
      }}
    >{done ? "✓" : ""}</button>
  );
}

// Mono uppercase tag — the ONLY accent mechanism this feature uses (per spec:
// no rails, no traffic-light dots). `glow` adds a soft text-shadow instead of
// a colored bar/dot.
function Tag({ children, color = "#a1a1aa", glow = false }) {
  return (
    <span
      className="text-[9.5px] font-mono font-bold uppercase tracking-wider shrink-0"
      style={{ color, textShadow: glow ? `0 0 8px ${color}88` : "none" }}
    >{children}</span>
  );
}

function ModuleChip({ moduleId, gymId, onNavigateTo }) {
  const m = MODULE_BY_ID[moduleId];
  if (!m) return null;
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onNavigateTo?.({ tab: "concepts", gymId: gymId || m.gymId, moduleId }); }}
      title={`Open ${m.title}`}
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-mono transition-all hover:opacity-90"
      style={{ background: "rgba(139,92,246,0.10)", border: "1px solid rgba(139,92,246,0.35)", color: "#c4b5fd" }}
    >
      <span className="truncate max-w-[160px]">{m.title}</span>
      <span aria-hidden>→</span>
    </button>
  );
}

// ── Task row (shared by list view, My Day, Unfiled) ─────────────────────
function TaskRow({ task, expanded, onExpand, listName, showListTag, onNavigateTo, onMoveToList, allLists }) {
  const [notesDraft, setNotesDraft] = useState(task.notes || "");
  const [stepDraft, setStepDraft] = useState("");
  useEffect(() => { setNotesDraft(task.notes || "") }, [task.id, task.notes]);

  const stepsDone = (task.steps || []).filter(s => s.done).length;

  return (
    <div
      className="rounded-xl p-3 transition-all cursor-pointer"
      style={{
        background: "rgba(24,24,27,0.9)",
        border: "1px solid rgba(63,63,70,0.6)",
      }}
      onClick={onExpand}
    >
      <div className="flex items-start gap-2.5">
        <TaskCheckbox done={task.done} onToggle={() => toggleDone(task.id)} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="text-sm"
              style={{ color: task.done ? "#71717a" : "#e4e4e7", textDecoration: task.done ? "line-through" : "none" }}
            >{task.title || "(untitled)"}</span>
            {showListTag && listName && <Tag color="#71717a">{listName}</Tag>}
            {task.steps?.length > 0 && (
              <span className="text-[10px] font-mono text-zinc-600">{stepsDone}/{task.steps.length} steps</span>
            )}
          </div>
          {!expanded && task.moduleId && (
            <div className="mt-1.5" onClick={(e) => e.stopPropagation()}>
              <ModuleChip moduleId={task.moduleId} gymId={task.gymId} onNavigateTo={onNavigateTo} />
            </div>
          )}
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); toggleStar(task.id); }}
          title={task.star ? "Unstar" : "Star"}
          className="shrink-0 transition-opacity"
          style={{ background: "none", border: "none", cursor: "pointer", opacity: task.star ? 1 : 0.35 }}
        >
          <Icon name="star" size={13} color={task.star ? "#fbbf24" : "#71717a"} />
        </button>
        <span className="shrink-0 text-zinc-600" style={{ transform: expanded ? "rotate(90deg)" : "none", transition: "transform 0.15s" }}>
          <Icon name="chevron-right" size={12} />
        </span>
      </div>

      {expanded && (
        <div className="mt-3 pl-[27px] space-y-3" onClick={(e) => e.stopPropagation()}>
          {task.moduleId && <ModuleChip moduleId={task.moduleId} gymId={task.gymId} onNavigateTo={onNavigateTo} />}

          {/* Steps */}
          <div className="space-y-1">
            {(task.steps || []).map(s => (
              <div key={s.id} className="flex items-center gap-2 group">
                <TaskCheckbox done={s.done} onToggle={() => toggleStep(task.id, s.id)} />
                <span className="text-xs flex-1" style={{ color: s.done ? "#71717a" : "#d4d4d8", textDecoration: s.done ? "line-through" : "none" }}>{s.text}</span>
                <button onClick={() => removeStep(task.id, s.id)} title="Remove step"
                  className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#71717a" }}>
                  <Icon name="x" size={11} />
                </button>
              </div>
            ))}
            <form onSubmit={(e) => { e.preventDefault(); if (stepDraft.trim()) { addStep(task.id, stepDraft); setStepDraft(""); } }}
              className="flex items-center gap-2">
              <span className="w-[17px] shrink-0 text-center text-zinc-700 text-xs">+</span>
              <input
                value={stepDraft} onChange={e => setStepDraft(e.target.value)}
                placeholder="Add a step…"
                className="flex-1 text-xs px-2 py-1 rounded-lg outline-none bg-transparent"
                style={{ color: "#d4d4d8", border: "1px solid rgba(63,63,70,0.5)" }}
              />
            </form>
          </div>

          {/* Notes */}
          <textarea
            value={notesDraft}
            onChange={e => setNotesDraft(e.target.value)}
            onBlur={() => { if (notesDraft !== (task.notes || "")) updateTask(task.id, { notes: notesDraft }); }}
            placeholder="Notes…"
            rows={2}
            className="w-full text-xs px-2.5 py-2 rounded-lg outline-none resize-none bg-transparent"
            style={{ color: "#d4d4d8", border: "1px solid rgba(63,63,70,0.5)" }}
          />

          {/* Footer actions */}
          <div className="flex items-center gap-3 flex-wrap">
            <button onClick={() => toggleMyDay(task.id)}
              className="text-[10px] font-mono uppercase tracking-wider px-2 py-1 rounded-lg transition-all"
              style={task.myDay
                ? { background: "rgba(251,191,36,0.12)", border: "1px solid rgba(251,191,36,0.4)", color: "#fbbf24" }
                : { background: "none", border: "1px solid rgba(63,63,70,0.6)", color: "#71717a" }}>
              {task.myDay ? "In My Day" : "Add to My Day"}
            </button>
            {onMoveToList && allLists?.length > 0 && (
              <select
                onChange={e => { if (e.target.value) onMoveToList(task.id, e.target.value); }}
                defaultValue=""
                className="text-[10px] font-mono px-2 py-1 rounded-lg bg-transparent outline-none"
                style={{ border: "1px solid rgba(63,63,70,0.6)", color: "#a1a1aa" }}
              >
                <option value="" disabled>Move to list…</option>
                {allLists.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            )}
            {task.done && task.doneTs && (
              <span className="text-[10px] font-mono text-zinc-600">completed {fmtDate(task.doneTs)}</span>
            )}
            <button onClick={() => deleteTask(task.id)}
              className="ml-auto text-[10px] font-mono uppercase tracking-wider transition-colors"
              style={{ background: "none", border: "none", cursor: "pointer", color: "#71717a" }}
              onMouseEnter={e => e.currentTarget.style.color = "#f87171"}
              onMouseLeave={e => e.currentTarget.style.color = "#71717a"}
            >Delete task</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Quick-add ────────────────────────────────────────────────────────────
function QuickAdd({ onAdd }) {
  const [val, setVal] = useState("");
  const ref = useRef(null);
  return (
    <form
      onSubmit={(e) => { e.preventDefault(); if (val.trim()) { onAdd(val); setVal(""); ref.current?.focus(); } }}
      className="flex items-center gap-2 mb-3"
    >
      <span className="text-zinc-600 text-sm shrink-0 pl-1">+</span>
      <input
        ref={ref}
        value={val}
        onChange={e => setVal(e.target.value)}
        placeholder="Add a task — press Enter"
        className="flex-1 text-sm px-3 py-2 rounded-lg outline-none bg-transparent"
        style={{ color: "#f4f4f5", border: "1px solid rgba(63,63,70,0.6)" }}
      />
    </form>
  );
}

// ── New-list flow (blank or import-as-checklist) ────────────────────────
function NewListPanel({ onClose, onCreated }) {
  const [mode, setMode] = useState("blank"); // 'blank' | 'import'
  const [name, setName] = useState("");
  const [gymId, setGymId] = useState(GYMS[0]?.gymId || "");
  const [tierFilter, setTierFilter] = useState("all"); // 'all' | 'S' | 'S+A'

  function submit(e) {
    e.preventDefault();
    if (mode === "blank") {
      const list = createList(name);
      onCreated(list.id);
    } else {
      const gym = GYMS.find(g => g.gymId === gymId);
      const { list } = importGymAsChecklist(gymId, MODULE_SEARCH_INDEX, name || gym?.gymLabel, tierOf, tierFilter);
      onCreated(list.id);
    }
    onClose();
  }

  return (
    <div className="rounded-xl p-3 mb-2" style={{ background: "rgba(24,24,27,0.95)", border: "1px solid rgba(63,63,70,0.6)" }}>
      <div className="flex items-center gap-1.5 mb-2.5">
        <button onClick={() => setMode("blank")}
          className="text-[10px] font-mono uppercase tracking-wider px-2 py-1 rounded-lg transition-all"
          style={mode === "blank"
            ? { background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.4)", color: "#c4b5fd" }
            : { background: "none", border: "1px solid rgba(63,63,70,0.6)", color: "#71717a" }}>
          Blank list
        </button>
        <button onClick={() => setMode("import")}
          className="text-[10px] font-mono uppercase tracking-wider px-2 py-1 rounded-lg transition-all"
          style={mode === "import"
            ? { background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.4)", color: "#c4b5fd" }
            : { background: "none", border: "1px solid rgba(63,63,70,0.6)", color: "#71717a" }}>
          Import as checklist
        </button>
      </div>
      <form onSubmit={submit} className="space-y-2">
        <input
          value={name} onChange={e => setName(e.target.value)} autoFocus
          placeholder={mode === "blank" ? "List name" : "List name (defaults to gym name)"}
          className="w-full text-sm px-2.5 py-1.5 rounded-lg outline-none bg-transparent"
          style={{ color: "#f4f4f5", border: "1px solid rgba(63,63,70,0.6)" }}
        />
        {mode === "import" && (
          <div className="flex items-center gap-2">
            <select value={gymId} onChange={e => setGymId(e.target.value)}
              className="flex-1 text-xs px-2 py-1.5 rounded-lg bg-transparent outline-none"
              style={{ border: "1px solid rgba(63,63,70,0.6)", color: "#d4d4d8" }}>
              {GYMS.map(g => <option key={g.gymId} value={g.gymId}>{g.gymLabel}</option>)}
            </select>
            <select value={tierFilter} onChange={e => setTierFilter(e.target.value)}
              className="text-xs px-2 py-1.5 rounded-lg bg-transparent outline-none shrink-0"
              style={{ border: "1px solid rgba(63,63,70,0.6)", color: "#d4d4d8" }}>
              <option value="all">All modules</option>
              <option value="S">S tier only</option>
              <option value="S+A">S + A tier</option>
            </select>
          </div>
        )}
        <div className="flex items-center gap-2 justify-end">
          <button type="button" onClick={onClose}
            className="text-xs px-2.5 py-1.5 rounded-lg transition-all"
            style={{ background: "none", border: "1px solid rgba(63,63,70,0.6)", color: "#a1a1aa", cursor: "pointer" }}>
            Cancel
          </button>
          <button type="submit"
            className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-opacity hover:opacity-90"
            style={{ background: "#7c3aed", color: "white", cursor: "pointer" }}>
            Create
          </button>
        </div>
      </form>
    </div>
  );
}

// ── List rail ─────────────────────────────────────────────────────────────
function ListRail({ lists, allTasks, orphanCount, selected, onSelect, onRename, onDelete, myDayCount, myDayTotal, onCreated }) {
  const [showNew, setShowNew] = useState(false);
  const [renamingId, setRenamingId] = useState(null);
  const [draft, setDraft] = useState("");

  return (
    <div className="w-64 shrink-0 border-r flex flex-col" style={{ borderColor: "rgba(63,63,70,0.5)", background: "rgba(9,9,11,0.4)" }}>
      <div className="px-3 pt-4 pb-2">
        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">My Tasks</span>
      </div>

      <div className="flex-1 overflow-y-auto px-2 space-y-0.5">
        {/* My Day — pinned */}
        <button onClick={() => onSelect("myday")}
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all"
          style={selected === "myday"
            ? { background: "var(--surface-2)", boxShadow: "inset 0 0 0 1px rgba(251,191,36,0.4)", color: "#fbbf24", fontWeight: 600 }
            : { color: "#d4d4d8", background: "none" }}>
          <span>☀ My Day</span>
          {myDayTotal > 0 && <span className="font-mono text-[10px] opacity-70">{myDayCount}/{myDayTotal}</span>}
        </button>

        {orphanCount > 0 && (
          <button onClick={() => onSelect("unfiled")}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all"
            style={selected === "unfiled"
              ? { background: "var(--surface-2)", boxShadow: "inset 0 0 0 1px rgba(248,113,113,0.4)", color: "#f87171", fontWeight: 600 }
              : { color: "#a1a1aa", background: "none" }}>
            <span>Unfiled</span>
            <span className="font-mono text-[10px] opacity-70">{orphanCount}</span>
          </button>
        )}

        <div className="h-px my-1.5 mx-1" style={{ background: "rgba(63,63,70,0.5)" }} />

        {lists.map(list => {
          const tasks = allTasks.filter(t => t.listId === list.id);
          const done = tasks.filter(t => t.done).length;
          const active = selected === list.id;
          return (
            <div key={list.id} className="group relative">
              {renamingId === list.id ? (
                <form onSubmit={e => { e.preventDefault(); onRename(list.id, draft); setRenamingId(null); }}
                  className="px-2 py-1">
                  <input value={draft} onChange={e => setDraft(e.target.value)} autoFocus
                    onBlur={() => { onRename(list.id, draft); setRenamingId(null); }}
                    onKeyDown={e => { if (e.key === "Escape") setRenamingId(null); }}
                    className="w-full text-sm px-2 py-1 rounded-lg outline-none bg-transparent"
                    style={{ color: "#f4f4f5", border: "1px solid #7c3aed" }} />
                </form>
              ) : (
                <button onClick={() => onSelect(list.id)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all"
                  style={active
                    ? { background: "var(--surface-2)", boxShadow: "inset 0 0 0 1px rgba(139,92,246,0.45)", color: "#f3f4f6", fontWeight: 600 }
                    : { color: "#d4d4d8", background: "none" }}>
                  <span className="truncate">{list.name}</span>
                  <span className="flex items-center gap-1.5 shrink-0">
                    {tasks.length > 0 && <span className="font-mono text-[10px] opacity-60">{done}/{tasks.length}</span>}
                    <span className="hidden group-hover:inline-flex items-center gap-1">
                      <span onClick={e => { e.stopPropagation(); setDraft(list.name); setRenamingId(list.id); }}
                        title="Rename" style={{ cursor: "pointer", color: "#71717a" }}>✎</span>
                      <span onClick={e => { e.stopPropagation(); if (window.confirm(`Delete "${list.name}" and all its tasks?`)) onDelete(list.id); }}
                        title="Delete" style={{ cursor: "pointer", color: "#71717a" }}>
                        <Icon name="trash" size={11} />
                      </span>
                    </span>
                  </span>
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div className="p-2 pt-1" style={{ borderTop: "1px solid rgba(63,63,70,0.5)" }}>
        {showNew && (
          <NewListPanel onClose={() => setShowNew(false)} onCreated={(id) => { onCreated(id); }} />
        )}
        <button onClick={() => setShowNew(s => !s)}
          className="w-full text-xs font-semibold px-3 py-1.5 rounded-lg transition-all hover:opacity-90"
          style={{ background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.35)", color: "#c4b5fd" }}>
          + New list
        </button>
      </div>
    </div>
  );
}

// ── Detail pane: a single list ──────────────────────────────────────────
function ListDetail({ list, tasks, expandedId, setExpandedId, onRename, onNavigateTo }) {
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(list.name);
  const [showCompleted, setShowCompleted] = useState(false);
  useEffect(() => { setNameDraft(list.name) }, [list.id, list.name]);

  const todo = tasks.filter(t => !t.done);
  const done = tasks.filter(t => t.done);

  return (
    <div className="flex-1 overflow-y-auto px-6 py-5">
      <div className="flex items-center gap-2 mb-4">
        {editingName ? (
          <form onSubmit={e => { e.preventDefault(); onRename(list.id, nameDraft); setEditingName(false); }}>
            <input value={nameDraft} onChange={e => setNameDraft(e.target.value)} autoFocus
              onBlur={() => { onRename(list.id, nameDraft); setEditingName(false); }}
              className="text-xl font-bold rounded-lg px-2 py-0.5 outline-none"
              style={{ color: "#f4f4f5", background: "rgba(39,39,42,0.8)", border: "1px solid #7c3aed" }} />
          </form>
        ) : (
          <>
            <h2 className="text-xl font-bold text-white m-0">{list.name}</h2>
            <button onClick={() => setEditingName(true)} title="Rename"
              className="text-zinc-600 hover:text-zinc-400 text-sm transition-colors"
              style={{ background: "none", border: "none", cursor: "pointer" }}>✎</button>
          </>
        )}
        <span className="ml-auto"><ProgressBar done={done.length} total={tasks.length} /></span>
      </div>

      <QuickAdd onAdd={(title) => addTask(list.id, title)} />

      <div className="space-y-2">
        {todo.map(t => (
          <TaskRow key={t.id} task={t} expanded={expandedId === t.id}
            onExpand={() => setExpandedId(id => id === t.id ? null : t.id)}
            onNavigateTo={onNavigateTo} />
        ))}
        {todo.length === 0 && done.length === 0 && (
          <div className="text-sm text-zinc-600 py-6 text-center">No tasks yet — add one above.</div>
        )}
      </div>

      {done.length > 0 && (
        <div className="mt-4">
          <button onClick={() => setShowCompleted(s => !s)}
            className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-zinc-500 hover:text-zinc-300 transition-colors mb-2"
            style={{ background: "none", border: "none", cursor: "pointer" }}>
            <span style={{ transform: showCompleted ? "rotate(90deg)" : "none", transition: "transform 0.15s", display: "inline-flex" }}>
              <Icon name="chevron-right" size={10} />
            </span>
            Completed ({done.length})
          </button>
          {showCompleted && (
            <div className="space-y-2">
              {done.map(t => (
                <TaskRow key={t.id} task={t} expanded={expandedId === t.id}
                  onExpand={() => setExpandedId(id => id === t.id ? null : t.id)}
                  onNavigateTo={onNavigateTo} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Detail pane: My Day (aggregated) ─────────────────────────────────────
function MyDayDetail({ tasks, listById, expandedId, setExpandedId, onNavigateTo, target, onTargetChange }) {
  const doneToday = tasks.filter(t => t.done && isToday(t.doneTs)).length;
  const todo = tasks.filter(t => !t.done);
  const done = tasks.filter(t => t.done);
  const [showCompleted, setShowCompleted] = useState(false);

  return (
    <div className="flex-1 overflow-y-auto px-6 py-5">
      <div className="flex items-center gap-3 mb-1">
        <h2 className="text-xl font-bold text-white m-0">☀ My Day</h2>
        <span className="text-xs text-zinc-500">{new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}</span>
      </div>
      <div className="flex items-center gap-2 mb-5 text-xs text-zinc-500">
        <span className="font-mono">{doneToday} / </span>
        <input type="number" min={1} value={target}
          onChange={e => onTargetChange(Number(e.target.value) || 1)}
          className="w-12 text-center font-mono text-xs px-1 py-0.5 rounded outline-none bg-transparent"
          style={{ border: "1px solid rgba(63,63,70,0.6)", color: "#d4d4d8" }} />
        <span>completed today</span>
        <span style={{ width: 80, height: 4, borderRadius: 2, background: "rgba(63,63,70,0.6)", overflow: "hidden", display: "inline-block" }}>
          <span style={{ display: "block", height: "100%", width: `${Math.min(100, Math.round(100 * doneToday / target))}%`, background: "#fbbf24", transition: "width 0.2s" }} />
        </span>
      </div>

      {tasks.length === 0 && (
        <div className="text-sm text-zinc-600 py-6 text-center">
          Nothing flagged for today yet — open a task in any list and tap "Add to My Day."
        </div>
      )}

      <div className="space-y-2">
        {todo.map(t => (
          <TaskRow key={t.id} task={t} expanded={expandedId === t.id}
            onExpand={() => setExpandedId(id => id === t.id ? null : t.id)}
            listName={listById[t.listId]?.name} showListTag
            onNavigateTo={onNavigateTo} />
        ))}
      </div>

      {done.length > 0 && (
        <div className="mt-4">
          <button onClick={() => setShowCompleted(s => !s)}
            className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-zinc-500 hover:text-zinc-300 transition-colors mb-2"
            style={{ background: "none", border: "none", cursor: "pointer" }}>
            <span style={{ transform: showCompleted ? "rotate(90deg)" : "none", transition: "transform 0.15s", display: "inline-flex" }}>
              <Icon name="chevron-right" size={10} />
            </span>
            Completed ({done.length})
          </button>
          {showCompleted && (
            <div className="space-y-2">
              {done.map(t => (
                <TaskRow key={t.id} task={t} expanded={expandedId === t.id}
                  onExpand={() => setExpandedId(id => id === t.id ? null : t.id)}
                  listName={listById[t.listId]?.name} showListTag
                  onNavigateTo={onNavigateTo} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Detail pane: Unfiled (orphan recovery — see tasksStore.js header) ────
function UnfiledDetail({ tasks, allLists, expandedId, setExpandedId, onNavigateTo }) {
  return (
    <div className="flex-1 overflow-y-auto px-6 py-5">
      <h2 className="text-xl font-bold text-white m-0 mb-1.5">Unfiled</h2>
      <p className="text-xs text-zinc-500 mb-4 max-w-md">
        These tasks' list was deleted on another device before this one could sync the task itself.
        Nothing was lost — move each one to a list, or delete it.
      </p>
      <div className="space-y-2">
        {tasks.map(t => (
          <TaskRow key={t.id} task={t} expanded={expandedId === t.id}
            onExpand={() => setExpandedId(id => id === t.id ? null : t.id)}
            onNavigateTo={onNavigateTo}
            onMoveToList={moveTaskToList} allLists={allLists} />
        ))}
      </div>
    </div>
  );
}

// ── Top-level ─────────────────────────────────────────────────────────────
export default function MyTasks({ onNavigate, onNavigateTo }) {
  const [tick, setTick] = useState(0);
  const [selected, setSelected] = useState("myday");
  const [expandedId, setExpandedId] = useState(null);
  const [target, setTargetState] = useState(() => getMyDayTarget());

  useEffect(() => {
    const refresh = () => setTick(t => t + 1);
    // Same-tab writes (feature-specific event) + cross-device pull-merges
    // landing (the generic annotations-merged event every store's writes
    // eventually trigger a pull for) — same two listeners StickyNotes.jsx's
    // v1.9 comment describes for its own instant-repaint requirement.
    window.addEventListener("gsl_tasks", refresh);
    window.addEventListener("annotations-merged", refresh);
    return () => {
      window.removeEventListener("gsl_tasks", refresh);
      window.removeEventListener("annotations-merged", refresh);
    };
  }, []);

  const lists = useMemo(() => listLists(), [tick]);
  const allTasks = useMemo(() => listAllTasks(), [tick]);
  const orphanTasks = useMemo(() => listOrphanTasks(), [tick]);
  const listById = useMemo(() => Object.fromEntries(lists.map(l => [l.id, l])), [lists]);
  const myDayTasks = useMemo(() => allTasks.filter(t => t.myDay), [allTasks]);
  const myDayDone = myDayTasks.filter(t => t.done).length;

  function handleTargetChange(n) { setMyDayTarget(n); setTargetState(n); }

  // If the selected list was deleted (elsewhere or here), fall back to My Day
  // rather than showing a blank pane.
  useEffect(() => {
    if (selected === "myday" || selected === "unfiled") return;
    if (!lists.some(l => l.id === selected)) setSelected("myday");
  }, [lists, selected]);

  const selectedList = selected !== "myday" && selected !== "unfiled" ? listById[selected] : null;

  return (
    <div className="flex bg-zinc-950 text-zinc-100" style={{ height: "calc(100vh - 48px)", overflow: "hidden", fontFamily: "inherit" }}>
      <ListRail
        lists={lists}
        allTasks={allTasks}
        orphanCount={orphanTasks.length}
        selected={selected}
        onSelect={(id) => { setExpandedId(null); setSelected(id); }}
        onRename={renameList}
        onDelete={(id) => { deleteList(id); if (selected === id) setSelected("myday"); }}
        myDayCount={myDayDone}
        myDayTotal={myDayTasks.length}
        onCreated={(id) => { setExpandedId(null); setSelected(id); }}
      />
      {selected === "myday" ? (
        <MyDayDetail tasks={myDayTasks} listById={listById} expandedId={expandedId} setExpandedId={setExpandedId}
          onNavigateTo={onNavigateTo} target={target} onTargetChange={handleTargetChange} />
      ) : selected === "unfiled" ? (
        <UnfiledDetail tasks={orphanTasks} allLists={lists} expandedId={expandedId} setExpandedId={setExpandedId}
          onNavigateTo={onNavigateTo} />
      ) : selectedList ? (
        <ListDetail list={selectedList} tasks={listTasks(selectedList.id)} expandedId={expandedId} setExpandedId={setExpandedId}
          onRename={renameList} onNavigateTo={onNavigateTo} />
      ) : (
        <div className="flex-1 flex items-center justify-center text-zinc-600 text-sm">Select a list.</div>
      )}
    </div>
  );
}
