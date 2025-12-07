/**
 * Tag utility functions for parsing, normalizing, and validating tags
 * Following clarification decisions from spec.md
 */

/**
 * Parse comma-separated tag string into array
 * @param input - Comma-separated tag string (e.g., "work, urgent, personal")
 * @returns Array of parsed tags (not yet normalized)
 */
export function parseTags(input: string): string[] {
  if (!input || input.trim() === '') {
    return []
  }
  return input.split(',')
}

/**
 * Normalize tags according to clarification rules:
 * 1. Lowercase
 * 2. Trim whitespace
 * 3. Replace spaces with hyphens
 * 4. Filter empty strings
 * 5. Deduplicate
 *
 * @param tags - Array of raw tag strings
 * @returns Array of normalized tags
 */
export function normalizeTags(tags: string[]): string[] {
  const normalized = tags
    .map(tag => tag.trim())                    // Trim whitespace
    .filter(tag => tag.length > 0)             // Filter empty strings
    .map(tag => tag.replace(/\s+/g, '-'))      // Replace spaces with hyphens
    .map(tag => tag.toLowerCase())             // Lowercase

  // Deduplicate using Set
  return Array.from(new Set(normalized))
}

/**
 * Validate tag length (max 50 characters)
 * @param tag - Normalized tag string
 * @throws Error if tag exceeds 50 characters
 */
export function validateTagLength(tag: string): void {
  const MAX_LENGTH = 50
  if (tag.length > MAX_LENGTH) {
    throw new Error(`Tag "${tag.slice(0, 20)}..." exceeds ${MAX_LENGTH} character limit`)
  }
}

/**
 * Validate all tags in array
 * @param tags - Array of normalized tags
 * @throws Error if any tag is invalid
 */
export function validateTags(tags: string[]): void {
  for (const tag of tags) {
    validateTagLength(tag)
  }
}
