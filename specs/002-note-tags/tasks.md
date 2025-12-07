# Implementation Tasks: Note Tags

**Feature Branch**: `002-note-tags`
**Base Documents**: `spec.md`, `plan.md`
**Created**: 2025-12-06

---

## Task Summary

- **Total Tasks**: 18
- **User Story 1 (P1)**: 6 tasks
- **User Story 2 (P1)**: 4 tasks
- **User Story 3 (P2)**: 2 tasks
- **Setup & Polish**: 6 tasks
- **MVP Scope**: User Story 1 + User Story 2 (10 tasks)
- **Parallel Opportunities**: 8 tasks marked [P]

---

## Dependencies

```
Phase 1 (Setup) → Phase 2 (Foundational) → Phase 3+ (User Stories in any order)

User Story 1 (Add Tags) ──┐
                           ├─→ User Story 3 (Display Tags)
User Story 2 (Filter) ─────┘

Note: US1 and US2 are independent and can be implemented in parallel
US3 depends on US1 for tag data and US2 for filtering context
```

---

## Phase 1: Setup

**Goal**: Prepare data model and utilities

- [ ] T001 [P] Add `tags: string[]` field to Note interface in src/models/note.ts
- [ ] T002 [P] Create src/utils/tag-utils.ts with type definitions and exports
- [ ] T003 [P] Add backward compatibility in src/storage/file-store.ts readNotes() function

**Completion Criteria**:
- TypeScript compiles without errors
- Note interface includes tags field
- tag-utils.ts exports all required functions

---

## Phase 2: Foundational - Tag Utilities

**Goal**: Implement core tag normalization and validation logic

- [ ] T004 Implement parseTags() function in src/utils/tag-utils.ts
- [ ] T005 Implement normalizeTags() function in src/utils/tag-utils.ts
- [ ] T006 Implement validateTagLength() function in src/utils/tag-utils.ts

**Completion Criteria**:
- parseTags() splits comma-separated input correctly
- normalizeTags() applies all 5 clarification rules (lowercase, trim, dedupe, filter empty, space→hyphen)
- validateTagLength() rejects tags > 50 chars

**Independent Test**:
```typescript
// Manual verification (or unit test if desired)
import { parseTags, normalizeTags, validateTagLength } from './utils/tag-utils'

const input = "Work, urgent,  Personal, work "
const parsed = parseTags(input)  // ["Work", "urgent", "Personal", "work"]
const normalized = normalizeTags(parsed)  // ["work", "urgent", "personal"]
console.log(normalized)  // Expect: ["work", "urgent", "personal"]

validateTagLength("a".repeat(51))  // Should throw error
```

---

## Phase 3: User Story 1 - Add Tags to Notes (P1)

**Story Goal**: Users can add tags when creating notes

**Priority**: P1 (Foundation - without this, tags have no value)

**Acceptance Criteria** (from spec.md):
1. `note add "content" --tags work,urgent` saves note with tags `["work", "urgent"]`
2. `note add "content"` without --tags saves note with empty tags array `[]`
3. Tags with whitespace are trimmed: `--tags "  work , urgent  "` → `["work", "urgent"]`

**Tasks**:

- [ ] T007 [US1] Update addCommand() signature in src/commands/add.ts to accept optional tagsInput parameter
- [ ] T008 [US1] Add tag parsing logic in src/commands/add.ts using tag-utils functions
- [ ] T009 [US1] Add tag validation in src/commands/add.ts with descriptive error messages
- [ ] T010 [US1] Update Note object creation in src/commands/add.ts to include normalized tags
- [ ] T011 [US1] Update CLI argument parser in src/index.ts to extract --tags option
- [ ] T012 [US1] Update help message in src/index.ts to document --tags usage

**Independent Test**:
```bash
# Test 1: Add note with tags
note add "Team meeting notes" --tags "work, urgent"
# Verify: Check ~/.note-cli/notes.json contains tags: ["work", "urgent"]

# Test 2: Add note without tags
note add "Personal reminder"
# Verify: Check ~/.note-cli/notes.json contains tags: []

# Test 3: Tag normalization
note add "Review PR" --tags "Work, CODE-REVIEW, work"
# Verify: tags: ["work", "code-review"] (lowercase, deduped)

# Test 4: Tag too long
note add "Test" --tags "$(python -c 'print("a"*51)')"
# Expect: Error message about 50 character limit
```

---

## Phase 4: User Story 2 - List Notes by Tag (P1)

**Story Goal**: Users can filter notes by tag

**Priority**: P1 (Filtering is critical - tags are useless without it)

**Acceptance Criteria** (from spec.md):
1. `note list --tag work` shows only notes tagged with "work"
2. Notes with multiple tags appear when filtering by any one tag
3. `note list` without --tag shows all notes (existing behavior preserved)

**Tasks**:

- [ ] T013 [P] [US2] Update listCommand() in src/commands/list.ts to parse --tag argument
- [ ] T014 [P] [US2] Implement tag filtering logic in src/commands/list.ts using case-insensitive matching
- [ ] T015 [P] [US2] Update CLI argument parser in src/index.ts to pass --tag to listCommand
- [ ] T016 [P] [US2] Update help message in src/index.ts to document --tag usage

**Independent Test**:
```bash
# Setup: Add notes with different tags
note add "Meeting" --tags "work,urgent"
note add "Review PR" --tags "work,code"
note add "Buy groceries" --tags "personal"

# Test 1: Filter by tag
note list --tag work
# Expect: Shows "Meeting" and "Review PR" only

# Test 2: Case-insensitive filter
note list --tag WORK
# Expect: Shows same results as lowercase "work"

# Test 3: List all (no filter)
note list
# Expect: Shows all 3 notes

# Test 4: Non-existent tag
note list --tag nonexistent
# Expect: Empty list (no error)
```

---

## Phase 5: User Story 3 - Display Tags in List Output (P2)

**Story Goal**: Users see tags when listing notes

**Priority**: P2 (Useful but not critical - users can use --json to see tags)

**Acceptance Criteria** (from spec.md):
1. Notes with tags show `#work #urgent` format after content
2. Notes without tags show no tag section
3. JSON output includes `tags` array

**Tasks**:

- [ ] T017 [US3] Update formatNoteOneLine() in src/commands/list.ts to append hashtag-formatted tags
- [ ] T018 [US3] Verify JSON output mode in src/commands/list.ts includes tags field

**Independent Test**:
```bash
# Setup: Add notes with and without tags
note add "Meeting" --tags "work,urgent"
note add "Reminder"

# Test 1: Human-readable output with tags
note list
# Expect output format:
# [550e8400] Meeting #work #urgent (2025-12-06 10:30 AM)
# [7c9e6679] Reminder (2025-12-06 09:15 AM)

# Test 2: JSON output
note list --json
# Expect: JSON array with tags field for each note
```

---

## Phase 6: Polish & Verification

**Goal**: Ensure quality and completeness

- [ ] T019 Run TypeScript compiler and fix any strict mode errors
- [ ] T020 Test backward compatibility: Load existing notes.json without tags field
- [ ] T021 Update main README or documentation with tag feature examples

**Completion Criteria**:
- `npm run build` succeeds with no errors
- Existing notes.json files load without errors
- All manual tests pass

---

## Parallel Execution Opportunities

### Phase 1 (All parallel):
```bash
# All 3 setup tasks can be done simultaneously
T001: models/note.ts
T002: utils/tag-utils.ts (structure only)
T003: storage/file-store.ts
```

### Phase 2 (Sequential within utils):
```bash
# Must complete in order (each builds on previous)
T004 → T005 → T006
```

### Phase 3 (US1 - Some parallel):
```bash
# Group 1 (parallel):
T007, T008, T009, T010: All in commands/add.ts

# Group 2 (after Group 1):
T011, T012: Both in index.ts
```

### Phase 4 (US2 - All parallel):
```bash
# All 4 tasks touch different concerns
T013, T014: list.ts
T015, T016: index.ts
```

### Phase 5 (US3 - Sequential):
```bash
T017 → T018 (verify after implementation)
```

---

## Implementation Strategy

### MVP Scope (Recommended First Iteration)
**Target**: User Story 1 + User Story 2 (Tasks T001-T016)

This delivers core value:
- ✅ Users can tag notes
- ✅ Users can filter by tags
- ⚠️ Tags not visible in list output yet (use --json temporarily)

**Time estimate**: 10 tasks, ~2-3 hours for experienced developer

### Full Feature (Second Iteration)
**Target**: Add User Story 3 (Tasks T017-T021)

This adds polish:
- ✅ Tags visible in human-readable output
- ✅ Documentation updated

**Time estimate**: 5 tasks, ~30 minutes

---

## Notes

- **No tests generated**: Spec did not explicitly request TDD approach. Manual testing criteria provided for each user story.
- **Backward compatibility**: T003 and T020 ensure existing notes.json files work without migration.
- **Constitution compliance**: All tasks maintain zero-dependency approach and TypeScript strict mode.
- **File modification count**: 6 files total (5 modified + 1 new)

---

## Next Steps

1. Review this task breakdown
2. Start with MVP scope (T001-T016)
3. Use independent test criteria to verify each user story
4. Proceed to full feature (T017-T021) after MVP validation
