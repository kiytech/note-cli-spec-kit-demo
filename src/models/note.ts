export interface Note {
  id: string
  content: string
  createdAt: string
  updatedAt: string
  tags: string[]
}

export interface NotesStorage {
  notes: Note[]
}
