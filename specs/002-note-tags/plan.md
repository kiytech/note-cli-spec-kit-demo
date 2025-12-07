# Implementation Plan: Note Tags

**Feature Branch**: `002-note-tags`
**Base Spec**: `spec.md`
**Created**: 2025-12-06

---

## Technical Context

### Technology Stack (from existing codebase)
- **Language**: TypeScript 5.x with strict mode
- **Runtime**: Node.js 18+
- **Dependencies**: Zero npm packages (Constitution IV)
- **Storage**: Single JSON file at `~/.note-cli/notes.json`
- **Testing**: Node.js built-in test runner (`node:test`)

### Integration Points
- **Data Model**: Extend existing `Note` interface in `src/models/note.ts`
- **Storage Layer**: Leverage existing `file-store.ts` functions
- **CLI Parser**: Extend manual argument parsing in `src/index.ts`

### Key Design Decisions (from clarifications)
1. **Space handling**: Auto-replace with hyphens (`"my tag"` ’ `"my-tag"`)
2. **Case normalization**: Lowercase on save (`Work` ’ `work`)
3. **Duplicate handling**: Auto-deduplicate on save
4. **Empty strings**: Auto-filter out (consecutive/trailing commas)
5. **Max length**: 50 characters (validation error if exceeded)

---

## Constitution Check

### Principle I: Simplicity First 
**Status**: PASS
- Tags add clear organizational value without unnecessary complexity
- User interface remains intuitive: `--tags work,urgent`, `--tag work`
- Feature can be explained in < 1 minute

### Principle II: Single Data Source 
**Status**: PASS
- Tags stored as array in existing `notes.json` file
- No additional files or external services
- Backward compatible: existing notes without tags handled gracefully

### Principle III: TypeScript First 
**Status**: PASS
- All tag utilities will have explicit type signatures
- `tags: string[]` added to Note interface with full type safety
- Strict mode compliance maintained

### Principle IV: Minimal Dependencies 
**Status**: PASS
- No new npm dependencies required
- Tag parsing/normalization uses native JavaScript string methods
- Validation logic implemented with standard library

### Principle V: Test Coverage  
**Status**: DEFERRED
- Tests required for tag normalization logic
- Tests required for filtering functionality
- **Action**: Add to tasks.md as separate test tasks

---

## Phase 0: Research

### Research Decisions

#### Decision 1: Tag Normalization Implementation
**Decision**: Create dedicated utility module `src/utils/tag-utils.ts`

**Rationale**:
- Centralizes all tag processing logic
- Reusable across add/list commands
- Easier to test in isolation
- Maintains separation of concerns

**Alternatives considered**:
- Inline normalization in add command: Rejected (code duplication risk)
- Third-party library (e.g., slugify): Rejected (violates Constitution IV)

#### Decision 2: CLI Argument Parsing for Tags
**Decision**: Manual parsing with index-based extraction

**Rationale**:
- Consistent with existing approach (no CLI framework)
- `--tags` and `--tag` are distinct (plural vs singular)
- Simple: `args.indexOf('--tags')` + array slicing

**Alternatives considered**:
- Commander.js/Yargs: Rejected (adds dependency, violates Constitution IV)
- Positional arguments: Rejected (breaks backward compatibility)

#### Decision 3: Backward Compatibility Strategy
**Decision**: Add `tags ?? []` fallback in `readNotes()`

**Rationale**:
- Existing notes.json files may not have `tags` field
- Nullish coalescing provides clean default
- No manual migration step required
- Aligns with Constitution I (simplicity)

**Alternatives considered**:
- Manual migration script: Rejected (adds operational complexity)
- Throw error on missing tags: Rejected (breaks existing installations)

#### Decision 4: Tag Display Format
**Decision**: Space-separated with `#` prefix (e.g., `#work #urgent`)

**Rationale**:
- Familiar Twitter-style hashtag convention
- Visually distinct from note content
- Compact (doesn't clutter list output)

**Alternatives considered**:
- Comma-separated: Rejected (less visually distinct)
- Bracketed `[work, urgent]`: Rejected (too verbose)

#### Decision 5: Filtering Logic
**Decision**: Case-insensitive exact match (normalize filter input to lowercase)

**Rationale**:
- User inputs `--tag Work`, matches stored `work`
- Consistent with save-time normalization
- Simple implementation: `note.tags.includes(filterTag.toLowerCase())`

**Alternatives considered**:
- Substring matching: Rejected (too permissive, could cause confusion)
- Regex support: Rejected (over-engineering for MVP)

#### Decision 6: Error Handling for Tag Length
**Decision**: Fail-fast with descriptive error message

**Rationale**:
- Clear feedback: `Error: Tag "very-long-tag-name..." exceeds 50 character limit`
- Prevents data corruption
- User can correct immediately

**Alternatives considered**:
- Silently truncate: Rejected (unexpected behavior)
- Warning but allow: Rejected (inconsistent data quality)

---

## Phase 1: Data Model & Contracts

### Data Model

#### Modified Entity: Note

```typescript
export interface Note {
  id: string          // UUID v4 (unchanged)
  content: string     // Note content (unchanged)
  createdAt: string   // ISO 8601 timestamp (unchanged)
  updatedAt: string   // ISO 8601 timestamp (unchanged)
  tags: string[]      // NEW: Array of normalized lowercase tags
}
```

**Validation Rules**:
- `tags` field: Array of strings (empty array if no tags)
- Each tag: 1-50 characters after normalization
- Tag format: lowercase alphanumeric + hyphens only (post-normalization)

**State Transitions**:
- On create: Parse input ’ normalize ’ validate ’ save with tags
- On read: Apply `tags ?? []` fallback for backward compatibility
- On list with filter: Compare lowercase filter against stored tags

### Contracts

#### CLI Command Contracts

##### 1. Add Command with Tags

**Input**:
```bash
note add "Meeting notes" --tags "work, urgent"
```

**Processing**:
1. Extract content: `"Meeting notes"`
2. Extract tags input: `"work, urgent"`
3. Parse: `["work", " urgent"]`
4. Normalize: `["work", "urgent"]` (trim, lowercase, dedupe, filter empty)
5. Validate: Check each tag d 50 chars
6. Save: Create Note with `tags: ["work", "urgent"]`

**Output**:
```
Note created: 550e8400
```

**Error Cases**:
- Tag > 50 chars: `Error: Tag "very-long-tag..." exceeds 50 character limit`
- Empty content: `Error: Note content cannot be empty` (existing behavior)

##### 2. List Command with Tag Filter

**Input**:
```bash
note list --tag work
```

**Processing**:
1. Read all notes
2. Normalize filter: `"work".toLowerCase()` ’ `"work"`
3. Filter: `notes.filter(n => n.tags.includes("work"))`
4. Display: Format with tags visible

**Output**:
```
[550e8400] Meeting notes #work #urgent (2025-12-06 10:30 AM)
[7c9e6679] Review PR #work (2025-12-06 09:15 AM)
```

**Edge Cases**:
- No notes match filter: Display empty list (no error)
- Filter tag doesn't exist: Display empty list (no error)

##### 3. List Command (default)

**Input**:
```bash
note list
```

**Output** (with tags displayed):
```
[550e8400] Meeting notes #work #urgent (2025-12-06 10:30 AM)
[7c9e6679] Review PR #work (2025-12-06 09:15 AM)
[12345678] Buy groceries (2025-12-05 08:00 PM)
```

Notes without tags omit the hashtag section.

##### 4. JSON Output Mode

**Input**:
```bash
note list --json
```

**Output**:
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "content": "Meeting notes",
    "createdAt": "2025-12-06T10:30:00.000Z",
    "updatedAt": "2025-12-06T10:30:00.000Z",
    "tags": ["work", "urgent"]
  }
]
```

---

## Implementation Plan

### Files to Modify

| File | Changes | Complexity |
|------|---------|------------|
| `src/models/note.ts` | Add `tags: string[]` to Note interface | Low |
| `src/utils/tag-utils.ts` | **NEW FILE** - Tag parsing, normalization, validation | High |
| `src/storage/file-store.ts` | Add `tags ?? []` fallback in `readNotes()` | Low |
| `src/commands/add.ts` | Integrate tag parsing, validation, save | High |
| `src/commands/list.ts` | Add tag filtering, update display format | Medium |
| `src/index.ts` | Parse `--tags` / `--tag` args, update help | Medium |

### Implementation Order

1. **src/models/note.ts** - Data model foundation
2. **src/utils/tag-utils.ts** - Core tag logic (allows independent testing)
3. **src/storage/file-store.ts** - Backward compatibility
4. **src/commands/add.ts** - Tag creation
5. **src/commands/list.ts** - Tag filtering & display
6. **src/index.ts** - CLI integration

---

## Risks & Mitigations

### Risk 1: Existing notes.json corruption
**Mitigation**: File-store.ts already uses atomic writes (write to `.tmp`, then rename)

### Risk 2: Tag normalization edge cases
**Mitigation**: Comprehensive unit tests for tag-utils.ts (deferred to tasks phase)

### Risk 3: CLI argument parsing conflicts
**Mitigation**: `--tags` (plural, for add) vs `--tag` (singular, for filter) prevents ambiguity

---

## Success Criteria

Implementation is complete when:

1.  User can add tags: `note add "content" --tags "work, urgent"`
2.  User can filter by tag: `note list --tag work`
3.  Tags display in list output with `#` prefix
4.  Existing notes without tags load without errors
5.  Tag normalization follows all 5 clarification rules
6.  JSON output includes `tags` array
7.  Help message documents tag usage
8.  All TypeScript strict mode checks pass
9.  No new npm dependencies added

---

## Next Steps

Run `/speckit.tasks` to break this plan into atomic implementation tasks.
