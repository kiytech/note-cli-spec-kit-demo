# Feature Specification: Note Tags

**Feature Branch**: `002-note-tags`
**Created**: 2025-12-06
**Status**: Draft
**Input**: User description: "��k����Wfգ���gM��FkY�"
**Base Feature**: 001-note-crud (existing note CRUD functionality)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Add Tags to Notes (Priority: P1)

As a user, I want to add one or more tags to a note when creating it, so I can categorize my notes.

**Why this priority**: Tagging is the foundation of organization. Without the ability to add tags, the feature has no value.

**Independent Test**: Run `note add "content" --tags work,urgent` � verify note has tags in storage

**Acceptance Scenarios**:

1. **Given** I'm creating a new note, **When** I provide `--tags work,urgent`, **Then** the note is saved with tags `["work", "urgent"]`
2. **Given** I'm creating a note, **When** I don't provide `--tags` flag, **Then** the note is saved with empty tags array `[]`
3. **Given** I provide tags with whitespace, **When** I run `note add "content" --tags "  work , urgent  "`, **Then** tags are trimmed to `["work", "urgent"]`

---

### User Story 2 - List Notes by Tag (Priority: P1)

As a user, I want to filter notes by tag so I can find relevant notes quickly.

**Why this priority**: Filtering is equally critical as tagging - tags are useless if you can't filter by them.

**Independent Test**: Add notes with different tags � run `note list --tag work` � verify only work-tagged notes appear

**Acceptance Scenarios**:

1. **Given** notes with tags `work`, `personal`, and `urgent`, **When** I run `note list --tag work`, **Then** only notes tagged with "work" are displayed
2. **Given** multiple tags on a note, **When** I filter by any one of those tags, **Then** the note appears in results
3. **Given** I want all notes, **When** I run `note list` without `--tag` flag, **Then** all notes are displayed (existing behavior preserved)

---

### User Story 3 - Display Tags in List Output (Priority: P2)

As a user, I want to see tags when listing notes so I can quickly identify note categories.

**Why this priority**: Useful for context but not strictly necessary for MVP. Users can use `--json` to see tags if needed.

**Independent Test**: Add note with tags � run `note list` � verify tags appear in output

**Acceptance Scenarios**:

1. **Given** a note has tags `["work", "urgent"]`, **When** I list notes, **Then** output shows `[id] content #work #urgent (timestamp)`
2. **Given** a note has no tags, **When** I list notes, **Then** output shows `[id] content (timestamp)` (no tag section)
3. **Given** JSON output mode, **When** I run `note list --json`, **Then** tags array is included in JSON

---

### Edge Cases

- What happens if user provides duplicate tags?
  - **Decision**: System automatically deduplicates on save: `work,work,urgent` → `["work", "urgent"]`

- What happens with empty tag strings (consecutive commas, trailing commas)?
  - **Decision**: System automatically filters out empty strings: `work,,urgent,` → `["work", "urgent"]`

- What is the maximum tag length?
  - **Decision**: 50 characters maximum; tags exceeding this limit are rejected with error message

- What happens to existing notes created before tags feature?
  - Treat missing `tags` field as empty array `[]` (backward compatible)

- How are tags normalized?
  - **Lowercase on save**: `Work` → stored as `work` (case-insensitive from input)
  - **Trimmed**: `"  work  "` → `work`
  - **No special characters validation** for MVP (allow any string)

- Can tag names contain spaces?
  - No - tags are comma-separated, spaces would break parsing
  - **Decision**: Auto-replace spaces with hyphens: `"my tag"` → `"my-tag"`

## Clarifications

### Session 2025-12-06

- Q: タグ名にスペースが含まれる場合の挙動 → A: スペースを自動的にハイフンに変換する
- Q: 大文字・小文字の正規化タイミング → A: タグ保存時に小文字に正規化し、小文字のみ保存する
- Q: 重複タグの処理方法 → A: 保存時に重複を自動除去する
- Q: 空のタグ文字列の処理 → A: 空文字列を自動的に除外する（連続カンマや末尾カンマを無視）
- Q: タグの最大文字数制限 → A: 50文字まで

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST extend Note data model with `tags` field (array of strings)
- **FR-002**: `note add` command MUST accept optional `--tags` flag with comma-separated tag list
- **FR-003**: System MUST normalize tags: lowercase, trim whitespace, remove empty strings, deduplicate
- **FR-003a**: System MUST reject tags longer than 50 characters with error message
- **FR-004**: System MUST transform tags containing spaces by replacing spaces with hyphens
- **FR-005**: `note list` command MUST accept optional `--tag <name>` flag to filter by tag
- **FR-006**: Tag filtering MUST normalize filter input to lowercase before matching (since tags are stored lowercase)
- **FR-007**: Notes with multiple tags MUST appear when filtering by any one of those tags
- **FR-008**: `note list` output MUST display tags in format `#tag1 #tag2` after content
- **FR-009**: System MUST handle backward compatibility: notes without `tags` field treated as `[]`
- **FR-010**: JSON output MUST include `tags` array for each note

### Key Entities

- **Note** (modified): Extends existing Note interface
  - `id` (string): Unchanged from base feature
  - `content` (string): Unchanged
  - `createdAt` (string): Unchanged
  - `updatedAt` (string): Unchanged
  - `tags` (string[]): **NEW** - Array of lowercase, trimmed tag names

- **Storage**: JSON file format extended
  - Location: `~/.note-cli/notes.json` (unchanged)
  - Format: Same structure, Note objects now have optional `tags` field

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can add tags and filter by them within 10 seconds of learning the syntax
- **SC-002**: Tag filtering on 1000 notes completes in < 1 second (linear search acceptable)
- **SC-003**: Backward compatibility: existing `notes.json` files work without manual migration
- **SC-004**: Tag normalization eliminates 100% of case/whitespace variance issues
- **SC-005**: Users can understand tag syntax without documentation (self-explanatory `--tags` and `--tag` flags)

## Assumptions

- Tags are metadata only - no tag management commands (list all tags, rename tag, etc.) in MVP
- Tags are not nested or hierarchical - flat list only
- No limit on number of tags per note
- No autocomplete or tag suggestions (future enhancement)
- Existing notes without tags field are automatically migrated on first read (no manual migration step)
