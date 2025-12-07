import { readNotes, writeNotes, findNoteByPrefix } from '../storage/file-store'

export function deleteCommand(idPrefix: string): void {
  if (!idPrefix) {
    throw new Error('Missing note ID. Usage: note delete <id>')
  }

  const notes = readNotes()
  const noteToDelete = findNoteByPrefix(notes, idPrefix)

  const updatedNotes = notes.filter(n => n.id !== noteToDelete.id)
  writeNotes(updatedNotes)

  console.log(`Note deleted: ${noteToDelete.id.slice(0, 8)}`)
}
