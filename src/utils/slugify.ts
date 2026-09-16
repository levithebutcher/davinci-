/**
 * Converts a string into a clean, URL-safe slug.
 * e.g., "Color Grading: Mastering Scopes & Nodes!" -> "color-grading-mastering-scopes-nodes"
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .normalize('NFD') // normalize accented characters
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '') // remove invalid chars
    .replace(/[\s_-]+/g, '-') // collapse whitespace and underscores into single hyphens
    .replace(/^-+|-+$/g, ''); // trim leading & trailing hyphens
}
