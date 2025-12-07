# note-cli

Simple CLI tool for managing notes with tags.

## Installation

```bash
npm install
npm run build
npm link
```

## Usage

### Add a note

```bash
# Without tags
note add "Buy groceries"

# With tags
note add "Team meeting notes" --tags "work, urgent"
note add "Code review feedback" --tags "work, code-review"
```

### List notes

```bash
# List all notes
note list

# List notes with a specific tag
note list --tag work

# JSON output
note list --json
```

### Delete a note

```bash
# Delete by ID prefix (minimum 4 characters)
note delete 550e
```

### Help

```bash
note --help
```

## Tag Features

### Tag Normalization

Tags are automatically normalized when added:
- **Lowercase**: `Work` → `work`
- **Trim whitespace**: `"  urgent  "` → `urgent`
- **Replace spaces with hyphens**: `"code review"` → `code-review`
- **Remove duplicates**: `work,work,urgent` → `["work", "urgent"]`
- **Filter empty strings**: `work,,urgent` → `["work", "urgent"]`

### Tag Display

Tags are displayed with hashtag format in list output:

```
[550e8400] Team meeting notes #work #urgent (2025-12-06 10:30)
```

### Tag Validation

- Maximum tag length: 50 characters
- Tags exceeding this limit will cause an error

### Backward Compatibility

Notes created before the tag feature will display without tags. The tags field is optional.

## Examples

```bash
# Create tagged notes
note add "Review PR #123" --tags "work, code-review"
note add "Dentist appointment" --tags "personal, urgent"
note add "Buy milk"

# List all notes
note list
# Output:
# [a1b2c3d4] Review PR #123 #work #code-review (2025-12-06 10:00)
# [e5f6g7h8] Dentist appointment #personal #urgent (2025-12-06 11:30)
# [i9j0k1l2] Buy milk (2025-12-06 12:00)

# Filter by tag
note list --tag work
# Output:
# [a1b2c3d4] Review PR #123 #work #code-review (2025-12-06 10:00)

# JSON output for programmatic use
note list --json
```

## Data Storage

Notes are stored in `~/.note-cli/notes.json` as a single JSON file.

## Development

```bash
# Build
npm run build

# Test
npm test
```

## Constitution Principles

This project follows these core principles:
1. **Simplicity First**: Keep it simple and focused
2. **Single Data Source**: One JSON file for all notes
3. **TypeScript First**: Strict type checking
4. **Minimal Dependencies**: Zero runtime dependencies
5. **Test Coverage**: Critical paths must be tested

## License

MIT
