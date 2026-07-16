// src/components/NoteEditor.jsx — block-based notes studio for My Tracks.
//
// A Notion-grade editor, zero dependencies:
//   · Block types: text, h1–h3, bullet/numbered lists, to-dos, quote, callout,
//     code (with language + copy), toggle (collapsible), divider, video embed,
//     link card.
//   · Slash menu ("/" in an empty block), markdown shortcuts ("# ", "- ",
//     "[] ", "> ", "```", "---", "1. "), inline marks (**bold**, *italic*,
//     ~~strike~~, `code`, ==highlight==, [label](url), bare URLs).
//   · Keyboard: Enter splits, Shift+Enter soft-break, Backspace merges,
//     ↑/↓ walk blocks, ⌘/Ctrl+B/I/E marks, ⌘/Ctrl+S force-save.
//   · Drag-handle reorder + per-block menu (turn into / duplicate / move / delete).
//   · Outline rail from headings, word count, reading time, todo progress,
//     debounced autosave, copy-as-Markdown, .md export.
//   · Paste: URL → embed/link card, multi-line markdown → parsed into blocks.
//
// Storage stays the same note shape ({ title, blocks }) — old text/video/link
// blocks load untouched; new types are additive.

import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { updateNoteById } from '../utils/tracks.js'

// ── Theme (lab design tokens) ─────────────────────────────────────────────────

const T = {
  text:        '#f4f4f5',
  mid:         '#d4d4d8',
  low:         '#a1a1aa',
  ghost:       '#71717a',
  border:      'rgba(63,63,70,0.6)',
  surface:     'rgba(24,24,27,0.9)',
  bg:          '#18181b',
  accent:      '#8b5cf6',
  accentFaint: 'rgba(139,92,246,0.15)',
  accentText:  '#a78bfa',
  danger:      '#f87171',
  sans:        'inherit',
  mono:        'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
  codeBg:      'rgba(0,0,0,0.35)',
  highlightBg: 'rgba(139,92,246,0.35)',
}

// ── Small utils ───────────────────────────────────────────────────────────────

function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
}

function isUrl(str) {
  try { const u = new URL(str); return u.protocol === 'http:' || u.protocol === 'https:' } catch { return false }
}

function domainOf(url) {
  try { return new URL(url).hostname.replace(/^www\./, '') } catch { return url }
}

function detectVideo(url) {
  try {
    const u = new URL(url)
    if (/youtube\.com|youtu\.be/.test(u.hostname)) {
      const id = u.hostname === 'youtu.be'
        ? u.pathname.slice(1)
        : u.searchParams.get('v') || u.pathname.split('/').pop()
      if (id) return { platform: 'youtube', videoId: id }
    }
    if (u.hostname.includes('vimeo.com')) {
      const id = u.pathname.split('/').filter(Boolean).pop()
      if (id) return { platform: 'vimeo', videoId: id }
    }
    if (u.hostname.includes('loom.com') && u.pathname.includes('/share/')) {
      const id = u.pathname.split('/').filter(Boolean).pop()
      if (id) return { platform: 'loom', videoId: id }
    }
  } catch {}
  return null
}

function videoThumb(platform, videoId) {
  if (platform === 'youtube') return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
  return null
}

function videoEmbedUrl(platform, videoId) {
  if (platform === 'youtube') return `https://www.youtube.com/embed/${videoId}?autoplay=1`
  if (platform === 'vimeo') return `https://player.vimeo.com/video/${videoId}?autoplay=1`
  if (platform === 'loom') return `https://www.loom.com/embed/${videoId}?autoplay=1`
  return null
}

function fallbackTitle(url) {
  try {
    const u = new URL(url)
    const host = u.hostname.replace(/^www\./, '')
    const seg = u.pathname.replace(/\/+$/, '').split('/').filter(Boolean).pop() || ''
    const clean = decodeURIComponent(seg).replace(/\.[a-z0-9]{1,5}$/i, '').replace(/[-_+]+/g, ' ').trim()
    return clean ? `${clean} · ${host}` : host
  } catch { return url }
}

async function fetchMeta(url) {
  const fallback = fallbackTitle(url)
  try {
    const proxy = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`
    const res = await fetch(proxy, { signal: AbortSignal.timeout(6000) })
    if (!res.ok) return { title: fallback, summary: '' }
    const json = await res.json()
    const html = json.contents || ''
    const titleMatch = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i)
      || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i)
      || html.match(/<title[^>]*>([^<]+)<\/title>/i)
    const descMatch = html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i)
      || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:description["']/i)
      || html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)
    return {
      title: titleMatch ? titleMatch[1].trim().slice(0, 120) : fallback,
      summary: descMatch ? descMatch[1].trim().slice(0, 300) : '',
    }
  } catch {
    return { title: fallback, summary: '' }
  }
}

// ── Inline markdown renderer ──────────────────────────────────────────────────
// **bold** · *italic* · ~~strike~~ · `code` · ==highlight== · [label](url) · bare URLs

const INLINE_RE = /(\*\*[^*]+\*\*|~~[^~]+~~|==[^=]+==|`[^`]+`|\[[^\]]+\]\([^)]+\)|https?:\/\/[^\s<>")\]]+|\*[^*\n]+\*)/g

export function Rich({ text }) {
  if (!text) return null
  const parts = String(text).split(INLINE_RE)
  return (
    <>
      {parts.map((p, i) => {
        if (!p) return null
        if (p.startsWith('**') && p.endsWith('**') && p.length > 4)
          return <strong key={i} style={{ fontWeight: 700 }}>{p.slice(2, -2)}</strong>
        if (p.startsWith('~~') && p.endsWith('~~') && p.length > 4)
          return <s key={i}>{p.slice(2, -2)}</s>
        if (p.startsWith('==') && p.endsWith('==') && p.length > 4)
          return <mark key={i} style={{ background: T.highlightBg, color: 'inherit', borderRadius: 3, padding: '0 2px' }}>{p.slice(2, -2)}</mark>
        if (p.startsWith('`') && p.endsWith('`') && p.length > 2)
          return <code key={i} style={{ fontFamily: T.mono, fontSize: '0.85em', background: T.codeBg, border: `1px solid ${T.border}`, borderRadius: 4, padding: '0.05em 0.35em', color: T.accentText }}>{p.slice(1, -1)}</code>
        const md = p.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
        if (md)
          return <a key={i} href={md[2]} target="_blank" rel="noreferrer" style={{ color: T.accentText, textDecoration: 'underline', textUnderlineOffset: 2 }} onClick={e => e.stopPropagation()}>{md[1]}</a>
        if (/^https?:\/\//.test(p))
          return <a key={i} href={p} target="_blank" rel="noreferrer" style={{ color: T.accentText, textDecoration: 'underline', textUnderlineOffset: 2, wordBreak: 'break-all' }} onClick={e => e.stopPropagation()}>{p}</a>
        if (p.startsWith('*') && p.endsWith('*') && p.length > 2)
          return <em key={i}>{p.slice(1, -1)}</em>
        return <span key={i}>{p}</span>
      })}
    </>
  )
}

// ── Markdown (de)serialization ────────────────────────────────────────────────

export function blocksToMarkdown(title, blocks) {
  const out = []
  if (title) out.push(`# ${title}`, '')
  let num = 0
  for (const b of blocks || []) {
    if (b.type !== 'numbered') num = 0
    switch (b.type) {
      case 'h1': out.push(`# ${b.content}`, ''); break
      case 'h2': out.push(`## ${b.content}`, ''); break
      case 'h3': out.push(`### ${b.content}`, ''); break
      case 'bullet': out.push(`- ${b.content}`); break
      case 'numbered': num += 1; out.push(`${num}. ${b.content}`); break
      case 'todo': out.push(`- [${b.checked ? 'x' : ' '}] ${b.content}`); break
      case 'quote': out.push(`> ${(b.content || '').split('\n').join('\n> ')}`, ''); break
      case 'callout': out.push(`> 💡 ${(b.content || '').split('\n').join('\n> ')}`, ''); break
      case 'code': out.push('```' + (b.lang || ''), b.content || '', '```', ''); break
      case 'toggle': out.push(`<details><summary>${b.content || ''}</summary>`, '', b.body || '', '</details>', ''); break
      case 'divider': out.push('---', ''); break
      case 'video': out.push(`[▶ ${b.title || b.platform || 'video'}](${b.url})`, ''); break
      case 'link': out.push(`[${b.title || b.domain || b.url}](${b.url})${b.summary ? ` — ${b.summary}` : ''}`, ''); break
      default: if ((b.content || '').trim()) out.push(b.content, '')
    }
  }
  return out.join('\n').replace(/\n{3,}/g, '\n\n').trim() + '\n'
}

// Parse pasted multi-line text into blocks (markdown-aware).
export function markdownToBlocks(text) {
  const lines = String(text).replace(/\r\n/g, '\n').split('\n')
  const blocks = []
  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    const fence = line.match(/^```(\w*)\s*$/)
    if (fence) {
      const body = []
      i += 1
      while (i < lines.length && !/^```\s*$/.test(lines[i])) { body.push(lines[i]); i += 1 }
      i += 1
      blocks.push({ id: uid(), type: 'code', lang: fence[1] || '', content: body.join('\n') })
      continue
    }
    let m
    if ((m = line.match(/^###\s+(.*)$/))) blocks.push({ id: uid(), type: 'h3', content: m[1] })
    else if ((m = line.match(/^##\s+(.*)$/))) blocks.push({ id: uid(), type: 'h2', content: m[1] })
    else if ((m = line.match(/^#\s+(.*)$/))) blocks.push({ id: uid(), type: 'h1', content: m[1] })
    else if ((m = line.match(/^\s*-\s+\[( |x|X)\]\s+(.*)$/))) blocks.push({ id: uid(), type: 'todo', checked: m[1] !== ' ', content: m[2] })
    else if ((m = line.match(/^\s*[-*•]\s+(.*)$/))) blocks.push({ id: uid(), type: 'bullet', content: m[1] })
    else if ((m = line.match(/^\s*\d+[.)]\s+(.*)$/))) blocks.push({ id: uid(), type: 'numbered', content: m[1] })
    else if ((m = line.match(/^>\s?💡\s?(.*)$/))) blocks.push({ id: uid(), type: 'callout', content: m[1] })
    else if ((m = line.match(/^>\s?(.*)$/))) blocks.push({ id: uid(), type: 'quote', content: m[1] })
    else if (/^\s*(---|\*\*\*|___)\s*$/.test(line)) blocks.push({ id: uid(), type: 'divider', content: '' })
    else if (line.trim() === '') { /* paragraph gap — skip */ }
    else blocks.push({ id: uid(), type: 'text', content: line })
    i += 1
  }
  return blocks.length ? blocks : [{ id: uid(), type: 'text', content: String(text) }]
}

// ── Block-type registry (slash menu + turn-into) ─────────────────────────────

const BLOCK_DEFS = [
  { type: 'text',     label: 'Text',          icon: '¶',   desc: 'Plain paragraph',                kw: 'text paragraph plain body' },
  { type: 'h1',       label: 'Heading 1',     icon: 'H1',  desc: 'Big section heading',            kw: 'heading one big title h1' },
  { type: 'h2',       label: 'Heading 2',     icon: 'H2',  desc: 'Medium section heading',         kw: 'heading two medium h2' },
  { type: 'h3',       label: 'Heading 3',     icon: 'H3',  desc: 'Small section heading',          kw: 'heading three small h3' },
  { type: 'bullet',   label: 'Bulleted list', icon: '•',   desc: 'Simple bullet point',            kw: 'bullet list unordered ul point' },
  { type: 'numbered', label: 'Numbered list', icon: '1.',  desc: 'Ordered list item',              kw: 'numbered ordered list ol' },
  { type: 'todo',     label: 'To-do',         icon: '☑',   desc: 'Checkbox you can tick off',      kw: 'todo task checkbox check tick' },
  { type: 'quote',    label: 'Quote',         icon: '❝',   desc: 'Pull-quote block',               kw: 'quote blockquote citation' },
  { type: 'callout',  label: 'Callout',       icon: '💡',  desc: 'Highlighted info box',           kw: 'callout info tip warning note box' },
  { type: 'code',     label: 'Code',          icon: '</>', desc: 'Monospace block with language',  kw: 'code snippet sql python js monospace' },
  { type: 'toggle',   label: 'Toggle',        icon: '▸',   desc: 'Collapsible section',            kw: 'toggle collapse accordion details hide' },
  { type: 'divider',  label: 'Divider',       icon: '—',   desc: 'Horizontal rule',                kw: 'divider rule hr separator line' },
  { type: 'video',    label: 'Video embed',   icon: '▶',   desc: 'YouTube / Vimeo / Loom URL',     kw: 'video youtube vimeo loom embed watch' },
  { type: 'link',     label: 'Link card',     icon: '🔗',  desc: 'Bookmark any URL',               kw: 'link bookmark url web page' },
]

const TEXTISH = new Set(['text', 'h1', 'h2', 'h3', 'bullet', 'numbered', 'todo', 'quote', 'callout'])

// Markdown shortcuts applied while typing at the start of a text block.
const MD_SHORTCUTS = [
  { re: /^###\s$/, type: 'h3' },
  { re: /^##\s$/,  type: 'h2' },
  { re: /^#\s$/,   type: 'h1' },
  { re: /^[-*]\s$/, type: 'bullet' },
  { re: /^1[.)]\s$/, type: 'numbered' },
  { re: /^\[\s?\]\s$/, type: 'todo' },
  { re: /^>\s$/,   type: 'quote' },
  { re: /^```$/,   type: 'code' },
  { re: /^---$/,   type: 'divider' },
]

// Wrap (or unwrap) the current selection of a textarea with a mark delimiter.
function wrapSelection(el, value, wrap, onChange) {
  const start = el.selectionStart ?? value.length
  const end = el.selectionEnd ?? value.length
  const sel = value.slice(start, end)
  const already = sel.startsWith(wrap) && sel.endsWith(wrap) && sel.length >= wrap.length * 2
  let next, ns, ne
  if (already) {
    const inner = sel.slice(wrap.length, sel.length - wrap.length)
    next = value.slice(0, start) + inner + value.slice(end)
    ns = start; ne = start + inner.length
  } else {
    const inner = sel || 'text'
    next = value.slice(0, start) + wrap + inner + wrap + value.slice(end)
    ns = start + wrap.length; ne = ns + inner.length
  }
  onChange(next)
  requestAnimationFrame(() => { el.focus(); el.setSelectionRange(ns, ne) })
}

function autosize(el) {
  if (!el) return
  el.style.height = 'auto'
  el.style.height = el.scrollHeight + 'px'
}

// ── Shared style fragments ────────────────────────────────────────────────────

const TYPO = {
  text:     { fontSize: '0.95rem', fontWeight: 400, lineHeight: 1.7 },
  h1:       { fontSize: '1.55rem', fontWeight: 800, lineHeight: 1.3 },
  h2:       { fontSize: '1.25rem', fontWeight: 700, lineHeight: 1.35 },
  h3:       { fontSize: '1.05rem', fontWeight: 700, lineHeight: 1.4 },
  bullet:   { fontSize: '0.95rem', fontWeight: 400, lineHeight: 1.65 },
  numbered: { fontSize: '0.95rem', fontWeight: 400, lineHeight: 1.65 },
  todo:     { fontSize: '0.95rem', fontWeight: 400, lineHeight: 1.65 },
  quote:    { fontSize: '0.98rem', fontWeight: 400, lineHeight: 1.65 },
  callout:  { fontSize: '0.92rem', fontWeight: 400, lineHeight: 1.65 },
}

const taBase = {
  width: '100%', boxSizing: 'border-box', resize: 'none', overflow: 'hidden',
  background: 'transparent', border: 'none', outline: 'none',
  color: T.text, fontFamily: T.sans, padding: 0, display: 'block',
}

// ── Editable text-ish block ───────────────────────────────────────────────────

function EditableBlock({
  block, number, focusReq, onChangeContent, onPatch, onSplit, onMergePrev,
  onNavigate, onExitList, onPaste, onFocusBlock, onSlash, slashOpen, onSlashKey,
}) {
  const ref = useRef(null)
  const [focused, setFocused] = useState(false)

  // Consume an external focus request (after split/merge/menu actions).
  useEffect(() => {
    if (focusReq && focusReq.id === block.id && ref.current) {
      setFocused(true)
      requestAnimationFrame(() => {
        const el = ref.current
        if (!el) return
        el.focus()
        const pos = focusReq.pos === 'end' || focusReq.pos == null ? el.value.length : Math.min(focusReq.pos, el.value.length)
        el.setSelectionRange(pos, pos)
        autosize(el)
      })
    }
  }, [focusReq, block.id])

  useEffect(() => { if (focused) autosize(ref.current) }, [focused, block.type])

  function handleChange(e) {
    const v = e.target.value
    // Markdown shortcut transforms (only from a plain text block).
    if (block.type === 'text') {
      for (const s of MD_SHORTCUTS) {
        if (s.re.test(v)) {
          if (s.type === 'divider') onPatch({ type: 'divider', content: '' }, { thenAddText: true })
          else if (s.type === 'code') onPatch({ type: 'code', content: '', lang: '' }, { refocus: true })
          else onPatch({ type: s.type, content: '' }, { refocus: true })
          return
        }
      }
    }
    onChangeContent(v)
    autosize(e.target)
    if (block.type === 'text' && v.startsWith('/')) onSlash(v.slice(1))
    else onSlash(null)
  }

  function handleKeyDown(e) {
    if (slashOpen) {
      if (['ArrowDown', 'ArrowUp', 'Enter', 'Escape', 'Tab'].includes(e.key)) {
        e.preventDefault()
        onSlashKey(e.key)
        return
      }
    }
    const el = e.target
    const mod = e.metaKey || e.ctrlKey
    if (mod && e.key.toLowerCase() === 'b') { e.preventDefault(); wrapSelection(el, block.content, '**', onChangeContent); return }
    if (mod && e.key.toLowerCase() === 'i') { e.preventDefault(); wrapSelection(el, block.content, '*', onChangeContent); return }
    if (mod && e.key.toLowerCase() === 'e') { e.preventDefault(); wrapSelection(el, block.content, '`', onChangeContent); return }
    if (mod && e.shiftKey && e.key.toLowerCase() === 'h') { e.preventDefault(); wrapSelection(el, block.content, '==', onChangeContent); return }
    if (mod && e.shiftKey && e.key.toLowerCase() === 's') { e.preventDefault(); wrapSelection(el, block.content, '~~', onChangeContent); return }

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      // Empty list/todo/quote item → exit back to a plain paragraph.
      if (['bullet', 'numbered', 'todo', 'quote'].includes(block.type) && block.content === '') {
        onExitList()
        return
      }
      const pos = el.selectionStart ?? block.content.length
      onSplit(block.content.slice(0, pos), block.content.slice(pos))
      return
    }
    if (e.key === 'Backspace' && el.selectionStart === 0 && el.selectionEnd === 0) {
      // Non-text block at start → demote to text first (Notion behaviour).
      if (block.type !== 'text') {
        e.preventDefault()
        onPatch({ type: 'text' }, { refocus: true, refocusPos: 0 })
        return
      }
      e.preventDefault()
      onMergePrev()
      return
    }
    if (e.key === 'ArrowUp' && el.selectionStart === 0 && el.selectionEnd === 0) {
      e.preventDefault(); onNavigate(-1); return
    }
    if (e.key === 'ArrowDown' && el.selectionStart === block.content.length && el.selectionEnd === block.content.length) {
      e.preventDefault(); onNavigate(1); return
    }
  }

  const typo = TYPO[block.type] || TYPO.text
  const showRendered = !focused && block.content.trim() !== ''

  const marker = (() => {
    if (block.type === 'bullet') return <span style={{ color: T.mid, width: '1.3rem', flexShrink: 0, textAlign: 'center', userSelect: 'none', lineHeight: typo.lineHeight, fontSize: typo.fontSize }}>•</span>
    if (block.type === 'numbered') return <span style={{ color: T.mid, minWidth: '1.3rem', flexShrink: 0, textAlign: 'right', paddingRight: '0.35rem', userSelect: 'none', lineHeight: typo.lineHeight, fontSize: typo.fontSize, fontVariantNumeric: 'tabular-nums' }}>{number}.</span>
    if (block.type === 'todo') return (
      <input
        type="checkbox"
        checked={!!block.checked}
        onChange={e => onPatch({ checked: e.target.checked })}
        onMouseDown={e => e.stopPropagation()}
        onClick={e => e.stopPropagation()}
        style={{ width: 15, height: 15, marginTop: '0.32rem', marginRight: '0.55rem', accentColor: T.accent, cursor: 'pointer', flexShrink: 0 }}
      />
    )
    return null
  })()

  const wrapStyle = (() => {
    if (block.type === 'quote') return { borderLeft: `3px solid ${T.accent}`, paddingLeft: '0.85rem' }
    if (block.type === 'callout') return { background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.28)', borderRadius: 10, padding: '0.65rem 0.85rem', display: 'flex', gap: '0.6rem' }
    return {}
  })()

  const contentStyle = {
    ...typo, color: block.type === 'todo' && block.checked ? T.low : T.text,
    textDecoration: block.type === 'todo' && block.checked ? 'line-through' : 'none',
    fontStyle: block.type === 'quote' ? 'italic' : 'normal',
    whiteSpace: 'pre-wrap', wordBreak: 'break-word', flex: 1, minWidth: 0,
  }

  return (
    <div id={`nb-${block.id}`} style={{ display: 'flex', alignItems: 'flex-start', ...wrapStyle }}>
      {block.type === 'callout' && <span style={{ fontSize: '1rem', lineHeight: 1.5, userSelect: 'none' }}>💡</span>}
      {marker}
      <div style={{ flex: 1, minWidth: 0 }}>
        {showRendered ? (
          <div onClick={() => { setFocused(true); requestAnimationFrame(() => { const el = ref.current; if (el) { el.focus(); autosize(el) } }) }} style={{ ...contentStyle, cursor: 'text' }}>
            <Rich text={block.content} />
          </div>
        ) : null}
        <textarea
          ref={ref}
          value={block.content}
          rows={1}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onPaste={onPaste}
          onFocus={() => { setFocused(true); onFocusBlock(); requestAnimationFrame(() => autosize(ref.current)) }}
          onBlur={() => { setFocused(false); onSlash(null) }}
          placeholder={block.type === 'text' ? "Type '/' for blocks, or just write…" : ''}
          style={{ ...taBase, ...typo, display: showRendered ? 'none' : 'block',
            fontStyle: block.type === 'quote' ? 'italic' : 'normal' }}
          onInput={e => autosize(e.target)}
        />
      </div>
    </div>
  )
}

// ── Code block ────────────────────────────────────────────────────────────────

function CodeBlock({ block, onPatch, onRemoveEmptyBackspace, onFocusBlock, focusReq }) {
  const ref = useRef(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (focusReq && focusReq.id === block.id && ref.current) {
      requestAnimationFrame(() => { ref.current?.focus(); autosize(ref.current) })
    }
  }, [focusReq, block.id])

  useEffect(() => { autosize(ref.current) }, [block.content])

  return (
    <div style={{ border: `1px solid ${T.border}`, borderRadius: 10, background: '#0c0c0e', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.3rem 0.7rem', borderBottom: `1px solid ${T.border}`, background: 'rgba(39,39,42,0.45)' }}>
        <input
          value={block.lang || ''}
          onChange={e => onPatch({ lang: e.target.value })}
          placeholder="language"
          spellCheck={false}
          style={{ background: 'transparent', border: 'none', outline: 'none', color: T.low, fontSize: '0.7rem', fontFamily: T.mono, width: 100 }}
        />
        <button
          onClick={() => { try { navigator.clipboard.writeText(block.content || '') } catch {}; setCopied(true); setTimeout(() => setCopied(false), 1500) }}
          style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: copied ? T.accentText : T.ghost, fontSize: '0.7rem', fontFamily: T.sans, padding: 0 }}
        >{copied ? 'Copied ✓' : 'Copy'}</button>
      </div>
      <textarea
        ref={ref}
        value={block.content}
        rows={2}
        spellCheck={false}
        onChange={e => { onPatch({ content: e.target.value }); autosize(e.target) }}
        onFocus={() => { onFocusBlock(); autosize(ref.current) }}
        onKeyDown={e => {
          if (e.key === 'Backspace' && block.content === '') { e.preventDefault(); onRemoveEmptyBackspace() }
          if (e.key === 'Tab') { e.preventDefault(); const el = e.target; const s = el.selectionStart; onPatch({ content: block.content.slice(0, s) + '  ' + block.content.slice(el.selectionEnd) }); requestAnimationFrame(() => el.setSelectionRange(s + 2, s + 2)) }
        }}
        placeholder="// code"
        style={{ ...taBase, fontFamily: T.mono, fontSize: '0.82rem', lineHeight: 1.6, padding: '0.6rem 0.8rem', color: T.text }}
        onInput={e => autosize(e.target)}
      />
    </div>
  )
}

// ── Toggle block ──────────────────────────────────────────────────────────────

function ToggleBlock({ block, onPatch, onFocusBlock, focusReq }) {
  const [open, setOpen] = useState(true)
  const titleRef = useRef(null)
  const bodyRef = useRef(null)
  const [bodyFocused, setBodyFocused] = useState(false)

  useEffect(() => {
    if (focusReq && focusReq.id === block.id && titleRef.current) {
      requestAnimationFrame(() => titleRef.current?.focus())
    }
  }, [focusReq, block.id])

  const showRenderedBody = !bodyFocused && (block.body || '').trim() !== ''

  return (
    <div style={{ border: `1px solid ${T.border}`, borderRadius: 8, background: T.surface, padding: '0.5rem 0.75rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
        <button
          onClick={() => setOpen(o => !o)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.mid, fontSize: '0.8rem', padding: '0 0.1rem', transform: open ? 'rotate(90deg)' : 'none', transition: 'transform 0.12s' }}
        >▸</button>
        <input
          ref={titleRef}
          value={block.content || ''}
          onChange={e => onPatch({ content: e.target.value })}
          onFocus={onFocusBlock}
          placeholder="Toggle title…"
          style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: T.text, fontSize: '0.92rem', fontWeight: 600, fontFamily: T.sans }}
        />
      </div>
      {open && (
        <div style={{ paddingLeft: '1.5rem', paddingTop: '0.35rem' }}>
          {showRenderedBody ? (
            <div
              onClick={() => { setBodyFocused(true); requestAnimationFrame(() => { bodyRef.current?.focus(); autosize(bodyRef.current) }) }}
              style={{ fontSize: '0.88rem', lineHeight: 1.65, color: T.mid, whiteSpace: 'pre-wrap', cursor: 'text' }}
            ><Rich text={block.body} /></div>
          ) : null}
          <textarea
            ref={bodyRef}
            value={block.body || ''}
            rows={1}
            onChange={e => { onPatch({ body: e.target.value }); autosize(e.target) }}
            onFocus={() => { setBodyFocused(true); onFocusBlock(); requestAnimationFrame(() => autosize(bodyRef.current)) }}
            onBlur={() => setBodyFocused(false)}
            placeholder="Hidden details…"
            style={{ ...taBase, fontSize: '0.88rem', lineHeight: 1.65, color: T.mid, display: showRenderedBody ? 'none' : 'block' }}
            onInput={e => autosize(e.target)}
          />
        </div>
      )}
    </div>
  )
}

// ── Video / link blocks ───────────────────────────────────────────────────────

function VideoBlock({ block, onPatch }) {
  const [playing, setPlaying] = useState(false)
  const thumb = videoThumb(block.platform, block.videoId)
  const embedUrl = videoEmbedUrl(block.platform, block.videoId)
  return (
    <div style={{ border: `1px solid ${T.border}`, borderRadius: 8, overflow: 'hidden', background: T.surface }}>
      {playing && embedUrl ? (
        <iframe src={embedUrl} style={{ width: '100%', aspectRatio: '16/9', border: 'none', display: 'block' }} allow="autoplay; fullscreen" allowFullScreen />
      ) : (
        <div onClick={() => setPlaying(true)} style={{ position: 'relative', cursor: 'pointer', background: '#000', aspectRatio: '16/9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {thumb
            ? <img src={thumb} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }} />
            : <span style={{ color: T.low, fontSize: '0.8rem' }}>{block.platform}</span>}
          <div style={{ position: 'absolute', width: 52, height: 52, borderRadius: '50%', background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#fff', fontSize: '1.3rem', marginLeft: 3 }}>▶</span>
          </div>
        </div>
      )}
      <div style={{ padding: '0.5rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: T.accentText, background: T.accentFaint, padding: '0.1rem 0.4rem', borderRadius: 3 }}>{block.platform}</span>
        <input
          value={block.title || ''}
          onChange={e => onPatch({ title: e.target.value })}
          placeholder="Add a title…"
          style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: T.mid, fontSize: '0.82rem', fontFamily: T.sans }}
        />
        <a href={block.url} target="_blank" rel="noreferrer" style={{ color: T.ghost, fontSize: '0.75rem', textDecoration: 'none' }}>↗</a>
      </div>
    </div>
  )
}

function LinkBlock({ block, onPatch, pending }) {
  const favicon = `https://www.google.com/s2/favicons?domain=${block.domain}&sz=32`
  return (
    <div style={{ border: `1px solid ${T.border}`, borderRadius: 8, background: T.surface, padding: '0.7rem 0.9rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <img src={favicon} alt="" width={14} height={14} style={{ borderRadius: 2, flexShrink: 0 }} />
        <span style={{ fontSize: '0.72rem', color: T.ghost }}>{block.domain}</span>
        {pending && <span style={{ fontSize: '0.7rem', color: T.ghost }}>fetching…</span>}
        <a href={block.url} target="_blank" rel="noreferrer" style={{ marginLeft: 'auto', color: T.ghost, fontSize: '0.75rem', textDecoration: 'none', flexShrink: 0 }}>Open ↗</a>
      </div>
      <input
        value={block.title || ''}
        onChange={e => onPatch({ title: e.target.value })}
        placeholder="Title…"
        style={{ background: 'transparent', border: 'none', outline: 'none', color: T.text, fontSize: '0.88rem', fontWeight: 600, fontFamily: T.sans }}
      />
      <textarea
        value={block.summary || ''}
        onChange={e => { onPatch({ summary: e.target.value }); autosize(e.target) }}
        placeholder="Summary or notes about this page…"
        rows={1}
        style={{ ...taBase, color: T.mid, fontSize: '0.8rem', lineHeight: 1.5, overflow: 'hidden' }}
        onInput={e => autosize(e.target)}
      />
    </div>
  )
}

// ── Slash menu ────────────────────────────────────────────────────────────────

function SlashMenu({ query, index, onPick }) {
  const items = BLOCK_DEFS.filter(d => d.type !== 'text' && (
    !query || d.label.toLowerCase().includes(query.toLowerCase()) || d.kw.includes(query.toLowerCase())
  ))
  if (!items.length) return null
  return (
    <div style={{
      position: 'absolute', zIndex: 40, top: '100%', left: '2rem', marginTop: 4,
      width: 280, maxHeight: 320, overflowY: 'auto',
      background: T.bg, border: `1px solid ${T.border}`, borderRadius: 10,
      boxShadow: '0 12px 32px rgba(0,0,0,0.45)', padding: '0.35rem',
    }}>
      <div style={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: T.ghost, padding: '0.3rem 0.6rem' }}>Blocks</div>
      {items.map((d, i) => (
        <div
          key={d.type}
          onMouseDown={e => { e.preventDefault(); onPick(d.type) }}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.4rem 0.6rem',
            borderRadius: 7, cursor: 'pointer',
            background: i === (index % items.length) ? T.accentFaint : 'transparent',
          }}
        >
          <span style={{
            width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: `1px solid ${T.border}`, borderRadius: 6, background: T.surface,
            fontSize: d.icon.length > 2 ? '0.6rem' : '0.8rem', fontWeight: 700, color: T.mid, flexShrink: 0,
            fontFamily: T.mono,
          }}>{d.icon}</span>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: T.text }}>{d.label}</div>
            <div style={{ fontSize: '0.68rem', color: T.ghost }}>{d.desc}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

// Resolve the currently-visible slash items for keyboard selection (must mirror
// the filter in SlashMenu exactly).
function slashItems(query) {
  return BLOCK_DEFS.filter(d => d.type !== 'text' && (
    !query || d.label.toLowerCase().includes(query.toLowerCase()) || d.kw.includes(query.toLowerCase())
  ))
}

// ── Block menu (drag-handle dropdown) ─────────────────────────────────────────

function BlockMenu({ onTurnInto, onDuplicate, onMoveUp, onMoveDown, onDelete, onClose }) {
  const ref = useRef(null)
  useEffect(() => {
    function onDoc(e) { if (ref.current && !ref.current.contains(e.target)) onClose() }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [onClose])
  const btn = {
    display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%',
    background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
    color: T.mid, fontSize: '0.78rem', padding: '0.32rem 0.6rem', borderRadius: 6, fontFamily: T.sans,
  }
  return (
    <div ref={ref} style={{
      position: 'absolute', zIndex: 50, top: 22, left: 0, width: 210,
      background: T.bg, border: `1px solid ${T.border}`, borderRadius: 10,
      boxShadow: '0 12px 32px rgba(0,0,0,0.45)', padding: '0.35rem',
    }}>
      <div style={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: T.ghost, padding: '0.25rem 0.6rem' }}>Turn into</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, padding: '0 0.4rem 0.35rem' }}>
        {BLOCK_DEFS.filter(d => TEXTISH.has(d.type) || ['code', 'toggle'].includes(d.type)).map(d => (
          <button key={d.type} title={d.label}
            onMouseDown={e => e.preventDefault()}
            onClick={() => { onTurnInto(d.type); onClose() }}
            style={{
              width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: T.surface, border: `1px solid ${T.border}`, borderRadius: 6,
              color: T.mid, fontSize: d.icon.length > 2 ? '0.55rem' : '0.72rem', fontWeight: 700, cursor: 'pointer', fontFamily: T.mono,
            }}
          >{d.icon}</button>
        ))}
      </div>
      <div style={{ borderTop: `1px solid ${T.border}`, margin: '0.15rem 0' }} />
      <button style={btn} onClick={() => { onDuplicate(); onClose() }}>⧉ Duplicate</button>
      <button style={btn} onClick={() => { onMoveUp(); onClose() }}>↑ Move up</button>
      <button style={btn} onClick={() => { onMoveDown(); onClose() }}>↓ Move down</button>
      <button style={{ ...btn, color: T.danger }} onClick={() => { onDelete(); onClose() }}>✕ Delete</button>
    </div>
  )
}


// ── Scoped polish CSS (violet accents, hover-reveal gutters, selection tint) ──
const EDITOR_CSS = `
.gsl-note-editor textarea::placeholder, .gsl-note-editor input::placeholder { color: #52525b; }
.gsl-note-editor textarea, .gsl-note-editor input { caret-color: #a78bfa; }
.gsl-note-editor ::selection { background: rgba(139,92,246,0.35); }
.gsl-note-editor .nb-gutter { opacity: 0; transition: opacity 0.15s ease; }
.gsl-note-editor .nb-row:hover .nb-gutter, .gsl-note-editor .nb-gutter.open { opacity: 1; }
.gsl-note-editor .nb-gutter button:hover, .gsl-note-editor .nb-gutter span:hover { color: #a78bfa !important; }
.gsl-note-editor .nb-tbbtn:hover { color: #e4d4fc !important; background: rgba(139,92,246,0.12) !important; }
.gsl-note-editor .nb-chip:hover { border-color: rgba(139,92,246,0.6) !important; color: #c4b5fd !important; }
`

// ── Main NoteEditor ───────────────────────────────────────────────────────────

export function NoteEditor({ trackId, note, onBack }) {
  const [title, setTitle] = useState(note.title || '')
  const [blocks, setBlocks] = useState(() =>
    note.blocks?.length ? note.blocks : [{ id: uid(), type: 'text', content: '' }])
  const [focusReq, setFocusReq] = useState(null)          // { id, pos, t }
  const [focusedId, setFocusedId] = useState(null)
  const [slash, setSlash] = useState(null)                // { blockId, query, index }
  const [menuFor, setMenuFor] = useState(null)            // block id with open handle-menu
  const [dragIdx, setDragIdx] = useState(null)
  const [overIdx, setOverIdx] = useState(null)
  const [savedAt, setSavedAt] = useState(null)
  const [pendingLink, setPendingLink] = useState(null)
  const [copiedMd, setCopiedMd] = useState(false)
  const [wide, setWide] = useState(typeof window !== 'undefined' ? window.innerWidth >= 1180 : true)

  const saveTimer = useRef(null)
  const latest = useRef({ title, blocks })
  latest.current = { title, blocks }

  useEffect(() => {
    const onResize = () => setWide(window.innerWidth >= 1180)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const persist = useCallback((nextTitle, nextBlocks) => {
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      updateNoteById(trackId, note.id, { title: nextTitle, blocks: nextBlocks })
      setSavedAt(Date.now())
    }, 500)
  }, [trackId, note.id])

  function commit(nextBlocks, nextTitle = title) {
    setBlocks(nextBlocks)
    persist(nextTitle, nextBlocks)
  }

  function setTitleAndSave(t) { setTitle(t); persist(t, blocks) }

  function saveNow() {
    clearTimeout(saveTimer.current)
    updateNoteById(trackId, note.id, { title: latest.current.title, blocks: latest.current.blocks })
    setSavedAt(Date.now())
  }

  // Flush on unmount.
  useEffect(() => () => {
    clearTimeout(saveTimer.current)
    updateNoteById(trackId, note.id, { title: latest.current.title, blocks: latest.current.blocks })
  }, []) // eslint-disable-line

  // ── Block ops ──────────────────────────────────────────────────────────────

  const idx = id => blocks.findIndex(b => b.id === id)

  function patchBlock(id, patch, opts = {}) {
    let next = blocks.map(b => (b.id === id ? { ...b, ...patch } : b))
    if (opts.thenAddText) {
      const i = next.findIndex(b => b.id === id)
      const nb = { id: uid(), type: 'text', content: '' }
      next = [...next.slice(0, i + 1), nb, ...next.slice(i + 1)]
      commit(next)
      setFocusReq({ id: nb.id, pos: 0, t: Date.now() })
      return
    }
    commit(next)
    if (opts.refocus) setFocusReq({ id, pos: opts.refocusPos ?? 'end', t: Date.now() })
  }

  function insertAfter(id, block, focus = true) {
    const i = idx(id)
    const next = [...blocks.slice(0, i + 1), block, ...blocks.slice(i + 1)]
    commit(next)
    if (focus) setFocusReq({ id: block.id, pos: 0, t: Date.now() })
    return block
  }

  function removeBlock(id, focusPrevious = true) {
    const i = idx(id)
    let next = blocks.filter(b => b.id !== id)
    if (!next.length) next = [{ id: uid(), type: 'text', content: '' }]
    commit(next)
    if (focusPrevious) {
      const target = next[Math.max(0, i - 1)]
      if (target && (TEXTISH.has(target.type) || target.type === 'code')) setFocusReq({ id: target.id, pos: 'end', t: Date.now() })
    }
  }

  function splitBlock(id, before, after) {
    const i = idx(id)
    const cur = blocks[i]
    const continueType = ['bullet', 'numbered', 'todo'].includes(cur.type) ? cur.type : 'text'
    const nb = { id: uid(), type: continueType, content: after }
    if (continueType === 'todo') nb.checked = false
    const next = [...blocks.slice(0, i), { ...cur, content: before }, nb, ...blocks.slice(i + 1)]
    commit(next)
    setFocusReq({ id: nb.id, pos: 0, t: Date.now() })
  }

  function mergePrev(id) {
    const i = idx(id)
    if (i === 0) return
    const prev = blocks[i - 1]
    const cur = blocks[i]
    if (TEXTISH.has(prev.type)) {
      const joinPos = (prev.content || '').length
      const next = blocks
        .map((b, j) => (j === i - 1 ? { ...b, content: (b.content || '') + (cur.content || '') } : b))
        .filter((_, j) => j !== i)
      commit(next)
      setFocusReq({ id: prev.id, pos: joinPos, t: Date.now() })
    } else if (cur.content === '') {
      removeBlock(id)
    } else {
      setFocusReq({ id: prev.id, pos: 'end', t: Date.now() })
    }
  }

  function navigate(id, dir) {
    const i = idx(id)
    for (let j = i + dir; j >= 0 && j < blocks.length; j += dir) {
      const b = blocks[j]
      if (TEXTISH.has(b.type) || b.type === 'code') {
        setFocusReq({ id: b.id, pos: dir === -1 ? 'end' : 0, t: Date.now() })
        return
      }
    }
  }

  function moveBlock(from, to) {
    if (from === to || from == null || to == null) return
    const next = [...blocks]
    const [m] = next.splice(from, 1)
    next.splice(to, 0, m)
    commit(next)
  }

  function duplicateBlock(id) {
    const i = idx(id)
    const copy = { ...blocks[i], id: uid() }
    commit([...blocks.slice(0, i + 1), copy, ...blocks.slice(i + 1)])
  }

  // ── Slash menu ────────────────────────────────────────────────────────────

  function applySlashPick(blockId, type) {
    if (type === 'video' || type === 'link') {
      const url = window.prompt('Paste a URL:')
      setSlash(null)
      if (!url || !isUrl(url)) { patchBlock(blockId, { content: '' }, { refocus: true }); return }
      insertUrlAt(blockId, url, true)
      return
    }
    setSlash(null)
    if (type === 'divider') { patchBlock(blockId, { type: 'divider', content: '' }, { thenAddText: true }); return }
    if (type === 'code') { patchBlock(blockId, { type: 'code', content: '', lang: '' }, { refocus: true }); return }
    if (type === 'toggle') { patchBlock(blockId, { type: 'toggle', content: '', body: '' }, { refocus: true }); return }
    patchBlock(blockId, { type, content: '', checked: false }, { refocus: true })
  }

  function handleSlashKey(blockId, key) {
    if (!slash) return
    const items = slashItems(slash.query)
    if (key === 'Escape') { setSlash(null); return }
    if (key === 'ArrowDown') { setSlash(s => ({ ...s, index: s.index + 1 })); return }
    if (key === 'ArrowUp') { setSlash(s => ({ ...s, index: Math.max(0, s.index - 1) })); return }
    if (key === 'Enter' || key === 'Tab') {
      const pick = items[slash.index % Math.max(1, items.length)]
      if (pick) applySlashPick(blockId, pick.type)
      else setSlash(null)
    }
  }

  // ── URL / paste handling ──────────────────────────────────────────────────

  function insertUrlAt(blockId, url, replaceCurrent) {
    const video = detectVideo(url)
    const trailing = { id: uid(), type: 'text', content: '' }
    let inserted
    if (video) inserted = { id: uid(), type: 'video', url, platform: video.platform, videoId: video.videoId, title: '' }
    else inserted = { id: uid(), type: 'link', url, domain: domainOf(url), title: '', summary: '' }
    const i = idx(blockId)
    const next = replaceCurrent
      ? [...blocks.slice(0, i), inserted, trailing, ...blocks.slice(i + 1)]
      : [...blocks.slice(0, i + 1), inserted, trailing, ...blocks.slice(i + 1)]
    commit(next)
    setFocusReq({ id: trailing.id, pos: 0, t: Date.now() })
    if (!video) {
      setPendingLink(inserted.id)
      fetchMeta(url).then(meta => {
        setBlocks(prev => {
          const updated = prev.map(b => (b.id === inserted.id ? { ...b, title: meta.title, summary: b.summary || meta.summary } : b))
          persist(latest.current.title, updated)
          return updated
        })
        setPendingLink(null)
      })
    }
  }

  function handlePaste(e, blockId) {
    const text = e.clipboardData.getData('text')
    const trimmed = text.trim()
    if (isUrl(trimmed) && !trimmed.includes('\n')) {
      e.preventDefault()
      const cur = blocks[idx(blockId)]
      insertUrlAt(blockId, trimmed, cur && cur.content === '')
      return
    }
    if (text.includes('\n')) {
      e.preventDefault()
      const parsed = markdownToBlocks(text)
      const i = idx(blockId)
      const cur = blocks[i]
      const next = cur && TEXTISH.has(cur.type) && cur.content === ''
        ? [...blocks.slice(0, i), ...parsed, ...blocks.slice(i + 1)]
        : [...blocks.slice(0, i + 1), ...parsed, ...blocks.slice(i + 1)]
      commit(next)
      const last = parsed[parsed.length - 1]
      if (last && TEXTISH.has(last.type)) setFocusReq({ id: last.id, pos: 'end', t: Date.now() })
    }
    // single-line non-URL → default paste
  }

  // ── Derived stats ─────────────────────────────────────────────────────────

  const stats = useMemo(() => {
    let words = 0, todos = 0, todosDone = 0
    for (const b of blocks) {
      if (TEXTISH.has(b.type) && b.content) words += b.content.trim().split(/\s+/).filter(Boolean).length
      if (b.type === 'toggle' && b.body) words += b.body.trim().split(/\s+/).filter(Boolean).length
      if (b.type === 'todo') { todos += 1; if (b.checked) todosDone += 1 }
    }
    const filled = blocks.filter(b => b.type === 'divider' || b.type === 'video' || b.type === 'link' || (b.content || '').trim() || (b.body || '').trim()).length
    return { words, todos, todosDone, filled, minutes: Math.max(1, Math.round(words / 200)) }
  }, [blocks])

  const headings = useMemo(
    () => blocks.filter(b => ['h1', 'h2', 'h3'].includes(b.type) && (b.content || '').trim()),
    [blocks]
  )

  // ── Export ────────────────────────────────────────────────────────────────

  function copyMarkdown() {
    try { navigator.clipboard.writeText(blocksToMarkdown(title, blocks)) } catch {}
    setCopiedMd(true); setTimeout(() => setCopiedMd(false), 1500)
  }

  function downloadMarkdown() {
    const md = blocksToMarkdown(title, blocks)
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `${(title || 'note').replace(/[^\w\d-]+/g, '-').replace(/^-+|-+$/g, '') || 'note'}.md`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  // ── Toolbar actions on the focused block ──────────────────────────────────

  function toolbarMark(wrap) {
    if (!focusedId) return
    const b = blocks.find(x => x.id === focusedId)
    if (!b || !TEXTISH.has(b.type)) return
    const el = document.querySelector(`#nb-${CSS.escape(focusedId)} textarea`)
    if (!el) return
    wrapSelection(el, b.content, wrap, v => patchBlock(focusedId, { content: v }))
  }

  function toolbarType(type) {
    if (!focusedId) return
    const b = blocks.find(x => x.id === focusedId)
    if (!b) return
    if (b.type === type) { patchBlock(focusedId, { type: 'text' }, { refocus: true }); return }
    if (type === 'code') { patchBlock(focusedId, { type: 'code', lang: b.lang || '' }, { refocus: true }); return }
    patchBlock(focusedId, { type }, { refocus: true })
  }

  const savedLabel = savedAt
    ? `Saved ${new Date(savedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    : 'Auto-saves'

  // Numbered-list numbering (consecutive runs).
  const numbering = useMemo(() => {
    const map = {}
    let n = 0
    for (const b of blocks) {
      if (b.type === 'numbered') { n += 1; map[b.id] = n } else n = 0
    }
    return map
  }, [blocks])

  const tbBtn = active => ({
    minWidth: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '0 5px', fontSize: '0.68rem', fontWeight: 700, borderRadius: 5,
    background: active ? T.accentFaint : 'transparent', border: `1px solid ${active ? T.accent : 'transparent'}`,
    color: active ? T.accentText : T.low, cursor: 'pointer', fontFamily: T.sans,
  })

  const focusedBlock = blocks.find(b => b.id === focusedId)

  return (
    <div
      className="gsl-note-editor"
      style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', fontFamily: T.sans }}
      onKeyDownCapture={e => {
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') { e.preventDefault(); saveNow() }
      }}
    >
      <style>{EDITOR_CSS}</style>
      {/* ── Top bar ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', padding: '0.6rem 1.25rem', borderBottom: `1px solid ${T.border}`, flexShrink: 0, background: 'rgba(9,9,11,0.7)' }}>
        <button onClick={() => { saveNow(); onBack() }} title="Back to track"
          style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(24,24,27,0.9)', border: `1px solid ${T.border}`, borderRadius: 8, cursor: 'pointer', color: T.mid, fontSize: '0.95rem', padding: 0, lineHeight: 1, flexShrink: 0 }}
          className="nb-chip">←</button>
        <span style={{ fontSize: '0.62rem', fontWeight: 700, color: '#a78bfa', background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: 4, padding: '0.14rem 0.45rem', textTransform: 'uppercase', letterSpacing: '0.07em', flexShrink: 0 }}>📝 Note</span>
        <span style={{ fontSize: '0.78rem', fontWeight: 600, color: T.mid, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>{title || 'Untitled'}</span>
        <div style={{ flex: 1, minWidth: 0 }} />
        <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.7rem', color: T.ghost, flexShrink: 0, whiteSpace: 'nowrap' }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: savedAt ? '#34d399' : T.ghost, display: 'inline-block', flexShrink: 0 }} />
          {stats.words} words · {stats.minutes} min read
          {stats.todos > 0 ? ` · ${stats.todosDone}/${stats.todos} done` : ''} · {savedLabel}
        </span>
        <button onClick={copyMarkdown} title="Copy note as Markdown" className="nb-chip"
          style={{ background: 'rgba(24,24,27,0.9)', border: `1px solid ${T.border}`, borderRadius: 7, cursor: 'pointer', color: copiedMd ? '#a78bfa' : T.low, fontSize: '0.7rem', fontWeight: 600, padding: '0.28rem 0.6rem', whiteSpace: 'nowrap', fontFamily: T.sans }}>
          {copiedMd ? 'Copied ✓' : 'Copy MD'}
        </button>
        <button onClick={downloadMarkdown} title="Download as .md" className="nb-chip"
          style={{ background: 'rgba(24,24,27,0.9)', border: `1px solid ${T.border}`, borderRadius: 7, cursor: 'pointer', color: T.low, fontSize: '0.7rem', fontWeight: 600, padding: '0.28rem 0.6rem', whiteSpace: 'nowrap', fontFamily: T.sans }}>
          Export ↓
        </button>
      </div>

      {/* ── Format toolbar ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 2, padding: '0.4rem 1.25rem', borderBottom: `1px solid ${T.border}`, flexShrink: 0, overflowX: 'auto', background: 'rgba(24,24,27,0.55)', backdropFilter: 'blur(6px)' }}>
        <button className="nb-tbbtn" style={tbBtn(false)} title="Bold (⌘B)" onMouseDown={e => e.preventDefault()} onClick={() => toolbarMark('**')}><b>B</b></button>
        <button className="nb-tbbtn" style={tbBtn(false)} title="Italic (⌘I)" onMouseDown={e => e.preventDefault()} onClick={() => toolbarMark('*')}><i>I</i></button>
        <button className="nb-tbbtn" style={tbBtn(false)} title="Strikethrough (⌘⇧S)" onMouseDown={e => e.preventDefault()} onClick={() => toolbarMark('~~')}><s>S</s></button>
        <button className="nb-tbbtn" style={{ ...tbBtn(false), fontFamily: T.mono }} title="Inline code (⌘E)" onMouseDown={e => e.preventDefault()} onClick={() => toolbarMark('`')}>{'<>'}</button>
        <button className="nb-tbbtn" style={tbBtn(false)} title="Highlight (⌘⇧H)" onMouseDown={e => e.preventDefault()} onClick={() => toolbarMark('==')}>
          <span style={{ background: T.highlightBg, borderRadius: 3, padding: '0 3px' }}>H</span>
        </button>
        <span style={{ width: 1, height: 16, background: T.border, margin: '0 6px', flexShrink: 0 }} />
        {[['h1', 'H1'], ['h2', 'H2'], ['h3', 'H3'], ['bullet', '•'], ['numbered', '1.'], ['todo', '☑'], ['quote', '❝'], ['callout', '💡'], ['code', '</>']].map(([type, label]) => (
          <button key={type} className="nb-tbbtn" style={{ ...tbBtn(focusedBlock?.type === type), fontFamily: type === 'code' ? T.mono : T.sans }}
            title={BLOCK_DEFS.find(d => d.type === type)?.label}
            onMouseDown={e => e.preventDefault()} onClick={() => toolbarType(type)}>{label}</button>
        ))}
        <span style={{ marginLeft: 'auto', fontSize: '0.64rem', color: T.ghost, whiteSpace: 'nowrap', paddingLeft: 8 }}>
          “/” for blocks · “# ” “- ” “[] ” “&gt; ” “```” shortcuts
        </span>
      </div>

      {/* ── Body ── */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex' }}>
        <div style={{ flex: 1, minWidth: 0, padding: '1.75rem 2rem 40vh', background: 'radial-gradient(640px 220px at 50% -60px, rgba(124,58,237,0.10), transparent)' }}>
          <div style={{ maxWidth: 720, margin: '0 auto' }}>
            {/* Title */}
            <textarea
              value={title}
              onChange={e => { setTitleAndSave(e.target.value.replace(/\n/g, '')); autosize(e.target) }}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  const first = blocks[0]
                  if (first && TEXTISH.has(first.type)) setFocusReq({ id: first.id, pos: 0, t: Date.now() })
                }
              }}
              placeholder="Untitled"
              rows={1}
              style={{ ...taBase, fontSize: '2.2rem', fontWeight: 800, lineHeight: 1.2, letterSpacing: '-0.02em', marginBottom: '1.1rem', color: T.text }}
              onInput={e => autosize(e.target)}
            />

            {/* Blocks */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {blocks.map((block, i) => {
                const isSlashHere = slash && slash.blockId === block.id
                return (
                  <div
                    key={block.id}
                    onDragOver={e => { e.preventDefault(); if (overIdx !== i) setOverIdx(i) }}
                    onDrop={e => { e.preventDefault(); if (dragIdx != null) moveBlock(dragIdx, i); setDragIdx(null); setOverIdx(null) }}
                    style={{
                      position: 'relative', display: 'flex', alignItems: 'flex-start', gap: 4,
                      padding: '0.14rem 0', borderTop: overIdx === i && dragIdx !== null && dragIdx !== i ? `2px solid ${T.accent}` : '2px solid transparent',
                      opacity: dragIdx === i ? 0.45 : 1,
                    }}
                    className="nb-row"
                  >
                    {/* Gutter */}
                    <div className={'nb-gutter' + (menuFor === block.id ? ' open' : '')} style={{ display: 'flex', gap: 1, width: 40, flexShrink: 0, justifyContent: 'flex-end', paddingTop: block.type === 'h1' ? 10 : block.type === 'h2' ? 6 : 4, position: 'relative' }}>
                      <button
                        title="Add block below"
                        onMouseDown={e => e.preventDefault()}
                        onClick={() => insertAfter(block.id, { id: uid(), type: 'text', content: '' })}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.ghost, fontSize: '0.85rem', padding: '0 2px', lineHeight: 1, opacity: 0.75 }}
                      >＋</button>
                      <span
                        draggable
                        title="Drag to reorder · click for menu"
                        onClick={() => setMenuFor(menuFor === block.id ? null : block.id)}
                        onDragStart={e => { setDragIdx(i); e.dataTransfer.effectAllowed = 'move'; try { e.dataTransfer.setData('text/plain', block.id) } catch {} }}
                        onDragEnd={() => { setDragIdx(null); setOverIdx(null) }}
                        style={{ cursor: 'grab', color: T.ghost, fontSize: '0.8rem', userSelect: 'none', padding: '0 2px', lineHeight: 1, opacity: 0.75 }}
                      >⠿</span>
                      {menuFor === block.id && (
                        <BlockMenu
                          onTurnInto={type => {
                            if (type === 'toggle') patchBlock(block.id, { type, body: block.body || '' }, { refocus: true })
                            else patchBlock(block.id, { type }, { refocus: true })
                          }}
                          onDuplicate={() => duplicateBlock(block.id)}
                          onMoveUp={() => moveBlock(i, Math.max(0, i - 1))}
                          onMoveDown={() => moveBlock(i, Math.min(blocks.length - 1, i + 1))}
                          onDelete={() => removeBlock(block.id)}
                          onClose={() => setMenuFor(null)}
                        />
                      )}
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0, position: 'relative' }}>
                      {TEXTISH.has(block.type) && (
                        <EditableBlock
                          block={block}
                          number={numbering[block.id]}
                          focusReq={focusReq}
                          onChangeContent={v => patchBlock(block.id, { content: v })}
                          onPatch={(patch, opts) => patchBlock(block.id, patch, opts)}
                          onSplit={(before, after) => splitBlock(block.id, before, after)}
                          onMergePrev={() => mergePrev(block.id)}
                          onNavigate={dir => navigate(block.id, dir)}
                          onExitList={() => patchBlock(block.id, { type: 'text' }, { refocus: true })}
                          onPaste={e => handlePaste(e, block.id)}
                          onFocusBlock={() => setFocusedId(block.id)}
                          onSlash={q => setSlash(q == null ? null : { blockId: block.id, query: q, index: 0 })}
                          slashOpen={!!isSlashHere}
                          onSlashKey={key => handleSlashKey(block.id, key)}
                        />
                      )}
                      {block.type === 'code' && (
                        <CodeBlock
                          block={block}
                          focusReq={focusReq}
                          onPatch={patch => patchBlock(block.id, patch)}
                          onFocusBlock={() => setFocusedId(block.id)}
                          onRemoveEmptyBackspace={() => patchBlock(block.id, { type: 'text', content: '' }, { refocus: true })}
                        />
                      )}
                      {block.type === 'toggle' && (
                        <ToggleBlock block={block} focusReq={focusReq} onPatch={patch => patchBlock(block.id, patch)} onFocusBlock={() => setFocusedId(block.id)} />
                      )}
                      {block.type === 'divider' && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0.5rem 0' }}>
                          <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.45), transparent)' }} />
                          <button onClick={() => removeBlock(block.id, false)} title="Remove divider"
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.ghost, fontSize: '0.65rem', padding: 0, opacity: 0.6 }}>✕</button>
                        </div>
                      )}
                      {block.type === 'video' && <VideoBlock block={block} onPatch={patch => patchBlock(block.id, patch)} />}
                      {block.type === 'link' && <LinkBlock block={block} pending={pendingLink === block.id} onPatch={patch => patchBlock(block.id, patch)} />}

                      {isSlashHere && (
                        <SlashMenu
                          query={slash.query}
                          index={slash.index}
                          onPick={type => applySlashPick(block.id, type)}
                        />
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Click-below to append */}
            <div
              onClick={() => {
                const last = blocks[blocks.length - 1]
                if (last && TEXTISH.has(last.type) && last.content === '') { setFocusReq({ id: last.id, pos: 0, t: Date.now() }); return }
                const nb = { id: uid(), type: 'text', content: '' }
                commit([...blocks, nb])
                setFocusReq({ id: nb.id, pos: 0, t: Date.now() })
              }}
              style={{ minHeight: '6rem', cursor: 'text' }}
            />
          </div>
        </div>

        {/* ── Outline rail ── */}
        {wide && headings.length >= 2 && (
          <div style={{ width: 200, flexShrink: 0, padding: '2rem 1.25rem 2rem 0', position: 'sticky', top: 0, alignSelf: 'flex-start', maxHeight: '100%', overflowY: 'auto' }}>
            <div style={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#a78bfa', marginBottom: '0.5rem' }}>Outline</div>
            {headings.map(h => (
              <div
                key={h.id}
                onClick={() => document.getElementById(`nb-${h.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                style={{
                  fontSize: '0.72rem', color: T.low, cursor: 'pointer', padding: '0.18rem 0',
                  paddingLeft: h.type === 'h2' ? 10 : h.type === 'h3' ? 20 : 0,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  borderLeft: `2px solid ${T.border}`, paddingRight: 4, textIndent: 6,
                }}
                onMouseEnter={e => { e.currentTarget.style.color = T.accentText }}
                onMouseLeave={e => { e.currentTarget.style.color = T.low }}
              >{h.content}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
