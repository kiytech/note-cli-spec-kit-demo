import { readNotes } from '../storage/file-store'
import { formatTimestamp } from '../utils/date-formatter'

function formatNoteOneLine(id: string, content: string, timestamp: string, tags: string[]): string {
  const tagStr = tags.length > 0 ? ` #${tags.join(' #')}` : ''
  return `[${id.slice(0, 8)}] ${content}${tagStr} (${formatTimestamp(timestamp)})`
}

export function listCommand(args: string[]): void {
  let notes = readNotes()
  const jsonMode = args.includes('--json')

  // Parse --tag filter
  const tagIndex = args.indexOf('--tag')
  if (tagIndex !== -1) {
    if (!args[tagIndex + 1]) {
      throw new Error('Missing tag value. Usage: note list --tag <tag>')
    }
    const filterTag = args[tagIndex + 1].toLowerCase()
    notes = notes.filter(note => note.tags.includes(filterTag))
  }

  if (notes.length === 0) {
    console.log('No notes found')
    return
  }

  if (jsonMode) {
    console.log(JSON.stringify({ notes }, null, 2))
  } else {
    notes.forEach(note => {
      console.log(formatNoteOneLine(note.id, note.content, note.createdAt, note.tags))
    })
  }
}
