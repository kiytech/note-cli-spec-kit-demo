# Research: Note CRUD Technical Decisions

**Feature**: 001-note-crud
**Date**: 2025-12-06

## Decision Summary

All technical decisions documented here are informed by the constitution's principles, particularly "Simplicity First" and "Minimal Dependencies".

---

## Decision 1: UUID Generation

**Question**: How to generate unique IDs for notes without external dependencies?

**Decision**: Use Node.js `crypto.randomUUID()` (available in Node.js 14.17.0+)

**Rationale**:
- Native to Node.js standard library (no npm package needed)
- RFC 4122 compliant UUID v4 generation
- Cryptographically secure randomness
- Zero performance overhead for our scale (< 1000 notes)

**Alternatives considered**:
- ❌ `uuid` npm package - Violates "Minimal Dependencies" principle
- ❌ Timestamp-based IDs - Not collision-resistant
- ❌ Sequential integers - Breaks when notes are deleted

**References**:
- Node.js crypto documentation: https://nodejs.org/api/crypto.html#cryptorandomuuidoptions

---

## Decision 2: CLI Argument Parsing

**Question**: How to parse command-line arguments without a library?

**Decision**: Use `process.argv` with manual parsing

**Rationale**:
- For 3 simple commands, a library is overkill
- `process.argv` provides array of arguments directly
- Custom parsing: ~30 lines of code vs. adding dependency
- Pattern: `note <command> [args...] [--flags]`

**Alternatives considered**:
- ❌ `commander` npm package - Too heavy for simple CLI
- ❌ `yargs` npm package - Even heavier
- ✅ Manual parsing - Aligns with simplicity principle

**Implementation approach**:
```typescript
const [,, command, ...args] = process.argv
```

---

## Decision 3: Testing Framework

**Question**: Which testing framework to use?

**Decision**: Node.js built-in test runner (`node:test` + `node:assert`)

**Rationale**:
- Available since Node.js 18.0.0 (matches our target platform)
- Zero dependencies (no jest, mocha, etc.)
- Sufficient for unit and integration tests
- Aligns with "Minimal Dependencies" principle

**Alternatives considered**:
- ❌ Jest - Popular but heavy, requires configuration
- ❌ Mocha + Chai - Two dependencies vs. zero
- ✅ `node:test` - Native, simple, sufficient

**References**:
- Node.js test runner: https://nodejs.org/api/test.html

---

## Decision 4: Timestamp Format

**Question**: How to format timestamps for display and storage?

**Decision**:
- **Storage**: ISO 8601 string (`new Date().toISOString()`)
- **Display**: Custom format `YYYY-MM-DD HH:mm` (local timezone)

**Rationale**:
- ISO 8601 is standard, sortable, timezone-aware
- Display format is human-readable (per spec clarification Q2)
- No date library needed - use native `Date` object
- Conversion logic: ~10 lines of code

**Alternatives considered**:
- ❌ Unix timestamp - Not human-readable in JSON
- ❌ `date-fns` library - Violates dependency principle
- ✅ Native Date with custom formatter - Simple, sufficient

**Implementation**:
```typescript
function formatTimestamp(iso: string): string {
  const date = new Date(iso)
  return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}
```

---

## Decision 5: JSON File Handling

**Question**: How to safely read/write JSON without corruption?

**Decision**: Atomic write pattern with temporary file + rename

**Rationale**:
- Prevents corruption if process crashes mid-write
- Pattern: write to `.notes.json.tmp` → rename to `notes.json`
- `fs.renameSync()` is atomic on POSIX systems
- Worth ~15 lines of code for data integrity

**Alternatives considered**:
- ❌ Direct write - Risk of corruption
- ❌ File locking - Complex, not cross-platform
- ✅ Atomic write - Simple, reliable pattern

**Implementation**:
```typescript
fs.writeFileSync(tmpPath, json)
fs.renameSync(tmpPath, realPath)
```

---

## Decision 6: Prefix Matching for IDs

**Question**: How to implement short prefix matching (e.g., `delete 550e`)?

**Decision**: Linear search with `startsWith()` + uniqueness check

**Rationale**:
- For < 1000 notes, O(n) search is acceptable (< 1ms)
- No indexing needed
- Validate exactly one match before proceeding

**Alternatives considered**:
- ❌ Prefix tree (trie) - Over-engineered for this scale
- ✅ Linear search - Simple, sufficient

**Implementation**:
```typescript
const matches = notes.filter(n => n.id.startsWith(prefix))
if (matches.length === 0) throw new Error('No matching note')
if (matches.length > 1) throw new Error('Ambiguous prefix')
return matches[0]
```

---

## Phase 0 Completion

All "NEEDS CLARIFICATION" items from Technical Context have been resolved. Ready to proceed to Phase 1 (data model and contracts).
