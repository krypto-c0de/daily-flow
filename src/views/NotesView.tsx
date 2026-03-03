import { useState, useEffect } from 'react'

interface Note {
  id: string
  text: string
  createdAt: string
}

const STORAGE_KEY = 'dailyflow-notes-v1'

function loadNotes(): Note[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') } catch { return [] }
}
function saveNotes(notes: Note[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes))
}

export default function NotesView() {
  const [notes, setNotes] = useState<Note[]>(loadNotes)
  const [draft, setDraft]   = useState('')
  const [editId, setEditId] = useState<string | null>(null)

  useEffect(() => { saveNotes(notes) }, [notes])

  const addNote = () => {
    if (!draft.trim()) return
    const note: Note = { id: Date.now().toString(), text: draft.trim(), createdAt: new Date().toISOString() }
    setNotes(prev => [note, ...prev])
    setDraft('')
  }

  const deleteNote = (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id))
  }

  const updateNote = (id: string, text: string) => {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, text } : n))
    setEditId(null)
  }

  const fmt = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
  }

  return (
    <div className="block">
      {/* Header */}
      <div className="flex-shrink-0 px-5 pb-3 pt-2" style={{ background: 'var(--paper)' }}>
        <h1 style={{
          fontSize: 28,
          fontWeight: 700,
          letterSpacing: '-.02em',
          color: 'var(--ink)',
          fontFamily: 'var(--font-system)',
        }}>
          Notas
        </h1>
      </div>

      {/* Input area */}
      <div className="flex-shrink-0 px-5 pb-4">
        <div
          className="flex items-end gap-3 p-4 rounded-2xl"
          style={{ background: 'var(--white)', border: '1px solid var(--line)' }}
        >
          <textarea
            value={draft}
            onChange={e => setDraft(e.target.value)}
            placeholder="Nova nota..."
            rows={2}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); addNote() } }}
            className="flex-1 resize-none outline-none text-[15px] leading-relaxed"
            style={{
              background: 'transparent',
              color: 'var(--ink)',
              fontFamily: 'var(--font-system)',
            }}
          />
          <button
            onClick={addNote}
            disabled={!draft.trim()}
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 active:scale-90 transition-transform"
            style={{
              background: draft.trim() ? 'var(--ink)' : 'var(--soft)',
              color: draft.trim() ? 'var(--paper)' : 'var(--muted)',
              transition: 'background 0.2s',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 19V5M5 12l7-7 7 7"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Notes list */}
      <div className="scroll-area px-5 space-y-3" style={{ paddingBottom: 'calc(var(--safe-bottom) + 1rem)' }}>
        {notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center pt-16 gap-3 fade-up">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl" style={{ background: 'var(--soft)' }}>
              📝
            </div>
            <div className="text-center">
              <p className="text-[16px] font-semibold mb-1" style={{ color: 'var(--ink)' }}>Nenhuma nota ainda</p>
              <p className="text-[13px]" style={{ color: 'var(--muted)' }}>Escreva pensamentos, ideias<br/>ou lembretes rápidos</p>
            </div>
          </div>
        ) : (
          notes.map((note, i) => (
            <div
              key={note.id}
              className={`rounded-2xl p-4 fade-up fade-up-${Math.min(i + 1, 5)}`}
              style={{ background: 'var(--white)', border: '1px solid var(--line)' }}
            >
              {editId === note.id ? (
                <textarea
                  autoFocus
                  defaultValue={note.text}
                  rows={3}
                  className="w-full resize-none outline-none text-[15px] leading-relaxed"
                  style={{ background: 'transparent', color: 'var(--ink)', fontFamily: 'var(--font-system)' }}
                  onBlur={e => updateNote(note.id, e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); updateNote(note.id, (e.target as HTMLTextAreaElement).value) } }}
                />
              ) : (
                <p
                  className="text-[15px] leading-relaxed cursor-text"
                  style={{ color: 'var(--ink)', fontFamily: 'var(--font-system)', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
                  onClick={() => setEditId(note.id)}
                >
                  {note.text}
                </p>
              )}
              <div className="flex items-center justify-between mt-3">
                <span className="text-[11px]" style={{ color: 'var(--muted)' }}>{fmt(note.createdAt)}</span>
                <button
                  onClick={() => deleteNote(note.id)}
                  className="active:scale-90 transition-transform"
                  style={{ color: 'var(--muted)' }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>
                  </svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
