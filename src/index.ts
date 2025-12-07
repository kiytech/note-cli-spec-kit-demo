#!/usr/bin/env node

import { addCommand } from './commands/add'
import { listCommand } from './commands/list'
import { deleteCommand } from './commands/delete'

const [,, command, ...args] = process.argv

try {
  switch (command) {
    case 'add': {
      // Extract --tags option
      const tagsIndex = args.indexOf('--tags')
      let tags: string | undefined
      let contentArgs = args

      if (tagsIndex !== -1 && args[tagsIndex + 1]) {
        tags = args[tagsIndex + 1]
        contentArgs = args.filter((_, i) => i !== tagsIndex && i !== tagsIndex + 1)
      }

      addCommand(contentArgs.join(' '), tags)
      break
    }
    case 'list':
      listCommand(args)
      break
    case 'delete':
      deleteCommand(args[0])
      break
    case 'help':
    case '--help':
      console.log('Usage: note <add|list|delete> [args]')
      console.log('\nExamples:')
      console.log('  note add "Buy groceries"')
      console.log('  note add "Team meeting" --tags "work, urgent"')
      console.log('  note list')
      console.log('  note list --json')
      console.log('  note list --tag work')
      console.log('  note delete 550e')
      break
    default:
      console.error(`Unknown command: ${command}`)
      console.error('Run "note --help" for usage')
      process.exit(1)
  }
} catch (error) {
  console.error(`Error: ${error instanceof Error ? error.message : String(error)}`)
  process.exit(1)
}
