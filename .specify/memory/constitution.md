<!--
Sync Impact Report:
- Version change: template → 1.0.0
- Initial constitution for note-cli project
- Principles: Simplicity, Single Data Source, TypeScript First, Minimal Dependencies
- Templates: All templates pending alignment
-->

# note-cli Constitution

## Core Principles

### I. Simplicity First
The application must remain simple and focused on core functionality. Every feature must justify its existence. Avoid feature creep. The user should understand the entire application in under 5 minutes.

**Rationale**: CLI tools succeed when they do one thing well. Complexity reduces maintainability and increases cognitive load.

### II. Single Data Source
All notes MUST be stored in a single JSON file (`notes.json`). No external databases, no cloud services, no distributed storage.

**Rationale**: Simplifies deployment, backup, and portability. Users can inspect and migrate their data easily.

### III. TypeScript First
The codebase MUST be written in TypeScript with strict type checking enabled. All functions must have explicit type signatures.

**Rationale**: Type safety prevents runtime errors and improves maintainability. TypeScript provides excellent tooling support.

### IV. Minimal Dependencies
External dependencies MUST be minimized. Prefer Node.js standard library over third-party packages. Each new dependency must be justified.

**Rationale**: Reduces security surface area, installation time, and potential breaking changes from upstream packages.

### V. Test Coverage
Critical paths (CRUD operations, data persistence) MUST have unit tests. Integration tests MUST verify end-to-end CLI workflows.

**Rationale**: Tests ensure correctness and prevent regressions during refactoring.

## Technical Constraints

### Runtime Environment
- **Platform**: Node.js 18 or later
- **Language**: TypeScript 5.x
- **Package Manager**: npm (standard)

### Data Format
- **Storage**: Single JSON file at `~/.note-cli/notes.json`
- **Schema**: Array of note objects with `id`, `content`, `createdAt`, `updatedAt` fields
- **Encoding**: UTF-8

### CLI Interface
- **Commands**: `add`, `list`, `delete`
- **Output**: Human-readable by default, JSON with `--json` flag
- **Error Handling**: Clear error messages, non-zero exit codes on failure

### Code Organization
- **Utility Functions**: Reusable functions (date formatting, string manipulation, etc.) MUST be extracted to `src/utils/` directory
- **Command-Specific Logic**: Command-specific formatting or business logic stays in respective command files
- **Single Responsibility**: Each module should have a clear, single purpose

## Development Workflow

### Code Quality
- All code MUST pass TypeScript compiler with `strict: true`
- All code MUST pass ESLint with recommended rules
- All tests MUST pass before commit

### Version Control
- Feature branches for new functionality
- Descriptive commit messages following conventional commits
- No direct commits to main branch

## Governance

This constitution defines the foundational principles for note-cli development. All implementation decisions MUST align with these principles.

**Amendment Process**:
1. Propose amendment with rationale
2. Verify no conflicts with existing principles
3. Update version according to semantic versioning
4. Propagate changes to dependent templates

**Compliance**:
- All PRs MUST verify principle compliance
- Deviations MUST be explicitly justified and documented
- Complexity MUST be balanced against simplicity principle

**Version**: 1.0.0 | **Ratified**: 2025-12-06 | **Last Amended**: 2025-12-06
