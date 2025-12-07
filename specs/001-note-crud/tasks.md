# Implementation Tasks: Note CRUD Operations

**Feature**: 001-note-crud
**Branch**: `001-note-crud`
**Date**: 2025-12-06

---

## Implementation Strategy

This feature follows **incremental delivery** based on user story priorities:

- **MVP**: User Story 1 (Add Note) + User Story 2 (List Notes) → Minimal viable product
- **Enhancement**: User Story 3 (Delete Note) → Can be added later
- Each user story is independently testable

---

## Phase 1: Setup

Initialize project structure and configuration.

- [ ] T001 Initialize npm project with TypeScript in `note-cli/` directory
- [ ] T002 Create `tsconfig.json` with `strict: true` and target ES2020
- [ ] T003 Create project structure: `src/`, `tests/unit/`, `tests/integration/`
- [ ] T004 Create `package.json` with `bin` field pointing to compiled CLI
- [ ] T005 Add `.gitignore` for `node_modules/`, `dist/`, `.note-cli/`

**Deliverable**: Buildable TypeScript project skeleton

---

## Phase 2: Foundational (Blocking Prerequisites)

Core infrastructure needed by all user stories.

- [ ] T006 Define `Note` interface in `src/models/note.ts` with id, content, createdAt, updatedAt fields
- [ ] T007 Define `NotesStorage` interface in `src/models/note.ts` with notes array
- [ ] T008 Implement file storage module in `src/storage/file-store.ts`:
  - [ ] T008a Function: `getStoragePath()` returns `~/.note-cli/notes.json`
  - [ ] T008b Function: `ensureStorageExists()` creates directory and empty file if needed
  - [ ] T008c Function: `readNotes()` reads and parses JSON, returns `Note[]`
  - [ ] T008d Function: `writeNotes()` atomic write with temp file + rename pattern
- [ ] T009 Implement CLI entry point in `src/index.ts`:
  - [ ] T009a Parse `process.argv` to extract command and arguments
  - [ ] T009b Route to command handlers based on first argument
  - [ ] T009c Handle unknown commands with error message and exit code 1

**Deliverable**: Storage layer + CLI routing ready

---

## Phase 3: User Story 1 - Add New Note (P1)

**Goal**: Users can capture thoughts by running `note add "content"`

**Independent Test**: Run `note add "test"` → verify note appears in `notes.json` with UUID, timestamps

**Success Criteria from Spec**:
- SC-001: Add and list within 5 seconds
- SC-003: 100% persistence (no data loss)

### Tasks

- [ ] T010 [US1] Implement `generateId()` helper in `src/storage/file-store.ts` using `crypto.randomUUID()`
- [ ] T011 [US1] Implement `generateTimestamp()` helper returning `new Date().toISOString()`
- [ ] T012 [US1] Implement add command in `src/commands/add.ts`:
  - [ ] T012a Validate content is not empty (reject with error if `content.trim() === ''`)
  - [ ] T012b Create Note object with generated ID and timestamps
  - [ ] T012c Read existing notes from storage
  - [ ] T012d Append new note to array
  - [ ] T012e Write updated notes to storage
  - [ ] T012f Print confirmation: `Note created: {short-id}`
- [ ] T013 [US1] Wire add command into `src/index.ts` router
- [ ] T014 [US1] Manual test: `npm run build && node dist/index.js add "Test note"`

**Deliverable**: Working `note add` command with persistence

---

## Phase 4: User Story 2 - List All Notes (P1)

**Goal**: Users can review all notes by running `note list`

**Independent Test**: Add multiple notes → run `note list` → verify all displayed with IDs and timestamps

**Success Criteria from Spec**:
- SC-002: Handle 1000 notes, list < 1 second
- SC-005: Self-explanatory interface
- SC-006: Valid JSON output

### Tasks

- [ ] T015 [US2] Implement `formatTimestamp()` in `src/commands/list.ts`:
  - [ ] T015a Parse ISO 8601 string to Date object
  - [ ] T015b Format as `YYYY-MM-DD HH:mm` (local timezone)
- [ ] T016 [US2] Implement `formatNoteOneLine()` helper: `[short-id] content (timestamp)`
- [ ] T017 [US2] Implement list command in `src/commands/list.ts`:
  - [ ] T017a Read notes from storage
  - [ ] T017b Check for `--json` flag in arguments
  - [ ] T017c If `--json`: Output `JSON.stringify({notes}, null, 2)`
  - [ ] T017d Otherwise: Format each note with `formatNoteOneLine()` and print
  - [ ] T017e Handle empty notes array: print "No notes found"
- [ ] T018 [US2] Wire list command into `src/index.ts` router
- [ ] T019 [US2] Manual test: `note add "First" && note add "Second" && note list`
- [ ] T020 [US2] Manual test: `note list --json | jq` (verify valid JSON)

**Deliverable**: Working `note list` command with human and JSON output

---

## Phase 5: User Story 3 - Delete Note (P2)

**Goal**: Users can remove notes by ID prefix

**Independent Test**: Add note → copy short ID → `note delete <id>` → verify removed from list

**Success Criteria from Spec**:
- SC-004: Helpful error messages for invalid IDs

### Tasks

- [ ] T021 [US3] Implement `findNoteByPrefix()` in `src/storage/file-store.ts`:
  - [ ] T021a Filter notes where `id.startsWith(prefix)`
  - [ ] T021b If 0 matches: throw Error "No note found with ID prefix: {prefix}"
  - [ ] T021c If > 1 matches: throw Error with list of ambiguous matches
  - [ ] T021d Return single matched note
- [ ] T022 [US3] Implement delete command in `src/commands/delete.ts`:
  - [ ] T022a Extract ID prefix from arguments (error if missing)
  - [ ] T022b Read notes from storage
  - [ ] T022c Find note using `findNoteByPrefix()`
  - [ ] T022d Filter out matched note from array
  - [ ] T022e Write updated array to storage
  - [ ] T022f Print confirmation: `Note deleted: {short-id}`
- [ ] T023 [US3] Wire delete command into `src/index.ts` router
- [ ] T024 [US3] Manual test: Prefix matching with 4 characters
- [ ] T025 [US3] Manual test: Error on non-existent ID
- [ ] T026 [US3] Manual test: Error on ambiguous prefix

**Deliverable**: Working `note delete` command with prefix matching

---

## Phase 6: Polish & Cross-Cutting Concerns

Final touches for production readiness.

- [ ] T027 Add error handling wrapper in `src/index.ts`:
  - [ ] T027a Catch all errors from commands
  - [ ] T027b Print error message to stderr
  - [ ] T027c Exit with code 1 on any error
- [ ] T028 Add `--help` flag handling in `src/index.ts`:
  - [ ] T028a Detect `--help` or `help` argument
  - [ ] T028b Print usage: `Usage: note <add|list|delete> [args]`
  - [ ] T028c Print examples for each command
- [ ] T029 Create `README.md` with installation and usage instructions
- [ ] T030 Add shebang `#!/usr/bin/env node` to compiled output
- [ ] T031 Test global installation: `npm install -g .` and run `note` from any directory
- [ ] T032 Constitution compliance check:
  - [ ] T032a Verify zero external dependencies (`package.json` dependencies empty)
  - [ ] T032b Verify TypeScript strict mode enabled
  - [ ] T032c Verify single data source (only `notes.json`)

**Deliverable**: Production-ready CLI tool

---

## Dependencies

### User Story Completion Order

```
Setup (Phase 1)
  ↓
Foundational (Phase 2)
  ↓
├── [US1] Add Note (Phase 3) ─┐
├── [US2] List Notes (Phase 4) ┤→ Can be implemented in parallel
└── [US3] Delete Note (Phase 5) ┘  (but US1+US2 form MVP)
  ↓
Polish (Phase 6)
```

**Critical Path**: Setup → Foundational → US1 → US2 → Polish (MVP)
**Optional**: US3 can be added anytime after Foundational

### File Dependencies

- All command files (`add.ts`, `list.ts`, `delete.ts`) depend on `file-store.ts`
- All files depend on `models/note.ts` for type definitions
- `index.ts` depends on all command files

---

## Parallel Execution Opportunities

**Within User Story 1**:
- T010, T011, T012a can be written in parallel (independent functions)

**Across User Stories** (after Foundational complete):
- US1 (add.ts), US2 (list.ts), US3 (delete.ts) can be implemented in parallel by different developers
- Each story is independently testable

**During Polish**:
- T027, T028, T029 can be completed in parallel

---

## Task Summary

- **Total Tasks**: 32
- **Setup Phase**: 5 tasks
- **Foundational Phase**: 4 tasks (9 subtasks)
- **User Story 1 (P1)**: 5 tasks (6 subtasks)
- **User Story 2 (P1)**: 6 tasks (5 subtasks)
- **User Story 3 (P2)**: 6 tasks (6 subtasks)
- **Polish Phase**: 6 tasks (6 subtasks)
- **Parallelizable Tasks**: 15 (marked with [P] in detailed breakdown)

**MVP Scope**: Phase 1-4 (Setup + Foundational + US1 + US2) = 20 tasks
**Full Feature**: All 32 tasks

---

## Format Validation

✅ All tasks follow checklist format: `- [ ] [TaskID] [Labels] Description with file path`
✅ User story tasks labeled with [US1], [US2], [US3]
✅ Each phase has clear deliverable and test criteria
✅ File paths specified for all implementation tasks
