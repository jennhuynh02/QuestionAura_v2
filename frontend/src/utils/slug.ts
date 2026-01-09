/**
 * Utility functions for converting between topic names and URL-friendly slugs.
 */

/**
 * Converts a topic name to a URL-friendly slug.
 * - Converts to lowercase
 * - Replaces spaces with hyphens
 * - Removes special characters (keeps only alphanumeric and hyphens)
 * 
 * @param name - The topic name to convert
 * @returns URL-friendly slug
 * 
 * @example
 * toSlug("Programming Basics") // "programming-basics"
 * toSlug("Finance & Investing") // "finance-investing"
 */
export function toSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove special characters except word chars, spaces, and hyphens
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
}

/**
 * Converts a slug back to a topic name format.
 * - Replaces hyphens with spaces
 * - Capitalizes words (title case)
 * 
 * Note: This is a best-effort conversion. For exact topic names,
 * always use the name returned from the API after fetching by slug.
 * 
 * @param slug - The URL slug to convert
 * @returns Formatted topic name
 * 
 * @example
 * fromSlug("programming-basics") // "Programming Basics"
 */
export function fromSlug(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

/**
 * Finds a topic ID by matching a slug to topic names.
 * Converts each topic name to a slug and compares with the provided slug.
 * 
 * @param slug - The URL slug to match
 * @param topics - Array of topic objects to search through
 * @returns Topic ID if found, null otherwise
 * 
 * @example
 * const topics = [{ id: 1, name: "Finance" }, { id: 2, name: "Programming" }];
 * getTopicIdFromSlug("finance", topics) // 1
 * getTopicIdFromSlug("programming", topics) // 2
 * getTopicIdFromSlug("unknown", topics) // null
 */
export function getTopicIdFromSlug(
  slug: string,
  topics: Array<{ id: number; name: string }>
): number | null {
  const matchingTopic = topics.find(
    (topic) => toSlug(topic.name) === slug.toLowerCase()
  );
  return matchingTopic ? matchingTopic.id : null;
}
