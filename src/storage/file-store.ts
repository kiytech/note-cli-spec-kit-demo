import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'
import * as crypto from 'crypto'
import { Note, NotesStorage } from '../models/note'

export function getStoragePath(): string {
  return path.join(os.homedir(), '.note-cli', 'notes.json')
}

export function ensureStorageExists(): void {
  const storagePath = getStoragePath()
  const dir = path.dirname(storagePath)

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }

  if (!fs.existsSync(storagePath)) {
    writeNotes([])
  }
}

export function readNotes(): Note[] {
  ensureStorageExists()
  const data = fs.readFileSync(getStoragePath(), 'utf-8')
  const storage: NotesStorage = JSON.parse(data)
  // Backward compatibility: add empty tags array if missing
  return storage.notes.map(note => ({
    ...note,
    tags: note.tags ?? []
  }))
}

export function writeNotes(notes: Note[]): void {
  const storage: NotesStorage = { notes }
  const tmpPath = getStoragePath() + '.tmp'
  fs.writeFileSync(tmpPath, JSON.stringify(storage, null, 2))
  fs.renameSync(tmpPath, getStoragePath())
}

export function generateId(): string {
  return crypto.randomUUID()
}

export function generateTimestamp(): string {
  return new Date().toISOString()
}

export function findNoteByPrefix(notes: Note[], prefix: string): Note {
  const matches = notes.filter(n => n.id.startsWith(prefix))

  if (matches.length === 0) {
    throw new Error(`No note found with ID prefix: ${prefix}`)
  }

  if (matches.length > 1) {
    const list = matches.map(n => `  - ${n.id.slice(0, 8)}: ${n.content}`).join('\n')
    throw new Error(`Ambiguous ID prefix '${prefix}' matches multiple notes:\n${list}\nPlease provide more characters`)
  }

  return matches[0]
}
