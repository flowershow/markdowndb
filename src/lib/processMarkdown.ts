import { parseFile, ParsingOptions, WikiLink } from "./parseFile.js";
import { Root } from "remark-parse/lib/index.js";
import { MetaData, Task } from "./schema.js";

/**
 * Result of processing a markdown file or string.
 */
export interface MarkdownProcessorResult {
  /**
   * The abstract syntax tree (AST) of the markdown content.
   */
  ast: Root;
  /**
   * Metadata extracted from frontmatter and body.
   * Always includes `tags` (array of strings from frontmatter and body)
   * and `tasks` (array of task objects from checklist items).
   */
  metadata: MetaData & {
    tags: string[];
    tasks: Task[];
  };
  /**
   * Links found in the markdown content (wiki-style links, regular links, images).
   */
  links: WikiLink[];
}

/**
 * Options for processing markdown content.
 */
export type MarkdownProcessorOptions = ParsingOptions;

/**
 * Process a single markdown file or string and extract structured data.
 * 
 * This function is designed for processing individual markdown files without
 * requiring a full folder context or database. It's ideal for use cases like:
 * - Cloudflare Workers
 * - Edge functions
 * - Single file processing
 * - Streaming content processing
 * 
 * **Note**: This function processes markdown in isolation and does NOT:
 * - Compute backlinks (requires knowledge of other files)
 * - Resolve Obsidian-style shortest path links (requires folder context)
 * - Store results in a database
 * 
 * **Why this wrapper exists**: While this function internally uses `parseFile`,
 * it serves as the stable public API with comprehensive documentation for
 * end-users. This allows internal refactoring without breaking the public API.
 * 
 * @param source - The markdown content as a string
 * @param options - Optional configuration for parsing
 * @returns Processed markdown data including AST, metadata, links, tags, and tasks
 * 
 * @example
 * ```typescript
 * import { processMarkdown } from 'mddb';
 * 
 * const markdown = `---
 * title: My Document
 * tags: [javascript, tutorial]
 * ---
 * 
 * # Hello World
 * 
 * This is a [[wiki-link]] and a [regular link](./other.md).
 * 
 * - [ ] This is a task
 * `;
 * 
 * const result = processMarkdown(markdown);
 * console.log(result.metadata.title); // "My Document"
 * console.log(result.metadata.tags); // ["javascript", "tutorial"]
 * console.log(result.links); // Array of link objects
 * ```
 * 
 * @example
 * ```typescript
 * // With options
 * const result = processMarkdown(markdown, {
 *   from: "blog/post.md", // Source file path for resolving relative links
 *   remarkPlugins: [myCustomPlugin], // Custom remark plugins
 * });
 * ```
 */
export function processMarkdown(
  source: string,
  options?: MarkdownProcessorOptions
): MarkdownProcessorResult {
  const result = parseFile(source, options);
  
  // parseFile always sets tags and tasks in metadata
  // This type assertion is safe because parseFile guarantees these properties exist
  return result as MarkdownProcessorResult;
}
