# Quick Start: note-cli

**Version**: 0.1.0
**Last Updated**: 2025-12-06

## Installation

```bash
# From the project directory
npm install -g .
```

## Usage

### Add a Note

```bash
note add "Buy groceries"
# Output: Note created: 550e8400

note add "Meeting at 3pm 📅"
# Output: Note created: 6ba7b810
```

**What happens**:
- Note is assigned a unique ID (UUID)
- Content is saved to `~/.note-cli/notes.json`
- Timestamp is recorded

**Error cases**:
```bash
note add ""
# Error: Note content cannot be empty

note add
# Error: Missing note content. Usage: note add "content"
```

---

### List All Notes

```bash
note list
```

**Output example**:
```
[550e8400] Buy groceries (2025-12-06 17:30)
[6ba7b810] Meeting at 3pm 📅 (2025-12-06 18:15)
```

**With no notes**:
```bash
note list
# Output: No notes found
```

**JSON output** (for scripting):
```bash
note list --json
```

**Output**:
```json
{
  "notes": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "content": "Buy groceries",
      "createdAt": "2025-12-06T17:30:45.123Z",
      "updatedAt": "2025-12-06T17:30:45.123Z"
    }
  ]
}
```

---

### Delete a Note

**Full ID**:
```bash
note delete 550e8400-e29b-41d4-a716-446655440000
# Output: Note deleted: 550e8400
```

**Short prefix** (minimum unique characters):
```bash
note delete 550e
# Output: Note deleted: 550e8400
```

**Error cases**:
```bash
note delete 999
# Error: No note found with ID prefix: 999

note delete 5
# Error: Ambiguous ID prefix '5' matches multiple notes:
#   - 550e8400: Buy groceries
#   - 5abc1234: Another note
# Please provide more characters
```

---

## File Location

Notes are stored in:
```
~/.note-cli/notes.json
```

**Manual inspection**:
```bash
cat ~/.note-cli/notes.json | jq
```

**Backup**:
```bash
cp ~/.note-cli/notes.json ~/.note-cli/notes.backup.json
```

**Reset** (delete all notes):
```bash
rm ~/.note-cli/notes.json
# Next command will create a new empty file
```

---

## Tips

**Pipe notes to other tools**:
```bash
# Count notes
note list --json | jq '.notes | length'

# Search notes
note list --json | jq '.notes[] | select(.content | contains("meeting"))'

# Export to CSV
note list --json | jq -r '.notes[] | [.id, .content, .createdAt] | @csv'
```

**Shell integration**:
```bash
# Quick add with alias
alias n='note add'
n "Quick thought"
```

**Scripting**:
```bash
# Check exit codes
note add "test"
if [ $? -eq 0 ]; then
  echo "Success"
fi
```

---

## Troubleshooting

**Problem**: `command not found: note`
**Solution**: Run `npm install -g .` from the project directory

**Problem**: `EACCES: permission denied`
**Solution**: Ensure `~/.note-cli/` directory has write permissions

**Problem**: `Error: Invalid JSON in notes file`
**Solution**: The `notes.json` file is corrupted. Restore from backup or reset:
```bash
cp ~/.note-cli/notes.json ~/.note-cli/notes.corrupted.json
rm ~/.note-cli/notes.json
note list  # Creates new empty file
```

---

## Next Steps

- Add more notes and explore prefix matching
- Integrate with your daily workflow using shell aliases
- Backup your notes periodically

For issues or feature requests, see the project README.
