/**
 * Date formatting utilities
 * Converts ISO 8601 timestamps to human-readable formats
 */

/**
 * Format ISO 8601 timestamp to YYYY-MM-DD HH:MM format
 * @param iso - ISO 8601 timestamp string
 * @returns Formatted date string
 *
 * @example
 * formatTimestamp('2025-12-06T10:30:00.000Z') // '2025-12-06 10:30'
 */
export function formatTimestamp(iso: string): string {
  const date = new Date(iso)
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}
