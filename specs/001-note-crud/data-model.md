# Data Model: Note CRUD

**Feature**: 001-note-crud
**Date**: 2025-12-06

## Entities

### Note

Represents a single note entry in the system.

**Fields**:
- `id` (string, required): Unique identifier, UUID v4 format
  - Example: `"550e8400-e29b-41d4-a716-446655440000"`
  - Generated on creation using `crypto.randomUUID()`
  - Immutable after creation

- `content` (string, required): The note text
  - UTF-8 encoded
  - No length limit (rely on JSON/filesystem limits)
  - Cannot be empty (validation: reject if `content.trim() === ''`)

- `createdAt` (string, required): Creation timestamp
  - ISO 8601 format: `"2025-12-06T17:30:45.123Z"`
  - Generated on creation using `new Date().toISOString()`
  - Immutable after creation

- `updatedAt` (string, required): Last modification timestamp
  - ISO 8601 format: `"2025-12-06T17:30:45.123Z"`
  - Initially same as `createdAt`
  - Updated on any modification (future: edit command)
  - For MVP: same as `createdAt` (no edit functionality)

**TypeScript Definition**:
```typescript
interface Note {
  id: string          // UUID v4
  content: string     // Plain text, non-empty
  createdAt: string   // ISO 8601
  updatedAt: string   // ISO 8601
}
```

**Validation Rules**:
- `id` MUST be valid UUID v4 format
- `content` MUST NOT be empty string (after trim)
- `createdAt` MUST be valid ISO 8601 timestamp
- `updatedAt` MUST be valid ISO 8601 timestamp
- `updatedAt` MUST be >= `createdAt`

**State Transitions**:
```
[New] --add--> [Active] --delete--> [Removed]
```

No soft delete - notes are removed entirely from storage.

---

## Storage Schema

### File: `~/.note-cli/notes.json`

JSON object containing an array of Note entities.

**Structure**:
```json
{
  "notes": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "content": "First note example",
      "createdAt": "2025-12-06T17:30:45.123Z",
      "updatedAt": "2025-12-06T17:30:45.123Z"
    },
    {
      "id": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
      "content": "Second note with emoji 📝",
      "createdAt": "2025-12-06T18:15:22.456Z",
      "updatedAt": "2025-12-06T18:15:22.456Z"
    }
  ]
}
```

**TypeScript Definition**:
```typescript
interface NotesStorage {
  notes: Note[]
}
```

**Invariants**:
- All note IDs MUST be unique within the array
- Array order is insertion order (oldest first)
- File MUST be valid UTF-8 encoded JSON

**Empty State**:
```json
{
  "notes": []
}
```

---

## Relationships

No relationships - `Note` is a standalone entity with no foreign keys or references.

---

## Data Volume Estimates

**MVP Scale**:
- Target: 1000 notes
- Average note size: 100 bytes (content + metadata)
- Total file size: ~100 KB

**Performance Characteristics**:
- Read full file on every operation (acceptable for < 100 KB)
- Write full file on add/delete (atomic write pattern)
- Linear search for prefix matching (< 1ms for 1000 notes)

**Future Scaling Considerations** (out of scope for MVP):
- If file exceeds 1 MB: consider SQLite
- If > 10K notes: add indexing
- If multi-user: add file locking
