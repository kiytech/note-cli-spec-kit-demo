import { readNotes, writeNotes, generateId, generateTimestamp } from '../storage/file-store'
import { Note } from '../models/note'
import { parseTags, normalizeTags, validateTags } from '../utils/tag-utils'

export function addCommand(content: string, tagsInput?: string): void {
  if (content.trim() === '') {
    throw new Error('Note content cannot be empty')
  }

  // Parse and normalize tags
  let tags: string[] = []
  if (tagsInput) {
    const parsedTags = parseTags(tagsInput)
    tags = normalizeTags(parsedTags)
    validateTags(tags)
  }

  const note: Note = {
    id: generateId(),
    content,
    createdAt: generateTimestamp(),
    updatedAt: generateTimestamp(),
    tags
  }

  const notes = readNotes()
  notes.push(note)
  writeNotes(notes)

  console.log(`Note created: ${note.id.slice(0, 8)}`)
}
